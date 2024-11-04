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
