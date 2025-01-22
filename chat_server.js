const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');
const express = require('express');
const chatRouter = require('./src/routes/chat'); // 채팅 REST API 라우터

const app = express();
const server = http.createServer(app);

// WebSocket 서버 설정
const wss = new WebSocket.Server({ server });
const clients = new Set(); // 연결된 클라이언트 목록

// JWT 검증 함수
function verifyToken(token) {
    try {
        return jwt.verify(token, 'secret-key'); // 환경 변수로 관리 권장
    } catch (error) {
        return null;
    }
}

// WebSocket 연결 설정
wss.on('connection', (ws, req) => {
    const token = req.url.split('token=')[1];
    const user = verifyToken(token);

    if (!user) {
        ws.close();
        return console.log('인증 실패: WebSocket 연결 종료');
    }

    clients.add(ws);
    console.log(`${user.username}이 연결되었습니다.`);

    // 클라이언트에서 메시지 수신 시
    ws.on('message', (message) => {
        console.log(`수신 메시지: ${message}`);

        // 연결된 모든 클라이언트에게 메시지 전송
        for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ user: user.username, message }));
            }
        }
    });

    // 연결 종료 시
    ws.on('close', () => {
        clients.delete(ws);
        console.log(`${user.username} 연결 종료`);
    });
});

// REST API 라우터 등록
app.use(express.json());
app.use('/api/chat', chatRouter); // REST API 라우터

// 서버 시작
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('WebSocket Server is ready.');
});
