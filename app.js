// const express = require('express')
// const dotenv = require('dotenv');



// // app.use((req,res,next)=>{
// //     const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
// //     error.status = 404;
// //     next(error);
// // });

// const app = express();
// app.set('port',process.env.PORT || 8000);

// app.use((err,req,res,next)=>{
//     res.locals.message = err.message;
//     res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
//     res.status(err.status || 500);
//     res.render('error');
// });


// const { v4: uuidv4 } = require('uuid');
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const app = express()
const server = http.createServer(app);
const io = new Server(server);
app.set('port',process.env.PORT || 3000);

const matchQueue = []
const users = new Map()
const rooms = new Map()
let roomId = 0

// 클라이언트가 연결되었을 때
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('match', (msg) => {
    if(matchQueue.find(element => element == socket)) {
      socket.emit("tlqkf")
    }else if(matchQueue.length != 0) {
      roomId = roomId++  // todo 
      const user2 = matchQueue.shift()  // todo rename
      user2.emit('matched')
      socket.emit('matched')
      user2.join(roomId)
      socket.join(roomId)
      users[user2] = roomId
      users[socket] = roomId
      rooms[roomId] = [user2, socket]
    } else {
      socket.emit('ok')
      matchQueue.push(socket)
    }
  })
  // 메시지를 받았을 때
  socket.on('message', (msg) => {
    const roomId = users[socket]
    const user2s = rooms[roomId].forEach(element => {
      if(element != socket) {
        element.emit("message", msg)
      }
    });
    // 메시지를 모든 클라이언트에 전송
    // io.to(roomId).emit('message', msg);
  });

  // 연결이 끊어졌을 때
  socket.on('disconnect', () => {
    const roomId = users[socket]
    io.to(roomId).emit('disconnected')
    rooms[roomId].forEach(element => {
      users.delete(element)
      element.leave(roomId)
      element.disconnect()
    });
    rooms.delete(roomId)
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
