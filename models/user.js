const mongoose = require("mongoose");

const User = new mongoose.Schema(
{
    fname:{
        type:String,
        required: true,
    },
    lname:{
        type:String,
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true
    }
}
)

module.exports= mongoose.model("UserDetails", User);