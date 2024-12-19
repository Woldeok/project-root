const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const pool = require('../db.js'); // MySQL 연결 풀
const { v4: uuidv4 } = require('uuid'); // 고유 ID 생성용
const router = express.Router();

const CLIENT_ID = '7591a7e295296f0796123e8b62cb8600'; // REST API 키
const REDIRECT_URI = 'http://승진.SHOP/auth/kakao/callback'; // Redirect URI
const SECRET_KEY = process.env.SECRET_KEY;
const STATE = 'randomstring'; // CSRF 방지를 위한 임의 값

// 카카오 OAuth 인증 요청 라우트
router.get('/auth/kakao', (req, res) => {
  const api_url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;
  res.redirect(api_url);
});

// 카카오 OAuth 콜백 라우트
router.get('/auth/kakao/callback', async (req, res) => {
  const { code, state } = req.query;

  if (state !== STATE) {
    return res.status(400).send('State 값이 일치하지 않습니다.');
  }

  try {
    // 카카오에서 토큰 요청
    const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', querystring.stringify({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token } = tokenResponse.data;

    // 사용자 정보 요청
    const profileResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = profileResponse.data;
    const kakao_id = profile.id;
    const nickname = profile.properties.nickname;
    const email = profile.kakao_account.email;

    // 사용자 정보를 데이터베이스에 저장 또는 가져오기
    const [rows] = await pool.execute(
      'SELECT user_id FROM user WHERE kakao_id = ?',
      [kakao_id]
    );

    let user_id;
    if (rows.length === 0) {
      // 새 사용자 추가
      user_id = uuidv4(); // 고유 ID 생성
      await pool.execute(
        'INSERT INTO user (user_id, kakao_id, nickname, email) VALUES (?, ?, ?, ?)',
        [user_id, kakao_id, nickname, email]
      );
    } else {
      user_id = rows[0].user_id; // 기존 user_id
    }

    // 세션에 사용자 정보 저장
    req.session.user = { user_id, kakao_id, nickname, email };

    // JWT 토큰 발급
    const token = jwt.sign({ user_id, kakao_id }, SECRET_KEY, { expiresIn: '1h' });
    res.cookie('auth_token', token, { httpOnly: true });

    console.log('카카오 로그인 성공:', req.session.user);
    res.redirect('/board'); // 로그인 후 게시판으로 이동
  } catch (error) {
    console.error('카카오 로그인 에러:', error.response ? error.response.data : error.message);
    res.status(500).send('로그인 처리 중 문제가 발생했습니다.');
  }
});

// 로그아웃 라우트
router.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('세션 삭제 중 에러:', err);
      return res.status(500).send('로그아웃 중 문제가 발생했습니다.');
    }
    res.clearCookie('auth_token');
    res.redirect('/');
  });
});

module.exports = router;
