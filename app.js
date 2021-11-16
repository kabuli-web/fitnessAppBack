const express = require('express')
const connectionString = "mongodb://localhost:27017/salla"
const app = express()
const mongodb = require("mongoose")
const fs = require('fs');
const axios = require('axios');
const Merchant  = require('./Models/Merchant.js');

require('dotenv').config()
try {
    mongodb.connect(connectionString,{useNewurlParser:true},(err)=>{
        if(err!=null){
            console.log(err)
        }else{
            console.log("Mongo Connected")
        }});
} catch (error) {
    console.log(error)
}

app.use(express.json())
app.get('/salla/authCallback',async (req,res)=>{
    // let code = '2Vam19S5RLjjAt30w9lTDn67YeNrdCRiWc1aQyW0hX8.&&&aVUMys1yxncCPFGu0k5XYy5slZDfmevyNIrl'
    let code = req.query['code']
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
    params.append("redirect_uri","http://localhost:5000/salla/authCallback")

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
                            plan : null,
                            active: null,
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
let PORT = process.env.PORT
app.listen( PORT||5000 ,()=>{
    console.log("Started Listening at port="+ PORT)
})