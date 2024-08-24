import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema({
    subscriber:{
        type:String,
        required:true,//user who is subscribing to a channel 
        trim:true
    },
    channel:{
        type:String,
        required:true,//channel where users subscribe 
        trim:true
    }
},{timeStamps:true})

export const Subscription = mongoose.model(
    "Subscription",subscriptionSchema
)