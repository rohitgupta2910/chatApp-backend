import jwt from "jsonwebtoken"
//--------------------------------> yeh parameters aayenge userController se joh bheje
export const generateJWTToken = async (user,message,statusCode,res)=>{
    const token = jwt.sign({ id: user._id },process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRE,
    })

    return res
    .status(statusCode)//waise aapn json bhejte hai lekin yaha pe cookie bhi toh push krni
    .cookie("token",token,{ //"double quotes wala is the name by which token is stored" -> "name" -> name
        httpOnly : true , 
        maxAge : process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000, // 7 days in ms ,
        sameSite : "strict" , //--------> yeh neeche development ko "double quotes mein likhte hai hameshaa"
        secure : process.env.NODE_ENV !== "development" ? true : false , //jab development naa ho toh true 
        //that means ki apna project hogya complete so ab local pe ni chalana , ab production pe chelga
        //and in production HTTPs wale pe hee se request aani chahiye saari
    })
    .json({
        success : true ,
        message ,
        token , //token kyu bheja ?? react ko smjhne k liye kya ??
    })
}