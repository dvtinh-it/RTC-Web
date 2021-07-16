const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
    allowRequest: (req, callback) => {
        const isOriginValid = true;//check(req);
        callback(null, isOriginValid);
    }
});
const username = require('username-generator')
const path = require('path')


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


const port = process.env.PORT || 86

server.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})