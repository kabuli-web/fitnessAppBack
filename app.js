const express = require('express')
const connectionString = "mongodb://localhost:27017/fitness"
const app = express()
const mongodb = require("mongoose")
// const fs = require('fs');
const CustomError = require("./Views/Response/CustomError.js")
const Merchant  = require('./Models/User.js');
const cors = require('cors')

const UserRoute = require('./Routes/User.js')

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

app.use('/User' ,UserRoute)

app.get('/hello',async(req,res)=>{
    res.status(200).json({
        success:true,
        message: "hello"
    })
})

let PORT = process.env.PORT
app.listen( PORT||5000 ,()=>{
    console.log("Started Listening at port="+ PORT)
})