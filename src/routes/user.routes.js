import { Router } from "express";
import  { loginUser,  registerUser,logoutUser}  from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";




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
            name:"coverImage" , maxCount:1
        }
    ]
    ) ,
    registerUser)   


router.route("/login").post(loginUser)

//secure routes 
router.route("/logout").post(verifyJWT, logoutUser)

export default router   