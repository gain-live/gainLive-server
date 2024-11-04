const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.set('port',process.env.PORT || 3000);


// 클라이언트가 연결되었을 때
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // 메시지를 받았을 때
  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    
    // 메시지를 모든 클라이언트에 전송
    io.emit('message', msg);
  });

  // 연결이 끊어졌을 때
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번 포트에서 대기 중');
})
