const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const chalk = require('chalk'); // 로그 색상 처리를 위한 모듈
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: 'http://xn--vu4bw2k.shop', // 허용할 출처
        methods: ['GET', 'POST'], // 허용할 HTTP 메서드
        credentials: true // 쿠키 및 인증 정보 전송 허용
    }
});
app.use(cors({
    origin: ['http://xn--vu4bw2k.shop', 'http://www.xn--vu4bw2k.shop'], // 허용할 출처 추가
    methods: ['GET', 'POST'], // 허용할 메서드
    credentials: true
}));

// JWT 비밀 키
const SECRET_KEY = 'YOUR_SECRET_KEY';

app.use(cors({
    origin: 'http://xn--vu4bw2k.shop', // 허용할 출처
    methods: ['GET', 'POST'], // 허용할 메서드
    credentials: true
}));

app.use(express.json()); // JSON 요청 본문 처리

const messages = [];

// WebSocket 연결 처리
io.on('connection', (socket) => {
    const token = socket.handshake.auth.token; // WebSocket 연결 시 전달받은 토큰
    try {
        const decoded = jwt.verify(token, SECRET_KEY); // 토큰 검증
        console.log(chalk.green(`[WebSocket 연결 성공] 사용자 ID: ${decoded.id}, 이름: ${decoded.username}`));
        
        // WebSocket 이벤트 처리
        socket.on('chat message', (msg) => {
            console.log(chalk.green(`[WebSocket 메시지 수신] 사용자 ID: ${decoded.id}, 메시지: ${msg}`));
            messages.push({ userId: decoded.id, username: decoded.username, message: msg });
            io.emit('chat message', { username: decoded.username, message: msg });
        });

        socket.on('disconnect', (reason) => {
            console.log(chalk.green(`[WebSocket 연결 해제] 사용자 ID: ${decoded.id}, 이유: ${reason}`));
        });
    } catch (err) {
        console.error(chalk.red(`[WebSocket 연결 실패] 유효하지 않은 토큰`));
        socket.disconnect(); // 연결 종료
    }
});

// HTTP 요청에 대해 토큰 검증 및 로그 출력
app.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Authorization 헤더에서 토큰 추출
    if (token) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY); // 토큰 검증
            console.log(chalk.green(`[HTTP 요청] 사용자 ID: ${decoded.id}, 요청 경로: ${req.path}, 요청 메서드: ${req.method}`));
            req.user = decoded; // 사용자 정보를 요청 객체에 저장
        } catch (err) {
            console.error(chalk.red('[HTTP 요청 실패] 유효하지 않은 토큰'));
        }
    } else {
        console.warn(chalk.yellow('[HTTP 요청] 토큰이 제공되지 않았습니다.'));
    }
    next();
});

// API 엔드포인트: 기존 메시지 조회
app.get('/api/messages', (req, res) => {
    console.log(chalk.green('[API 요청] 모든 메시지 조회'));
    res.json({ success: true, messages });
});

// API 엔드포인트: 새 메시지 추가
app.post('/api/messages', (req, res) => {
    const { message } = req.body;
    if (!message) {
        console.log(chalk.green('[API 요청 실패] 메시지가 제공되지 않았습니다.'));
        return res.status(400).json({ success: false, error: '메시지가 필요합니다.' });
    }

    const user = req.user || { id: 'anonymous', username: 'Guest' }; // 요청에 사용자 정보가 있는 경우 사용
    messages.push({ userId: user.id, username: user.username, message });
    console.log(chalk.green(`[API 요청] 사용자 ID: ${user.id}, 메시지 추가: ${message}`));
    io.emit('chat message', { username: user.username, message });
    res.json({ success: true, message });
});

// 서버 실행
const PORT = 4000;
server.listen(PORT, () => {
    console.log(chalk.green(`채팅 서버가 http://xn--vu4bw2k.shop:${PORT} 에서 실행 중입니다.`));
});
