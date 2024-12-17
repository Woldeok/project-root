const WebSocket = require('ws'); // WebSocket 라이브러리
const express = require('express');
const http = require('http');

// Express 앱 및 HTTP 서버 설정
const app = express();
const server = http.createServer(app);

// WebSocket 서버 생성
const wss = new WebSocket.Server({ server });

// 연결된 클라이언트를 추적하는 Set
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('새로운 클라이언트가 연결되었습니다.');
    clients.add(ws);

    // 메시지 수신 처리
    ws.on('message', (message) => {
        console.log(`수신된 메시지: ${message}`);
        // 연결된 모든 클라이언트에 메시지 브로드캐스트
        for (const client of clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    });

    // 클라이언트 연결 종료 처리
    ws.on('close', () => {
        console.log('클라이언트가 연결을 종료했습니다.');
        clients.delete(ws);
    });

    // 에러 처리
    ws.on('error', (error) => {
        console.error('WebSocket 에러:', error);
    });
});

// HTTP 서버 포트 설정 (4000으로 변경)
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`채팅 서버가 ${PORT} 포트에서 실행 중입니다.`);
});
