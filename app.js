const { v4: uuidv4 } = require('uuid');
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
//var cron = require('node-cron');
const passport = require('passport')

dotenv.config();
const app = express();

const server = http.createServer(app);
const io = new Server(server, { 
    path:'/chat',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const matchQueue = [];
const users = new Map();
const rooms = new Map();

// router
const authRouter = require('./routes/auth');
const passportConfig = require('./passport');
const { sequelize } = require('./models');


passportConfig();
app.set('port', process.env.PORT || 9060 );

sequelize.sync({ force: true })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
});

app.use('/auth', authRouter);
app.use(passport.initialize());


server.listen(app.get('port'), () => {
  console.log(`Server is running on http://localhost:${app.get('port')}`);
});
