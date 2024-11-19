const { v4: uuidv4 } = require('uuid');
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const handleSocket = require('./routes/socket')

dotenv.config();
const app = express();

const server = http.createServer(app);
const io = new Server(server, { 
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
handleSocket(io)

// router
const authRouter = require('./routes/auth');
const { sequelize } = require('./models');


app.set('port', process.env.PORT || 9060 );

sequelize.sync({ force: true })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
});

app.use('/auth', authRouter);

server.listen(app.get('port'), () => {
  console.log(`Server is running on http://localhost:${app.get('port')}`);
});
