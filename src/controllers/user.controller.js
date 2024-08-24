import asyncHandler from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {User} from '../models/user.models.js'
import { fileUpload } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'
import mongoose, { mongo } from 'mongoose'


// //In asyncHandler we directly send the function as paramter
// //and insdie the asyncHandler it will be called and exceuted as Promise 

const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId) //User is from export User in user.model.js.It connects the model and methods in mongoDB
        const accessToken = user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()  

        user.refreshToken = refreshToken // assigning the refresh token into the User model and saving it in database 
        await user.save({validateBeforeSave:false})  // it only lets save the document does not trigger any "save" methods associated to it 

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Cannot generate access and refresh tokens for given user")
    }
}

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

    //there is an error in form-data post-method 
    //upload.fields only taking first parameter and ignoring other parameters so we left out coverImage.we'll see it later

    //for coverimage we directly upload the file to cloudinary because multer.fields is not working properly 

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

const loginUser = asyncHandler( async (req,res) =>{
    //user login workflow 
    //1.Get the data from user(username or email,password)
    //2.username based login or email based login 
    //3.Find the user based on email or username 
    //4.check the password 
    //5.generate the access and refresh token  
    //6.send cookies 

    //1.Get the data 
    const {username,email,password} = req.body
    //2.username based login or email based login
    if(!(username || email)) {
        throw new ApiError(400,"Username or Email is required")
    }

    //3.Find the user 
    const findUser =  await User.findOne({
        $or : [{username}, {email}]  //"or" operation on username and email 
    })

    if(!findUser) {
        throw ApiError(404, "User not found or does not exist")
    }

    //4.check the passowrd 
    const passwordCheck = await findUser.isPasswordCorrect(password) 

    if(!passwordCheck) {
        throw new ApiError(401, "Incorrect password ")
    } 

    //5.Generate access and refresh tokens 
    //we use access and refresh tokens many times. we are making them into reusablle methods
    const {accessToken,refreshToken}= await generateAccessAndRefreshToken(findUser._id) // this method is associated with database query so we awaited it 

    //6.Send them in cookies 
     const cookieUserData = await User.findById(findUser._id).select(
        "-password -refreshToken"
     ) // querying the data to send them in cookies to user
     // the "select" method deselects/removes the mentioned parameters from the result query

     const options = {
        httpOnly:true,
        secure:true 
     } // options for cookies,and these are modifiable only from server (security steps)

     return res.status(200)
     .cookie("accessToken", accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(200,{
            user:cookieUserData, accessToken,refreshToken
        },"User Login Successfully"
    )
     )



} )
    
const logoutUser = asyncHandler( async(req,res) =>{
    //To achieve the logout for a user we need to clear their cookies from the DB.(Access token , refresh token)
    console.log(req.user) 

    User.findByIdAndUpdate(
        req.user._id ,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    ) //making refreshToken undefined in DB as the user is logging out 

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged out.")
    )

    
})

const regenerateAccessToken = asyncHandler(async (req,res,next) =>{
    //1.we need to access the refresh token from req.cookies
    //2.then we verify it with the secret key.If it's success then 
    //we search the user on basis of decoded refresh token 
    //since we only stored user._id we get _id as result.so we search user on basis of _id
    //3.And then we call the generateAccessAndRefreshToken() method to create the two tokens

   const existingRefreshToken =  req.cookies?.refreshToken //optional req.body.refreshToken for mobile users

   if(!existingRefreshToken){
    throw new ApiError(401,"Refresh Token not found")
   }

   //verifying the refreshToken with secret key.
   //if the verify is success
    try {
    
       const decodedToken = jwt.verify(existingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
       
       const regenUser = await User.findById(decodedToken?._id) 
    
       if(!regenUser) {
        throw new ApiError(401,"Invalid refresh token")
       }
    
       //comparing the existingRefreshToken and DB refreshToken
       if(existingRefreshToken !== regenUser.refreshToken){
        throw new ApiError(401,"Refresh Token is expired")
       }
    
       const options = {
        httpOnly:true,
        secure:true
       }
    
       //generating new access and refresh tokens 
       const {accessToken,refreshToken} = await generateAccessAndRefreshToken(regenUser._id)
    
       return res
       .status(201)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",refreshToken,options) // options for cookies
       .json(
        new ApiResponse(
            200,
            {
                accessToken, refreshToken
            },
            "New Tokens Generated Successfully"
            
        )
       )
    } catch (error) {
        throw new ApiError(500,"Something Went Wrong")
    }

})

const changeCurrentPassword = asyncHandler(async(req,res ) =>{
    const {oldPassword,newPassword} = req.body

    //checking the old password tru or not 
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(400,"Invalid Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"New Password set")
    )
})

const getCurrentUser = asyncHandler(async (req,res ) =>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"Current user fetched ") //req.user is coming from verifyJWT middleware
    )
})

const updateAccountDetails = asyncHandler(async(req,res) =>{
    //advice:- for any updates relating to files we need to 
    //handle them in separate controllers to reduce the network bandwidth and faster,reliable upadates 

    const {fullName,email} = req.body

    if(!(fullName || email )){
        throw new ApiError(400,"All fields are required ")
    }

    const updatedUser = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,email
            }
        },
        {
            new:true  //this will enable the new savings made to the user
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedUser,"Account updated Successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req,res) =>{
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400,"User does not exist ")
    }

     //aggregrating on the user 
        const userChannel = await User.aggregate([
            {
                $match:{
                username:username?.toLowerCase()
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField: "channel", // this lookup is to find the subscribers of a user/channel
                    as:"subscribers"
                }
            },
            {
                $lookup:{
                    from:"subscriptions",
                    localField:"_id",
                    foreignField:"subscriber", //this lookup is to find how many channel(s) does a user subscribed
                    as:"subscribedChannels"

                }
            },
            {
                $addFields:{
                    subscriberCount: {
                        $size:"$subscribers"
                    },
                    subscribedChannels:{
                        $size:"$subscribedChannels"
                    },
                    isSubscribed:{
                        $cond: {
                            if:{$in: [req.user?._id,,"$subscribers.subscriber"]},
                            then:true,
                            else:false
                        }
                    }
                }
            },
            {
                $project:{
                    fullName:1,
                    username:1,
                    subscriberCount:1,
                    isSubscribed:1,
                    subscribedChannels:1,
                    avatar:1,
                    coverImage:1,
                    email:1,
                }
            }
        ])

     if(!userChannel) {
        throw new ApiError(404,"Channel does not exist")
     }
     console.log(userChannel) 

     return res
     .status(200)
     .json(
        new ApiResponse(200,userChannel,"User Channel fetched")
     )
     
})

const getUserHistory = asyncHandler(async() =>{
    const history = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1 
                                    }
                                }
                            ]
                        }
                    }  
                ]
            }
        }
    ])
})

export  {registerUser,loginUser,logoutUser,regenerateAccessToken,getUserChannelProfile,changeCurrentPassword,getCurrentUser,getUserHistory,updateAccountDetails}  