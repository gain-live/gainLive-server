const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const handleSocket = require('./routes/socket');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const morgan = require('morgan');

dotenv.config();
const app = express();
const uploadFolder = path.join(__dirname, 'uploads');

// router
const authRouter = require('./routes/auth');
const { sequelize } = require('./models');
const imageRouter = require('./routes/image');

app.set('port', process.env.PORT || 9060);
app.use(morgan('dev'));
app.use(express.json());

// 정적 파일 제공
app.use('/image', express.static(path.join(__dirname, 'uploads')));

sequelize.sync({ force: true })
    .then(() => {
        console.log('데이터베이스 연결 성공');
    })
    .catch((err) => {
        console.error(err);
    });

app.use('/auth', authRouter);
app.use('/img', imageRouter);

// server.listen(app.get('port'), () => {
//     console.log(`Server is running on http://localhost:${app.get('port')}`);
// });

const server = app.listen(app.get('port'), () => {
    console.log(`HTTPS Server running on port ${app.get('port')}`);
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

handleSocket(io);
