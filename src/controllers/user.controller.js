 import asyncHandler from '../utils/asyncHandler.js'
 import { ApiError } from '../utils/ApiError.js'
 import {ApiResponse} from '../utils/ApiResponse.js'
 import {User} from '../models/user.models.js'
import { fileUpload } from '../utils/cloudinary.js'


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
    if(!username || !email) {
        throw ApiError(400,"Username or Email is required")
    }

    //3.Find the user 
    const findUser =  await User.findOne({
        $or : [{username}, {email}]  //or operation on username and email 
    })

    if(!findUser) {
        throw ApiError(404, "User not found or does not exist")
    }

    //4.check the passowrd 
    const passwordCheck = await findUser.isPasswordCorrect(password)

    if(!passwordCheck) {
        throw ApiError(401, "Incorrect password ")
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

})

export  {registerUser,loginUser}  