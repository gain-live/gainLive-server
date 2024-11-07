
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const matchQueue = [];
const users = new Map();
const rooms = new Map();

app.set('port', process.env.PORT || 9001); //  포트 번호 수정 여기서 하세요ㅛ


// 클라이언트가 연결되었을 때
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('match', (msg) => {
    if(matchQueue.find(element => element == socket)) {
        socket.emit("duplicateMatch");
    }else if(matchQueue.length != 0) {
        //roomUuid = roomUuid++  // todo 
        const roomUuid = uuidv4();
        const user2 = matchQueue.shift()  // todo rename
        user2.join(roomUuid)
        socket.join(roomUuid)
        io.to(roomUuid).emit('matched')
        users[user2] = roomUuid
        users[socket] = roomUuid
        rooms[roomUuid] = [user2, socket] // 시간 넣어줘야 함

    } else {
      socket.emit('ok')
      matchQueue.push(socket)
    }
  })
  // 메시지를 받았을 때
  socket.on('message', (msg) => {
    const roomUuid = users[socket]
    const user2s = rooms[roomUuid].forEach(element => {
      if(element != socket) {
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
    rooms[roomUuid].forEach(element => {
      users.delete(element)
      element.leave(roomUuid)
      element.disconnect()
    });
    rooms.delete(roomUuid)
    console.log('User disconnected:', socket.id);
  });
});

server.listen(app.get('port'), () => {
  console.log(`Server is running on http://localhost:${app.get('port')}`);
});
