import express, { json } from "express";
import cookieParser from "cookie-parser"; 
import cors from 'cors'

const app = express()

// app.use() means we are configuring the middlewares 

app.use(cors({
    origin:process.env.CORS_ORIGIN, //white-listing the URL's. In origin url "*" means allow from anywhere 
    credentials:true // there are other methods alos ctrl+click
}))

app.use(express.json({limit:"16kb"})) //accepting json and limiting the json size to 16kb
app.use(express.urlencoded({extended:true,limit:'16kb'})) // url encoding 
app.use(express.static('public')) // loading the assests from public folder 
app.use(cookieParser()) // accessing cookies from client and perform CRUD operations

//routes import 
import router from "./routes/user.routes.js";

//route declaration 
//here the routes will be used as middleware app.use()
//At starting we use to write "app.get('/',()=>{})" i.e, we used to give route and controller at the same place
//now we have  separated routes and controller, it should be used as middleware  

app.use("/api/v1/users",router) //when user enters /users then router will be triggered

export  default app 