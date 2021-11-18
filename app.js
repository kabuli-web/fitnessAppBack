const express = require('express')
const connectionString = "mongodb://localhost:27017/salla"
const app = express()
const mongodb = require("mongoose")
// const fs = require('fs');
const CustomError = require("./Views/Response/CustomError.js")
const Merchant  = require('./Models/Merchant.js');
const cors = require('cors')

const merchantRoute = require('./Routes/Merchant.js')

app.use(cors({origin:"*"}))

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

app.use('/Merchant' ,merchantRoute)

app.post('/salla/authTest',async(req,res)=>{
    try {
        let merchant = await Merchant.findById(req.body.id);
        
        res.status(200).json({
            success:true,
            merchant:merchant
        })
        return;
    } catch (error) {
        console.log(error.stack)
        CustomError(res,"error getting merchant",error.stack,500)
        return
    }
    return
})

let PORT = process.env.PORT
app.listen( PORT||5000 ,()=>{
    console.log("Started Listening at port="+ PORT)
})