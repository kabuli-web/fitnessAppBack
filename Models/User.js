const  mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
    
    name : String,
    email : String,
    mobile : String,
    info : 
    {
        heigth: Number,
        weight:Number,
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