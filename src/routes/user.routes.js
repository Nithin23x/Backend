import { Router } from "express";
import  {noiceUser, registerUser}  from "../controllers/user.controller.js";


const router = Router() 

//here the register route will be appended to users to the router will be /users/register and
// registerUser controller will be triggered
router.route("/register").get(registerUser)    
router.route("/noice").post(noiceUser) 


export default router  