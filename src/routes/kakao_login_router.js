const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const router = express.Router();

// 카카오 앱 키 설정
const CLIENT_ID = '7591a7e295296f0796123e8b62cb8600'; // REST API 키
const REDIRECT_URI = 'http://승진.shop/auth/kakao/callback'; // 카카오 개발자 센터에 등록된 Redirect URI
const STATE = 'randomstring'; // CSRF 방지를 위한 임의 값

// 카카오 OAuth 인증 요청 라우트
router.get('/auth/kakao', (req, res) => {
  const api_url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;
  res.redirect(api_url);
});

// 카카오 OAuth 콜백 라우트
router.get('/auth/kakao/callback', async (req, res) => {
  const { code, state } = req.query;

  // State 값 검증
  if (state !== STATE) {
    return res.status(400).send('State 값이 일치하지 않습니다. 보안 문제가 발생할 수 있습니다.');
  }

  try {
    // 토큰 요청
    const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', querystring.stringify({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenResponse.data;

    // 사용자 정보 요청
    const profileResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const profile = profileResponse.data;

    // 사용자 정보 세션 저장 (또는 데이터베이스 저장)
    req.session.user = {
      id: profile.id,
      nickname: profile.properties.nickname,
      profileImage: profile.properties.profile_image,
      email: profile.kakao_account.email,
    };

    console.log('카카오 로그인 성공:', req.session.user);

    // 로그인 후 리다이렉트
    res.redirect('/');
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
    res.redirect('/');
  });
});

module.exports = router;
