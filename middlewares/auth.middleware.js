import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { catchAsyncError } from "./catchAsyncError.middleware.js";

export const isAuthenticated = catchAsyncError(async (req,res,next)=>{
    const {token} = req.cookies ;
    if(!token){
        return res
        .status(401)
        .json({
            success:false,
            message:"User not authenticated , Please sign in"
        })
    }
    const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);

    if(!decoded){
        return res
        .status(401)
        .json({
            success:false,
            message:"Token Verification Failed , Please Sign In Again"
        })
    }

    const user = await User.findById(decoded.id); //decoded.id kaha se aayi ? , jab token generate kr rrhe thay toh jwt payload mein user._id bheja tha
    //ab store krdo is user ko
    req.user = user ;
    next(); //next se faayda yeh hoga ki agla function execute hojayega
})