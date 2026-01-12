import { Server } from "socket.io";

//when user connection , socketId is updated
const userSocketMap = {};

let io ;

//fn used to initialize the socket
export function initSocket(server){
    io = new Server(server,{
        cors:{
            origin:[process.env.FRONTEND_URL],
        },
    });

    //on is used to listen event , jab frontend se
    //connecction event aaye i.e frontend pe connetion even trigger
    io.on("connection",(socket)=>{
        console.log("A user connected to server",socket.id)

        const userId = socket.handshake.query.userId; //yeh userId aayi frontend se
        
        //agr userId milgai toh userSocketMap mein userId daalo
        //key -> userId value -> socket.id
        if(userId) userSocketMap[userId] = socket.id ;

        //emit se saare connected users mein 
        //yeh event trigger kro
        //is event se keys bheji userSocketMap
        //jisse pta chl jaaye konsa user Online huaa
        io.emit("getOnlineUsers",Object.keys(userSocketMap));

        //user Disconnection features
        socket.on("disconnect",()=>{
            console.log("A user disconnected",socket.io) ;
            delete userSocketMap[userId] ;
            io.emit("getOnlineUsers",Object.keys(userSocketMap)) ; 
        })
    })
}

//receiver SocketId
export function getReceiverSocketId(userId){
    return userSocketMap[userId]
}

export {io}; 