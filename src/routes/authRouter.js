const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const router = express.Router();

const CLIENT_ID = 'F6ELbYUflfwLLMIrIZIZ';
const CLIENT_SECRET = 'kXOWsJTPCi';
const REDIRECT_URI = 'http://www.xn--vu4bw2k.shop/auth/naver/callback';

const STATE = 'randomstring'; // CSRF 방지를 위한 값

// 네이버 OAuth 인증 요청 라우트
router.get('/auth/naver', (req, res) => {
  const api_url = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;
  res.redirect(api_url);
});

// 네이버 OAuth 콜백 라우트
router.get('/auth/naver/callback', async (req, res) => {
  const { code, state } = req.query;

  // State 값 검증
  if (state !== STATE) {
    return res.status(400).send('State 값이 일치하지 않습니다. 보안 문제가 발생할 수 있습니다.');
  }

  try {
    // 네이버에 토큰 요청
    const tokenResponse = await axios.post(
      'https://nid.naver.com/oauth2.0/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        state,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token } = tokenResponse.data;

    // 사용자 프로필 요청
    const profileResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = profileResponse.data.response;

    // 사용자 정보 세션 저장
    req.session.user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      profileImage: profile.profile_image,
    };

    console.log('로그인 성공:', req.session.user);

    // 로그인 성공 후 리다이렉트
    res.redirect('/');
  } catch (error) {
    console.error('네이버 로그인 에러:', error.message);
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
    res.redirect('/');
  });
});

module.exports = router;
