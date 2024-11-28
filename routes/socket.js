const { v4: uuidv4 } = require('uuid');

const matchQueue = [];
const users = new Map();
const rooms = new Map();

// 채팅
// 클라이언트가 연결되었을 때
const handleSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('match', (msg) => {
            if (matchQueue.find(element => element == socket)) {
                socket.emit("duplicateMatch");
            } else if (matchQueue.length != 0) {
                //roomUuid = roomUuid++  // todo 
                const roomUuid = uuidv4();
                const user2 = matchQueue.shift()  // todo rename
                user2.join(roomUuid)
                socket.join(roomUuid)
                io.to(roomUuid).emit('matched')
                users[user2] = roomUuid
                users[socket] = roomUuid

                rooms.set(roomUuid, {
                    endTime: new Date(Date.now() + 45 * 1000),  //  끝나는 시간
                    users: [user2, socket]
                });

            } else {
                socket.emit('ok')
                matchQueue.push(socket)
            }
        });

        // 메시지를 받았을 때
        socket.on('message', (msg) => {
            const roomUuid = users[socket]
            const user2s = rooms.get(roomUuid)["users"].forEach(element => {
                if (element != socket) {
                    element.emit("message", msg)
                }
            });
            // 메시지를 모든 클라이언트에 전송
            // io.to(roomUuid).emit('message', msg);
        });

        // 연결이 끊어졌을 때
        socket.on('disconnect', () => {
            const roomUuid = users[socket]
            io.to(roomUuid).emit('disconnected')
            rooms.get(roomUuid)["users"].forEach(element => {
                users.delete(element)
                element.leave(roomUuid)
                element.disconnect()
            });
            rooms.delete(roomUuid)
            console.log('User disconnected:', socket.id);
        });
    });

    setInterval(() => {
        rooms.forEach((room, key) => {

            if (Date.now() >= room.endTime.getTime()) {
                io.to(key).emit('timeover');

                room["users"].forEach(element => {
                    users.delete(element)
                    element.leave(key)
                    element.disconnect()
                });

                rooms.delete(key)
                console.log('time over:', key);
            }
        });
    }, 100);
}

module.exports = handleSocket