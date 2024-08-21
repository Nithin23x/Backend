import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
    subscriber:{
        type:String,
        required:true,
        trim:true
    },
    channel:{
        type:String,
        required:true,
        trim:true
    }
},{timeStamps:true})