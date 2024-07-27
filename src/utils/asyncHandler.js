// two ways of making async handlers 1.Promise method 2.try-catch 

//1.Promise 
const asyncHandler = (func) =>{
    (req,res,err,next) =>{
        Promise.resolve(
            func(req,res,err,next)
        ).catch(err => next(err))
    }
}


// const asyncHandlers = (fn) => {() =>{}}
// const asyncHandlers = (fn) => async() =>{}

//2.try-catch
// const asyncHandler =(func) => async(err,req,res,next) =>{
//     try {
//         await func(err,req,res,next) 
//     } catch (error) {
//         res.status(error.code || 500 ).json({
//             success:false ,
//             message:error.message
//         })
//     }
// }



export  {asyncHandler}