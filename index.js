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

    socket.on('up_arrow_key', (data)=>{
        if (data.player === 1){
            socket.to(data.room).emit('up_arrow_key_player_1', data);
        } else if ((data.player === 2)) {
            socket.to(data.room).emit('up_arrow_key_player_2', data);   
        }
        console.log('data from backend up key', data);
    })

    socket.on('left_arrow_key', (data)=>{
        if (data.player === 1){
            socket.to(data.room).emit('left_arrow_key_player_1', data);
        } else if ((data.player === 2)) {
            socket.to(data.room).emit('left_arrow_key_player_2', data);   
        }
        console.log('data from backend left key', data);
    })

    socket.on('right_arrow_key', (data)=>{
        if (data.player === 1){
            socket.to(data.room).emit('right_arrow_key_player_1', data);
        } else if ((data.player === 2)) {
            socket.to(data.room).emit('right_arrow_key_player_2', data);   
        }
        console.log('data from backend right key', data);
    })

    socket.on('neutral', (data)=>{
        if (data.player === 1){
            socket.to(data.room).emit('neutral_player_1', data);
        } else if ((data.player === 2)) {
            socket.to(data.room).emit('neutral_player_2', data);   
        }
        console.log('data from backend neutral', data);
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
