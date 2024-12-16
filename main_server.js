const { spawn } = require('child_process');

// 웹 서버 실행
console.log("웹 서버를 시작합니다...");
const webServer = spawn('node', ['server.js'], { stdio: 'inherit' });

// 채팅 서버 실행
console.log("채팅 서버를 시작합니다...");
const chatServer = spawn('node', ['chat_server.js'], { stdio: 'inherit' });

// 웹 서버 종료 이벤트 로그
webServer.on('close', (code) => {
    console.log(`웹 서버가 종료되었습니다. 종료 코드: ${code}`);
});

// 채팅 서버 종료 이벤트 로그
chatServer.on('close', (code) => {
    console.log(`채팅 서버가 종료되었습니다. 종료 코드: ${code}`);
});
