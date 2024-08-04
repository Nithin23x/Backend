// IIFE (Immediately Invoked Function Expression) ;()()
// Two important rules 1. Use try-catch for DB connection 
//2.If DB is in another contient then use async blocks 

//  This is second approach it is proffessional and used.we import files from 
//  another sources like DB_NAME,models etc 
//require('dotenv').config({path:{'./env'}})

// "-r dotenv/config --experimental-json-modules" in "run dev" is important for loading env modules into code 

import dotenv from 'dotenv'
import { connectDB } from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.get('/',(req,res) =>{
        res.send("Hello")
    })
    app.listen(process.env.PORT||9000,() =>{
        console.log('Server is up and running');
    })
})
.catch((e)=>{console.log("MongoDb connection Error" ,e);})





// This is first approach for DB connection not so proffessional 
//import express from "express";
// const app = express() 
// ;(
//     async() =>{
//         try {
//            await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//            app.on("error", (error) =>{
//                 console.log('Application cannot connect',error);
//                 throw error
//            })

//            app.listen(process.env.PORT, ()=>{
//                 console.log(`App is running at port ${process.env.PORT}`)
//            })
//         } catch (error) {
//             console.log('Error' , error);
//             throw error
//         }
//     }
// )()