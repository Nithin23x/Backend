import { Router } from "express";
import  { registerUser}  from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router() 

//here the register route will be appended to users to the router will be /users/register and
// registerUser controller will be triggered

//to access the file uplad funtionality, we use multer's upload which is executes just
//before the "registeruser" controller 

router.route("/register").post(
    upload.fields([
        {
            name:"avatar", maxCount:1
        },
        {
            names:"coverImage" , maxCount:1
        }
    ]
    ) ,
    registerUser)   


export default router  