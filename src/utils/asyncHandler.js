// two ways of making async handlers 1.Promise method 2.try-catch 

//1.Promise 
const asyncHandler = (handlerFunc) => 
   ( (req,res,next) =>{
        Promise.resolve(handlerFunc(req,res,next)).catch(err => next(err)) 
    }
)

//directly returning the Promise .. 


export default asyncHandler




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


