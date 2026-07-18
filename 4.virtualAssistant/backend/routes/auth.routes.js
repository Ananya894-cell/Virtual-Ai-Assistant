import express from "express"
import { signUp, Login, Logout } from "../controllers/auth.controllers.js";


const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/login",Login)
authRouter.get("/logout",Logout)

export default authRouter;