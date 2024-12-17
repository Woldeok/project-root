const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 로그 관리 폴더 생성
const logDir = path.join(__dirname, 'logs');
const mainLogDir = path.join(logDir, 'main_server_logs'); // 메인 서버 로그 폴더
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}
if (!fs.existsSync(mainLogDir)) {
    fs.mkdirSync(mainLogDir, { recursive: true });
}

// 웹 서버, 채팅 서버 로그 파일 설정
const webServerLog = fs.createWriteStream(path.join(logDir, 'web_server.log'), { flags: 'a' });
const chatServerLog = fs.createWriteStream(path.join(logDir, 'chat_server.log'), { flags: 'a' });

// 메인 서버 로그 설정
const mainServerLog = fs.createWriteStream(path.join(mainLogDir, 'main_server.log'), { flags: 'a' });

// 콘솔 로그를 유지하면서 파일에도 저장되도록 설정
const originalConsoleLog = console.log;
console.log = (...args) => {
    originalConsoleLog(...args); // 콘솔에 출력
    mainServerLog.write(`${new Date().toISOString()} - ${args.join(' ')}\n`);
};

const originalConsoleError = console.error;
console.error = (...args) => {
    originalConsoleError(...args); // 콘솔에 출력
    mainServerLog.write(`${new Date().toISOString()} - ERROR: ${args.join(' ')}\n`);
};

// 웹 서버 실행
console.log("웹 서버를 시작합니다...");
const webServer = spawn('node', ['server.js'], { stdio: ['inherit', 'pipe', 'pipe'] });

// 채팅 서버 실행
console.log("채팅 서버를 시작합니다...");
const chatServer = spawn('node', ['chat_server.js'], { stdio: ['inherit', 'pipe', 'pipe'] });

// 웹 서버 로그 파일 저장
webServer.stdout.pipe(webServerLog);
webServer.stderr.pipe(webServerLog);

// 채팅 서버 로그 파일 저장
chatServer.stdout.pipe(chatServerLog);
chatServer.stderr.pipe(chatServerLog);

// 종료 이벤트 로그
webServer.on('close', (code) => {
    console.log(`웹 서버가 종료되었습니다. 종료 코드: ${code}`);
});

chatServer.on('close', (code) => {
    console.log(`채팅 서버가 종료되었습니다. 종료 코드: ${code}`);
});

// 종료 신호 처리
process.on('SIGINT', () => {
    console.log('서버 종료 신호를 받았습니다. 자식 프로세스를 종료합니다...');
    webServer.kill('SIGINT');
    chatServer.kill('SIGINT');
    process.exit();
});

// 에러 처리
webServer.on('error', (err) => {
    console.error(`웹 서버 실행 중 오류 발생: ${err.message}`);
});

chatServer.on('error', (err) => {
    console.error(`채팅 서버 실행 중 오류 발생: ${err.message}`);
});
