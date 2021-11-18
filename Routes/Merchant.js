const express = require('express')
const MerchantAuthMiddleWare = require('../Middlewares/MerchantAuth.js')
const Merchant  = require('../Models/Merchant.js');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const axios = require('axios');
const CustomError = require("../Views/Response/CustomError.js")

const router = express.Router()
var unless = function(middleware, ...paths) {
    return function(req, res, next) {
      const pathCheck = paths.some(path => path === req.path);
      pathCheck ? next() : middleware(req, res, next);
    };
  };
router.use(unless(MerchantAuthMiddleWare, "/Login","/SetPassword"));
router.post("/Login",async (req,res)=>{
    const {  email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("Email or password is missing");
      return
    }

    try {

        let merchant = await Merchant.findOne({email});
        if(merchant==null){
            CustomError(res,"No user Found","Merchant user not found in db",404)
            return
        }
        let passCorrect = await bcrypt.compare(password,merchant.password);
        if(passCorrect){
            const token = await jwt.sign(
                {merchant_id:merchant._id,email},
                process.env.TOKEN_KEY,
                {
                    expiresIn: "10d"
                }
            )
            res.status(200).json({
                success:true,
                token:token
            })
            return
        }
        CustomError(res,"Wrong credentials","Wrong password provided",401)
        return;
    } catch (error) {
        console.log(error)
        CustomError(res,"error getting merchant",error,500)
        return;
    }
    return
})
router.get('/authCallback',async (req,res)=>{
    // let code = '2Vam19S5RLjjAt30w9lTDn67YeNrdCRiWc1aQyW0hX8.&&&aVUMys1yxncCPFGu0k5XYy5slZDfmevyNIrl'
    let code = req.body.code
    // let code = "XZg-7g9TJwe8pOrwHemdkPfcTgptyGgKZLqBH1CaTIQ.W3HKyn54DHMRhU-0jClCn969GAmRtSMLMgPu90gpZio"
    let scope = req.query['scope']
    let state = req.query['state']
    let ClientId = process.env.CLIENTID
    let ClientSecret = process.env.CLIENTSECRET
    let headers = {
        "Content-Type":"application/x-www-form-urlencoded"
    }
    let config = {
        headers:headers
    }
    let params = new URLSearchParams();
    params.append("grant_type",'authorization_code')
    params.append("client_id",ClientId)
    params.append("client_secret",ClientSecret)
    params.append("code",code)
    // params.append("redirect_uri","http://localhost:5000/salla/authCallback")

    await axios.post(process.env.BASE_URL+process.env.SALLA_TOKEN_URL,params,config).then(async (response)=>{
        
        // res.json({responseBody:response.data})
        // return;
        let access_token = response.data.access_token
        let expires_in = response.data.expires_in
        let refresh_token = response.data.refresh_token
        let scope = response.data.scope
        let token_type = response.data.token_type
        let headers = {
            Authorization: `Bearer ${access_token}`
        }
        
        await axios({
            method:'get',
            baseURL:process.env.BASE_URL,
            url:process.env.SALLA_USER_INFO_URL,
            headers:headers
        }).then(async(resp)=>{
            // res.json({responseBody:resp.data})
            // return;
            if(resp.data.data!=undefined && resp.data.data!=null){
                try {
                    var merchantExist =  await Merchant.findOne({'email':resp.data.data.email})
                    if(merchantExist==null){
                        let merchatnData = resp.data.data;
                        var merchant = new Merchant({
                            salla_id:merchatnData.id,
                            name:merchatnData.name,
                            email:merchatnData.email,
                            mobile:merchatnData.mobile,
                            role:merchatnData.role,
                            created_at:merchatnData.created_at,
                            store:{
                                id:merchatnData.store.id,
                                owner_id:merchatnData.store.owner_id,
                                owner_name:merchatnData.store.owner_name,
                                username:merchatnData.store.username,
                                name:merchatnData.store.name,
                                avatar:merchatnData.store.avatar,
                                store_location:merchatnData.store.store_location,
                                plan:merchatnData.store.plan,
                                status:merchatnData.store.status,
                                created_at:merchatnData.store.created_at
                            },
                            password : null,
                            token:{
                                access_token:access_token,
                                refresh_token:refresh_token,
                                expires_in:expires_in,
                                scope:scope,
                                toke_type:token_type
                            }
                        });
                        merchant.save()
                        res.json({message:"hello", merchant: merchant})
                        return;
                    }else{
                        merchantExist.token = {
                            access_token:access_token,
                            refresh_token:refresh_token,
                            expires_in:expires_in,
                            scope:scope,
                            token_type:token_type
                        }
                        await merchantExist.save();
                        res.json({message:"hello", merchant: merchantExist})
                        return;
                    }
                } catch (er) {
                console.error(`Error creating merchant= ${er.stack}`)
                }
            }else{
            console.error(`Error getting user info no Data field found in body of response `)
            }
        }).catch((error)=>{
            console.error(`Error getting user info error= ${error}`)
            res.json({responseBody:error.response.data})
            return;
        })
    }).catch((err)=>{
        console.error(`Error getting access token error= ${err}`)
        if(err.data!=null && err.data!=undefined){
            res.json({
                data:err.response.data,
                errorText:err.response.statusText
            })
            return;
        }else{
            res.json(err)
        }
    })
    return;
})
router.post("/SetPassword",async (req,res)=>{
    let merchant_id =  req.body.merchant_id
    let access_token =  req.body.access_token
    let password =  req.body.password
    if(merchant_id==null || merchant_id==undefined || access_token==null || access_token==undefined){
        CustomError(res,'required data missing',"merchant id or acces code missing")
        return;
    }
    if(password==null || password==undefined ){
        CustomError(res,'required data missing',"password missing")
        return;
    }

    let merchant  = await Merchant.findById(merchant_id);
    if(merchant==null){
        CustomError(res,'Does not exist',"Merchant does not exist",404)
        return;
    }
    if(merchant.token.access_token!=access_token){
        CustomError(res,'wrong data',"wrong access token provided")
        return;
    }
    merchant.password = await bcrypt.hash(password,10);
    await merchant.save()
    res.status(200).json({
        success:true,
        message: "you can login with your salla email"
    })
})

module.exports = router;