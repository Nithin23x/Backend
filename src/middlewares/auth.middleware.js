import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler( async(req,res,next) =>{
    try {
        
        //verifyJWT is used check wether the user is authenticated or not. i.e if user does not have an access token 
        //then they are not authenticated.
        //this funtionality is later used in likes,comments,uploading images etc 
        //we need to verify JWT for authenticated service 


        const token = req.cookies?.accessToken // || req.header("Authorization")?.replace("Bearer ","") this is for devices like mobiles 
        //where they store tokens in headers ("authorization ").Its not that important now 
    
        if(!token) {
            throw new ApiError(401,"Unauthorized request ")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user) {
            throw new ApiError(401,"Invalid Access Token")
        }

        req.user = user //adding new object in req "user" this "user" obj will be accessible to the 
        //logout controller for accessing the user from DB 

        next() //next() is flag which passes the operation status to upcoming process 
        //in this case next() flag passes the status to logout controller.

    } catch (error) {
        throw new ApiError(401,"Something went wrong")
    }
    

})
