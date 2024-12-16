const express = require('express');
const axios = require('axios');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware'); // 추가
// 채팅 페이지 렌더링
router.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://승진.shop:4000/api/messages');
        const messages = response.data.messages;
        res.render('chat', { messages });
    } catch (error) {
        console.error('채팅 서버에서 메시지를 가져오는 중 오류:', error.message);
        res.status(500).send('채팅 서버 연결 실패');
    }
});
// `/api/messages` 요청을 채팅 서버로 프록시

module.exports = router;
