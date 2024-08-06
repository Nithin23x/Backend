import asyncHandler from '../utils/asyncHandler.js'
//In asyncHandler we directly send the function as paramter
//and insdie the asyncHandler it will be called and exceuted as Promise 

 const registerUser  = asyncHandler( async (req,res) =>{
    res.status(200).json({
        message:"Nithin "
    })
})

 const noiceUser = asyncHandler( async (req,res) =>{
    res.json({
        number : "34"
    })
})



 export  {registerUser,noiceUser} 