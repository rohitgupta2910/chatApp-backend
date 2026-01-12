import app from "./app.js"
import {v2 as cloudinary} from "cloudinary";
import http from "http"
import { initSocket } from "./utils/socket.js";

//cloudinary setup
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const server = http.createServer(app);
initSocket(server);

//ab server start krne k liye setup
server.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`
    );
});