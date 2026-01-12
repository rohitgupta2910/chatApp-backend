import express from 'express';
import cookieParser from 'cookie-parser';
import {config} from "dotenv";
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { dbConnect } from './database/db.js';
import userRouter from './routes/user.routes.js';
import messageRouter from './routes/message.routes.js'

const app = express();
config({path:"./config/config.env"}) ;

//sbse phle cors ko setup krdo
app.use(
    cors({
        origin:[process.env.FRONTEND_URL],
        credentials:true,
        methods:["GET","POST","PUT","DELETE"],
    })
)

app.use(cookieParser()); //cookieParser() as function call hota , top pe rkho
app.use(express.json()); //express ka middleware woh bhi json therfore express.json() ;
app.use(express.urlencoded({extended:true})); //express ka middleware urlEncoded() and fn hee call hoga , extended:true pass kro

app.use(
    fileUpload({
        useTempFiles:true ,
        tempFileDir:"./temp/" ,
    })
)

//connecting to database
dbConnect();

//setting up user routes
app.use("/api/v1/user",userRouter) //since we exported default isliye we can use userRouter or Routes whatever we want
app.use("/api/v1/message",messageRouter) 

export default app;
