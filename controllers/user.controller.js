import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js"
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs" ; //biggest mistake zone is that "bcrypt.js" you should write it in double quotes
import { generateJWTToken } from "../utils/jwtToken.js";
import {v2 as cloudinary} from "cloudinary" 

export const signup = catchAsyncError(async (req,res,next)=>{
    const {fullName,email,password} = req.body ;

    //lets check that we have everything or not first
    if(!fullName || !email || !password){
        //return krdo
        return res.status(400).json({
            success:false,
            message:"Please Provide All Details."
        })
    }
    
    //lets checck email Validity
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
       return res.status(400).json({
        success : false ,
        message : "Email not valid"
       }) 
    }

    //password validity
    if(password.length<8){
        return res.status(400).json({
            success : false ,
            message : "Please Provide Password of length more than 8"
        })
    }

    //if email already exist
    const isEmailAlreadyRegistered = await User.findOne({email})
    if(isEmailAlreadyRegistered){
         return res.status(400).json({
            success : false ,
            message : "Email Already Used"
        })
    }

    //ab password ko hash krenge
    const hashedPassword = await bcrypt.hash(password,10);

    //ab user save kr hee do
    const user = await User.create({
        fullName,
        email,
        password:hashedPassword,
        avatar:{
            public_id:"",
            url:"",
        },
    })

    //ab toh user save hoga toh token toh generate krna padhega hee ab iske liye utils folder banaao
    //bngyaa , ab token save kro

    generateJWTToken(user,"User Registered Successfully",201,res) ;
})

export const signin = catchAsyncError(async (req,res,next)=>{
    const {email,password} = req.body ;
    if(!email || !password){
         return res.status(400).json({
            success : false ,
            message : "Enter email and password both"
        })
    }

    //lets checck email Validity
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
       return res.status(400).json({
        success : false ,
        message : "Email not valid"
       }) 
    }

    //lets find the user since the email is correct
    const user = await User.findOne({email});
    if(!user){
         return res.status(400).json({
            success : false ,
            message : "Invalid Email Or Password"
        })
    }
    //ab user milgya toh password checck
    const hashedPassword = user.password;
    const isPasswordMatched = await bcrypt.compare(password,hashedPassword) ; //const isPasswordMatched mein bhi boolean aaskta
    if(!isPasswordMatched){
        return res.status(400).json({
            success : false ,
            message : "Invalid Email Or Password"
        })
    }
    //ab yaha pe login krwado user
    generateJWTToken(user,"User LoggedIn",201,res);
})

export const signout = catchAsyncError(async (req,res,next)=>{
    res //return is not compulsory but why ??
    .status(201)
    .cookie("token","",{ 
        httpOnly : true , 
        maxAge : 0 , //isi time pe khtm krdo token ko 
        sameSite : "strict" ,
        secure : process.env.NODE_ENV !== "development" ? true : false , 
    })
    .json({
        success : true ,
        message : "User Logged Out" ,
        //ab token hoga nahi toh nahi bhejna json mein isbaar
    })
})

export const getUser = catchAsyncError(async (req,res,next)=>{
    const user = req.user ;
    res.status(200).json({
        success:true,
        user,
    });
})

export const updateProfile = catchAsyncError(async (req,res,next)=>{
    const {fullName,email} = req.body ;
    if(fullName?.trim().length === 0 || email?.trim().length === 0){
        return res.status(400).json({
            success : false ,
            message : "FullName And Email Can't Be Empty."
        })
    }
    const avatar = req?.files?.avatar ; //question mark is like exist krti hai toh bataao wrna mt bataao
    let cloudinaryResponse = {} ;

    if(avatar){
        try{
            const oldAvatarPublicId = req.user?.avatar?.public_id ;
            if(oldAvatarPublicId && oldAvatarPublicId.length>0){
                await cloudinary.uploader.destroy(oldAvatarPublicId);
            }
            cloudinaryResponse = await cloudinary.uploader.upload(
                avatar.tempFilePath,
                {
                    folder : "CHAT_APP_USERS_AVATARS",
                    transformation : [
                        {width:300,height:300,crop:"limit"}, //crop:"limit" se aspect ratio same rhta hai
                        {quality:"auto"},
                        {fetch_format:"auto"} //khud format krlena file type
                    ]
                }
            )
        }catch(error){
            console.log("Cloudinary Upload Error",error);
            return res.status(500).json({
                success : false ,
                message : "Failed to upload avatar . Please try again later" ,
            })
        }
    }

    let data = {
        fullName,
        email,
    };
    if(avatar && cloudinaryResponse?.public_id && cloudinaryResponse?.secure_url){
        //ab pura data hai toh bhejdo
        data.avatar = {
            public_id : cloudinaryResponse.public_id ,
            url : cloudinaryResponse.secure_url ,
        }
    }
    let user = await User.findByIdAndUpdate(req.user._id,data,{
        new:true,
        runValidators:true,
    })
    res.status(200).json({
        success : true ,
        message : "Profile Updated Successfully.",
        user
    })
})