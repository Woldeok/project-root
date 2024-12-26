const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const mysql = require('mysql2/promise');
const router = express.Router();

// 환경 변수 사용
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://승진.shop/auth/discord/callback';

// MySQL 연결 설정
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
};

// 로그인 요청 라우트
router.get('/auth/discord', (req, res) => {
    const discordAuthURL = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
    )}&response_type=code&scope=identify email`;
    console.log(`[정보]: 디스코드 인증 URL로 리다이렉트 중: ${discordAuthURL}`);
    res.redirect(discordAuthURL);
});

// 콜백 처리 라우트
router.get('/auth/discord/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        console.error('[오류]: 콜백 요청에 코드가 없습니다.');
        return res.status(400).send('코드가 제공되지 않았습니다.');
    }

    try {
        console.log('[정보]: 디스코드로부터 받은 코드:', code);
        console.log('[정보]: 요청에 사용된 REDIRECT_URI:', REDIRECT_URI);

        // 액세스 토큰 요청
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            querystring.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenResponse.data;
        console.log('[정보]: 디스코드로부터 받은 액세스 토큰:', access_token);

        // 사용자 정보 요청
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const user = userResponse.data;
        console.log('[정보]: 디스코드로부터 받은 사용자 정보:', user);

        // 데이터베이스 연동
        const connection = await mysql.createConnection(dbConfig);
        console.log('[정보]: 데이터베이스에 연결되었습니다.');

        // 디스코드 사용자 확인
        const [rows] = await connection.execute('SELECT * FROM users WHERE discord_id = ?', [user.id]);

        if (rows.length === 0) {
            // 사용자 등록
            console.log('[정보]: 데이터베이스에 사용자가 없습니다. 새 사용자 등록 중.');
            await connection.execute(
                'INSERT INTO users (discord_id, username, email, avatar) VALUES (?, ?, ?, ?)',
                [user.id, user.username, user.email || null, user.avatar]
            );
            res.json({ message: '사용자가 성공적으로 등록되었습니다.', user });
        } else {
            // 기존 사용자 정보 반환
            console.log('[정보]: 데이터베이스에서 기존 사용자 발견:', rows[0]);
            res.json({ message: '사용자가 성공적으로 로그인되었습니다.', user: rows[0] });
        }

        await connection.end();
        console.log('[정보]: 데이터베이스 연결이 종료되었습니다.');
    } catch (error) {
        console.error('[오류]: 디스코드 인증 과정에서 오류 발생:', error);
        if (error.response && error.response.data) {
            console.error('[오류]: 디스코드 API 응답:', error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).send('디스코드 인증 중 오류가 발생했습니다.');
    }
});

module.exports = router;
