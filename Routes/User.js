const express = require('express')
const UserAuthMiddleWare = require('../Middlewares/UserAuth.js')
const User  = require('../Models/User.js');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const axios = require('axios');
const {error} = require("../Views/Response/CustomError.js")
const helpers = require("../Helpers/helpers.js")
const router = express.Router()
var unless = function(middleware, ...paths) {
    return function(req, res, next) {
      const pathCheck = paths.some(path => path === req.path);
      pathCheck ? next() : middleware(req, res, next);
    };
  };
router.use(unless(UserAuthMiddleWare, "/Login","/Register"));
router.post("/Login",async (req,res)=>{
    const {  email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("Email or password is missing");
      return
    }

    try {

        let user = await User.findOne({email});
        if(user==null){
            error(res,"No user Found","Merchant user not found in db",404)
            return
        }
        let passCorrect = await bcrypt.compare(password,user.password);
        if(passCorrect){
            user.password = null;
            const token =  jwt.sign(
                {user_id:user._id,email},
                process.env.TOKEN_KEY,
                {
                    expiresIn: "10d"
                }
            )
            res.status(200).json({
                success:true,
                token:token,
                user: user
            })
            return
        }
        error(res,"Wrong credentials","Wrong password provided",401)
        return;
    } catch (err) {
        console.log(err)
        error(res,"error Loging ",err,500)
        return;
    }
    return
})
router.get("/",async (req,res)=>{
try{
    let user = await User.findById(req.user.user_id);
        if(user==null){
            error(res,"No user Found","Merchant user not found in db",404)
            return
        }
    res.status(200).json({
        success:true,
        user: user
    })
    return
}
catch (err) {
    console.log(err)
    error(res,"error Loging ",err,500)
    return;
}
    
})
router.post("/Register",async (req,res)=>{
    let email =  req.body.email
    let password =  req.body.password
    console.log(req.body)
    if(helpers.isBad(email) || helpers.isBad(password) || helpers.isBad(req.body.username)){
        error(res,'required data missing',"User email or password missing")
        return;
    }
  

    
   
    hashedPassword = await bcrypt.hash(password,10);
    let user = new User({
        email:email,
        password : hashedPassword
    })
    await user.save()
    const token = await jwt.sign(
        {user_id:user._id,email},
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
    
})

router.post("/SetInfo",async (req,res)=>{
    
    try {

        let user = await User.findById(req.user.user_id);
        if(user==null){
            error(res,"No user Found","Merchant user not found in db",404)
            return
        }
        if(helpers.isBad(req.body.userInfo)){
            error(res,`No userInfo Provided Schema    info : 
            {
                heigth: Number,
                weight:Number,
                fat:String,
                goal:String,
                gender:String
            }`,error,400)
            return;
            }
            user.info = req.body.userInfo;
            
            await user.save()

            res.status(200).json({
                success:true,
                userInfo:user.info
            })
            return
        
        
    } catch (err) {
        console.log(err)
        error(res,"error adding info",err,500)
        return;
    }
    return
})

router.post("/SetGoal",async (req,res)=>{
    
    try {

        let user = await User.findById(req.user.user_id);
        if(user==null){
            error(res,"No user Found","Merchant user not found in db",404)
            return
        }
        if(helpers.isBad(req.body.goal)){
            error(res,`No goal Provided Schema    goal:String`,error,400)
            return;
            }
            user.info.goal = req.body.goal;
            
            await user.save()

            res.status(200).json({
                success:true,
                goal:user.info.goal
            })
            return
        
        
    } catch (err) {
        console.log(err)
        error(res,"error setting  goal",err,500)
        return;
    }
    
})
router.post("/AddIntake",async (req,res)=>{
    
    try {

        let user = await User.findById(req.user.user_id);
        if(user==null){
            error(res,"No user Found","Merchant user not found in db",404)
            return
        }
        if(helpers.isBad(req.body.Intake)){
            error(res,`No intake Provided Schema    Intake:Object`,error,400)
            return;
            }
            user.intakes.push(req.body.Intake);
            
            await user.save()

            res.status(200).json({
                success:true,
                intakes:user.intakes
            })
            return
        
        
    } catch (err) {
        console.log(err)
        error(res,"error Adding Intake ",err,500)
        return;
    }
    
})
router.post("/RemoveIntake",async (req,res)=>{   
    try {

        let user = await User.findById(req.user.user_id);
        if(user==null){
            error(res,"No user Found","Merchant user not found in db",404)
            return
        }
        console.log(user)
        if(helpers.isBad(req.body.Intake)){
            error(res,`No intake Provided Schema    Intake:Object`,error,400)
            return;
            }
           
            let key=null;
           
            user.intakes.forEach((el,k)=>{
                console.log("dd")
                console.log(el.id,req.body.Intake.id)
                if(el.id.toString()===req.body.Intake.id.toString()){
                    key = k
                    return
                }
            })
            console.log("key= " + key)
           
            if(key!==null){
                user.intakes.splice(key,key+1)
            }
            await user.save()

            res.status(200).json({
                success:true,
                intakes:user.intakes
            })
            return
        
        
    } catch (err) {
        console.log(err.toString())
        error(res,"error Removeing Intake ",err,500)
        return;
    }
    
})

router.get("/GetIntakes",async (req,res)=>{
    
    try {

        let user = await User.findById(req.user.user_id);
        if(user==null){
            error(res,"No user Found","Merchant user not found in db",404)
            return
        }
        
            res.status(200).json({
                success:true,
                intakes:user.intakes
                
            })
            return
        
        
    } catch (err) {
        console.log(err)
        error(res,"error Adding Intake ",err,500)
        return;
    }
    
})
module.exports = router;