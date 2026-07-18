import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const existEmail=await User.findOne({email})
        if(existEmail){
            return res.status(400).json({message:"Email already exists!"})
        }

        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters long !"})
        }

        const hashedPassword=await bcrypt.hash(password,10)

        const user = await User.create({ name, password:hashedPassword, email
        })

        const token=await genToken(user._id)

        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:30*24*60*60*1000
        })
       return res.status(201).json(user)

    } catch (error) {
        return res.status(500).json({ message: `signUp error: ${error}` })
}
}
 
//Login controller//
export const Login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"Invalid email or password !"})
        }

       const isMatch=await bcrypt.compare(password,user.password)
       if(!isMatch){
        return res.status(400).json({message:"Incorrect password !"})
       }

        const hashedPassword=await bcrypt.hash(password,10)

        const token=await genToken(user._id)

        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite:"strict",
            maxAge:30*24*60*60*1000
        })
       return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: `login error: ${error}` })
}
}

//Logout controller//
export const Logout = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "Logout successful!" })
    } catch (error) {
        return res.status(500).json({ message: `Logout error: ${error}` })
    }
}