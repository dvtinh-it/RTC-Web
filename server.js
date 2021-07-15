const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const socket = require('socket.io')
// const io = socket(server)
const io = socket(server,  {
    cors :{
        origin :"http://localhost:3002",
        methods :["GET","POST"]
    }
  });
const username = require('username-generator')
const path = require('path')
 


// app.use(express.static('./client/build'));

// app.get('/file', (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
// })


app.get('/', (req, res) => {
    res.send("server is up and running");
})



const users = {}

io.on('connection' ,socket => {
    console.log("new user login");
    var userid  = "";
    socket.on("twoID" ,(user1 ,user2) => {
        userid = user1;
        if (!users[userid]) {
                users[userid] = socket.id
        }        
        socket.emit('yourID', userid)
        io.sockets.emit('allUsers', users)
    })
    socket.on('disconnect', () => {
        delete users[userid]

    })

    socket.on('callUser', (data) => {
        io.to(users[data.userToCall]).emit('hey', { signal: data.signalData, from: data.from })
    })

    socket.on('acceptCall', (data) => {
        io.to(users[data.to]).emit('callAccepted', data.signal)
    })

    socket.on('close', (data) => {
        io.to(users[data.to]).emit('close')
    })

    socket.on('rejected', (data) => {
        io.to(users[data.to]).emit('rejected')
    })
})


const port = process.env.PORT || 8000

server.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})