const http = require('http')
const socketio = require('socket.io')
const app = require('./app')
const chatroom = require('./utils/chatroom')

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT

io.on('connection', (socket) => {
    console.log('Client connected', socket.id)
    socket.emit('messageStream', chatroom.createMessage('Connected to server...', 'system'))

    socket.on('join', (options, callback) => {
        const user = options.username
        const room = options.roomname
        console.log(user, 'attemped to join', room, socket.id)
        if(chatroom.checkUserInRoom(io, user, room)) {
            callback('User already present in room')
        }
        users = chatroom.getUsersInRoom(io, room)
        users.push(user)
        socket.username = user
        socket.roomname = room
        chatroom.joinRoom(socket, room)
        console.log(user, socket.rooms)
        socket.to(room).broadcast.emit('messageStream', chatroom.createMessage(`${user} has joined the room`, 'system'))
        io.to(room).emit('roomUserData', users.sort(), room)
        callback()
    })

    socket.on('reply', (reply, type, callback) => {
        const user = socket.username
        const room = socket.roomname
        console.log(user, socket.rooms)
        if(user && room) {
            console.log(user,'emitting to', room)
            io.to(room).emit('messageStream', chatroom.createMessage(reply, type, user))
            return callback()
        }
        callback('No rooms joined')
    })

    socket.on('disconnect', () => {
        const rooms = Object.keys(socket.rooms)
        const user = socket.username
        const room = socket.roomname
        if(user && room) {
            console.log(user, 'left', room, socket.id)
            const users = chatroom.getUsersInRoom(io, room)
            console.log(users)
            io.to(room).emit('messageStream', chatroom.createMessage(`${user} left the room`, 'system'))
            io.to(room).emit('roomUserData', users.sort(), room)
        }
    })
})

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
