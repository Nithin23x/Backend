import mongoose from "mongoose"; //mongoDB for javascript 
import { DB_NAME } from "../constants.js"; 

// checking the import statements is also important sometimes we need to give full naming conventions 
// like './constants' to './constants.js'  and './db' to './db.index.js' 

//for DB connection we need two things : 1.async 2.try-catch 

//for DB connection we can use wrapper functions to make them re-usable in utils folder

const connectDB = async () =>{
    try {
       const connectResponse =  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`) 
       //mongoDB url for connection to Mongo Atlas interface with DB name 
       console.log(`MongoDB is connected ${connectResponse.connection.host} \n`)
       console.log(`DB name ${connectResponse.connection.name}`)
    } catch (error) {
        console.log("DB Connection Eroor", error) 
        process.exit(1) 
        //process is our application reference which is to be exit with codes such as 0,1 etc depending error 
        // 1 refers to node failure . or we can also use throw(error)
    }
}

export {connectDB}