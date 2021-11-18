const  mongoose = require('mongoose');



const MerchantSchema = new mongoose.Schema({
    salla_id : Number,
    name : String,
    email : String,
    mobile : String,
    role : String,
    created_at : Date,
    store : 
    {
        id: String,
        owner_id: Number,
        owner_name: String,
        username: String,
        name: String,
        avatar: String,
        store_location: String,
        plan: String,
        status: String,
        created_at: Date
    },
    password : String,
    active: {default:true,type:Boolean},
    token:{
        access_token:String,
        refresh_token:String,
        expires_in:Number,
        scope:String,
        token_type:String
    },
    TrialStartDate:{default:Date.now(),type:String},
    plan:{default:"trial",type:String}
})

module.exports = mongoose.model("Merchant",MerchantSchema)