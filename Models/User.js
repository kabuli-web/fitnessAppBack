const  mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
    
    name : String,
    email : String,
    mobile : String,
    username:String,
    info : 
    {
        height: Number,
        weight:Number,
        age:Number,
        fat:String,
        goal:String,
        gender:String

    },
    intakes:[
        
    ],
    password : String,
   
    TrialStartDate:{default:Date.now(),type:String},
    plan:{default:"trial",type:String}
})

module.exports = mongoose.model("User",UserSchema)