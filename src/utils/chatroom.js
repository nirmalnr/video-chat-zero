const createMessage = (text, type, name='') => {
    let key = ''
    if(type === 'location') {
        key = process.env.MAP_EMBED_API_KEY
    }
    return message = {
        name,
        text,
        type,
        key,
        createdAt: new Date().getTime()
    }
}

const getUsersInRoom = (io, room) => {
    let clients
    if(!io.sockets.adapter.rooms[room]){
        return []
    }
    clients = io.sockets.adapter.rooms[room].sockets
    let users = []
    for (let client in clients) {
        users.push(io.sockets.connected[client].username)
    }
    return users
}

const checkUserInRoom = (io, user, room) => {
    users = getUsersInRoom(io, room)
    if(users.includes(user)){
        return true
    }
    return false
}

const joinRoom = (socket, room) => {
    const rooms = Object.keys(socket.rooms)
    for (let index = 1; index < rooms.length; index++) {
        const socketRoom = rooms[index];
        if(socketRoom !== room) {
            socket.leave(socketRoom)
        }
    }
    socket.join(room)
}

module.exports = { createMessage, getUsersInRoom, checkUserInRoom, joinRoom }