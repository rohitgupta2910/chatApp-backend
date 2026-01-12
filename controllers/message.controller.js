import { catchAsyncError } from "../middlewares/catchAsyncError.middleware.js"
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js"
import {v2 as cloudinary} from "cloudinary"
import { getReceiverSocketId , io} from "../utils/socket.js";

export const getAllUsers = catchAsyncError(async (req,res,next)=>{
    const user = req.user ;
    const filteredUsers = await User.find({_id:{$ne:user}})
    //find kro users on the basis of conditions _id , 
    //yeh isko lagane ka mtlb hai ki _id not equal to user ho joh logged in ho
    .select("-password"); // .select("-name") iska mtlb rhta hai ki - mein joh likhdia hai
    // minus wali value ko ni lenaa hai
    res
    .status(200)
    .json({
        success : true ,
        users : filteredUsers ,
    });
})

export const getMessages = catchAsyncError(async (req,res,next)=>{
    //this route is used to get the chats between two users
    const recieverId = req.params.id ;
    const myId = req.user._id ;
    const receiver = await User.findById(recieverId);
    if(!receiver){
        return res.status(400).json({
            success : false ,
            message:"Receiever ID invalid."
        })
    }
    //abhi test kr ni skte jb frontend bnjaye tb test krenge
    const messages = await Message.find({
        $or: [
            {senderId:myId,receiverId:recieverId},
            {senderId:recieverId,receiverId:myId},
        ], 
    }).sort({createdAt:1});
    res.status(201).json({
        success:true,
        messages,
    })
})

export const sendMessage = catchAsyncError(async (req,res,next)=>{
    const {text} = req.body ; //form se ajayega yeh toh
    const media = req?.files?.media ;
    const {id:receiverId} = req.params ;
    const senderId = req.user._id ;

    const receiver = await User.findById(receiverId) ;
    if(!receiver){
        return res.status(400).json({
            success : false ,
            message : "Receiver ID Invalid",
        })
    }

    const sanitizedText = text?.trim() || "" ;
    if(!sanitizedText && !media){ //iska mtlb hai ki user koi text ni bhejna chahta
        return res.status(400).json({
            success : false ,
            message : "Cannot send empty message",
        })
    }

    let mediaUrl = "";
    if(media){
        try {
            const uploadResponse = await cloudinary.uploader.upload(
            media.tempFilePath,
            {
                resource_type:"auto", //auto detect -> image/video
                folder:"CHAT_APP_MEDIA",
                transformation:[
                    {width:1080,height:1080,crop:"limit"},
                    {quality:"auto"},
                    {fetch_format:"auto"},
                ],
            }
        )
        mediaUrl=uploadResponse?.secure_url;
        } catch (error) {
            console.log("Cloudinary upload error",error);
            return res.status(500).json({
                success:false,
                message:"Failed to upload media.Try Later",
            })
        }
        
    }

    const newMessage = await Message.create({
        senderId,
        receiverId,
        text:sanitizedText,
        media:mediaUrl,
    })

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId){
        io.to(receiverSocketId).emit("newMessage",newMessage)
    }
    
    res.status(201).json(newMessage);
})