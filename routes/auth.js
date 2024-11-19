const express = require('express');
const axios = require('axios');
const User = require('../models/user')
const router = express.Router();

// JWT 생성 유틸리티
const jwt = require('jsonwebtoken');
const createJWT = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
    expiresIn: '1h',
  });
};

// JWT 인증 미들웨어
const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
    });
    req.user = payload; // 인증된 사용자 정보를 요청 객체에 추가
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Kakao 로그인 라우팅
router.get('/kakao', (req, res) => {
  console.log('tlqkf')
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
  res.redirect(kakaoAuthUrl);
});

router.get('/kakao/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Access Token 요청
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID,
          client_secret: process.env.KAKAO_CLIENT_SECRET,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code: code,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token } = tokenResponse.data;

    // 사용자 정보 요청
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = {
      id: userResponse.data.id,
      email: userResponse.data.kakao_account.email,
      nickname: userResponse.data.properties.nickname,
    };
    let exUser = await User.findOne({where: {snsId: userResponse.data.id, provider: "kakao"}})
    if(!exUser) {
      exUser = await User.create({
        provider: "kakao",
        snsId: userResponse.data.id,
      })
    }
    // JWT 발급
    const token = createJWT(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Kakao login failed', details: error.message });
  }
});

// Google 로그인 라우팅
router.get('/google', (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
  res.redirect(googleAuthUrl);
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Access Token 요청
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { id_token, access_token } = tokenResponse.data;

    // 사용자 정보 요청
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = {
      id: userResponse.data.sub,
      email: userResponse.data.email,
      name: userResponse.data.name,
      picture: userResponse.data.picture,
    };
    let exUser = await User.findOne({where: {snsId: userResponse.data.sub, provider:"google"}})
    if(!exUser) {
        exUser = await User.create({
        snsId: userResponse.data.sub,
        provider: "google"
      })
    }
    console.log(user)
    // JWT 발급
    const token = createJWT(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Google login failed', details: error.message });
  }
});

// 보호된 경로
router.get('/protected', verifyJWT, (req, res) => {
  console.log(req.user)
  res.json({ message: 'You have access to this protected route!' });
});


module.exports = router;
