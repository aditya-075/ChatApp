const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 4000
const server = app.listen(PORT, ()=>{
    console.log(`server on port ${PORT}`);
})

const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs")


let socketsConnected = new Set();
//let participants = new Set();
let map = new Map();

io.on('connection',onConnected)

function onConnected(socket){
    console.log(socket.id);
    socketsConnected.add(socket.id);

    io.emit('clients-total',socketsConnected.size);
    
    socket.on('user-joined', (data) => {
        map.set(socket.id, data.name);
        io.emit('update-participants', Array.from(map));
    });

    socket.on('disconnect',()=>{
        console.log('socket Disconnected',socket.id);
        socketsConnected.delete(socket.id);
        io.emit('clients-total',socketsConnected.size);
        map.delete(socket.id);
        io.emit('update-participants',Array.from(map));
    })

    socket.on('message',(data)=>{
        //console.log(data);
        socket.broadcast.emit('chat-message',data)
        //console.log(data.name);
        // if(!participants.has(data.name)){
        //     participants.add(data.name);
        //     io.emit('update-participants',Array.from(participants));
        // }
        map.set(socket.id,data.name);
        io.emit('update-participants',Array.from(map));
    })
    
    socket.on('feedback',data=>{
        socket.broadcast.emit('feedback',data)
    }) 
    
}
