const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');

// 환경변수 설정
dotenv.config();

// 데이터베이스 연결 설정
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 데이터베이스 연결
db.connect((err) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err.message);
        return;
    }
    console.log('데이터베이스에 연결되었습니다.');
});

// 채팅 메시지 목록 가져오기 및 EJS 렌더링
router.get('/chat', (req, res) => {
    // 모든 메시지 조회
    db.query('SELECT * FROM messages ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('메시지 조회 오류:', err);
            return res.status(500).send('메시지를 불러오는 중 오류가 발생했습니다.');
        }
        res.render('chat', { messages: results }); // EJS 템플릿에 메시지 전달
    });
});

// 새 채팅 메시지 저장
router.post('/messages', (req, res) => {
    const { user, message } = req.body;

    if (!user || !message) {
        return res.status(400).json({ message: '사용자와 메시지를 모두 입력하세요.' });
    }

    // 메시지 저장
    db.query('INSERT INTO messages (user, message) VALUES (?, ?)', [user, message], (err) => {
        if (err) {
            console.error('메시지 저장 오류:', err);
            return res.status(500).json({ message: '메시지 저장 실패', error: err });
        }
        res.redirect('/api/chat/chat'); // 메시지 저장 후 채팅 화면 리로드
    });
});

module.exports = router;
