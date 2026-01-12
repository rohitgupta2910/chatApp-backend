import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type:String,
        required:true,
    },
    email: {
        type:String,
        required:true,
    },
    password: {
        type:String,
    },
    avatar:{
        public_id:String,
        url:String, 
    },
    // both avatar are not compulsory
},{timestamps:true} //yeh timestamps true krte hai , jisse jab bhi user save hoga ya joh bhi hoga toh timeStamp save hote jayega
); 

export const User = mongoose.model("User",userSchema);
//-----------User yaha pe & -------User yaha pe same same rkhna