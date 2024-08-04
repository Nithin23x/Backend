import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:[true,"Password is required"],
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avtar:{
        type:string, //url  from third party 
        required:true
    },
    coverimage:{
        type:string, //url  from third party 
    },
    history:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Video'
        }
    ],
    refreshTokens:{
        type:String
    }

},{timestamps:true})

userSchema.pre("save", async function(next) { // we are not using arrow func beacuse they do not have "this" access 
    // "pre" hook is used to perform operations just before the data goes into the database it has first paramters like save,
    //createone,validate,updateone etc.Here save is pre-defined operation 
    
    //here we are hasing the password with bcrypt library 

    if(!this.isModified("password")) return next() 

    this.password = bcrypt.hash(this.password,10) //hasing the password 
    next()
})

//.methods allows to write user-defined functions 

userSchema.methods.isPasswordCorrect = async function(password) {
   await bcrypt.compare(password,this.password) //comparing passwords 
}

userSchema.methods.generateAccessToken = function() {
    jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function() {
    jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            fullName:this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('User', userSchema)