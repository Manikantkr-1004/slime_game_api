const express = require('express');
const app = express();
const http = require('http');
const {Server}= require('socket.io');
const cors = require("cors");
app.use(cors());

const server = http.createServer(app);

let storeData = [];

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

io.on("connection",(socket)=>{

    socket.on('join_room', (data)=>{

        let findRoom = storeData.filter((ele)=> ele.room===data.room);
        if(findRoom.length ===0){
            socket.join(data.room);
            storeData.push({room:data.room,name:data.name,id:socket.id});
            socket.to(data.room).emit('newjoin',data)
        }else if(findRoom.length===1){
            socket.join(data.room);
            storeData.push({room:data.room,name:data.name,id:socket.id});
            socket.to(data.room).emit('newjoin',data)
        }else{}
    })

    socket.on("send_message", (data)=>{
        socket.to(data.room).emit("receive_message",data)
    })

    socket.on("ball_send", (data)=>{
        socket.to(data.room).emit("ball_receive",data)
    })

    socket.on('disconnect', ()=>{
        const userId = socket.id;
        const findUser = storeData.filter((ele)=> ele.id===userId);
        socket.to(findUser[0]?.room).emit('left_room',{message:'Another Person is left the Game so You won this game.'});
        storeData = storeData.filter(ele=> ele.id!== userId);
    })
})

app.get('/knowroom',async(req,res)=>{
    res.send({storeData})
})

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>{
    console.log(`Server is running at PORT ${PORT}`);
})
