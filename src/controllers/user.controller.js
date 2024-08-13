 import asyncHandler from '../utils/asyncHandler.js'
 import { ApiError } from '../utils/ApiError.js'
 import {ApiResponse} from '../utils/ApiResponse.js'
 import {User} from '../models/user.models.js'
import { fileUpload } from '../utils/cloudinary.js'


// //In asyncHandler we directly send the function as paramter
// //and insdie the asyncHandler it will be called and exceuted as Promise 

 const registerUser  = asyncHandler( async (req,res) =>{
    
    //Steps for registering users 
    //1.Get the data from frontend(forms)
    //2.validation of the data... like checking the email format, username format,username being empty etc..
    //3.check if user already exists with email or username. anyone 
    //4.check for images/files , in our avtar 
    //5.upload them on cloudinary -> returns a url 
    //6.create user object -> create entry in DB 
    //7.remove password and refresh tokens from response 
    //8.check for user creation response  and return response 

    //1.getting the data from client
    const {fullName,email,username,password} = req.body   

    //2.Validation 
    if(
        [fullName,email,username,password].some(
            (eachField) => eachField?.trim() === ""  
        )
    ){
        throw new ApiError(400,"All fields are required ")
    }

    //3.checking wether user already exists
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser) {
        throw new ApiError(409,"User already exists") 
    }

    const avatarLocalPath = req.files?.avatar[0].path 
    
    console.log("\n Files",req.files) 
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    // const coverImage = req.files?.coverImage
    // console.log("\n",coverImages,"\n") 
    //there is error in form-data post-method 
    //upload.fields only taking first parameter and ignoring other parameters so we left out coverImage 

    //upload on cloudinary 

    const avatar = await fileUpload(avatarLocalPath)
    //const coverImage = await fileUpload(req.body.coverImage)

    if(!avatar) {
        throw new ApiError(400,"Avatar file is important")
    }


   const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser) {
        throw new ApiError(500,"Something went wrong wile registering user")
    }

  return res.status(201).json(
    new ApiResponse(200,createdUser,"User created Successfully")
)
})

    

export  {registerUser} 