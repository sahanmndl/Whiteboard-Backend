const dotenv = require('dotenv')
const express = require('express')

dotenv.config()
const app = express()

const server = require('http').createServer(app)
const { Server } = require('socket.io')
const { addUser } = require('./utils/Users')

const io = new Server(server)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

let _roomId, _imgURL

io.on('connection', (socket) => {
    socket.on("userJoined", (data) => {
        const {name, userId, roomId, host, presenter} = data
        console.log(data)
        _roomId = roomId
        socket.join(roomId)

        const users = addUser(data)
        socket.emit("userHasJoined", {success: true})
        socket.broadcast.to(roomId).emit("usersCount", users)

        socket.broadcast.to(roomId).emit("whiteboardDataResponse", {
            imgURL: _imgURL
        })
    })

    socket.on("whiteboardData", (data) => {
        _imgURL = data
        socket.broadcast.to(_roomId).emit("whiteboardDataResponse", {
            imgURL: data
        })
    })
})

const port = process.env.PORT || 5000
server.listen(port, () => console.log('CONNECTED TO PORT 5000'))