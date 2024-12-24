const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const axios = require('axios');

// .env 파일 로드
dotenv.config();

// 환경 변수 유효성 검증
if (!process.env.DISCORD_WEBHOOK_URL_INFO || !process.env.DISCORD_WEBHOOK_URL_ERROR) {
    console.error('필수 DISCORD_WEBHOOK_URL이 .env 파일에 설정되지 않았습니다.');
    process.exit(1);
}

// 로그 관리 폴더 생성
const logDir = path.join(__dirname, 'logs');
const archiveDir = path.join(logDir, 'archive');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });

// 30분 단위로 저장될 로그 파일 이름 생성
const getLogFilename = (prefix) => {
    const now = new Date();
    const timeSegment = now.getMinutes() < 30 ? '00-30' : '30-60';
    const dateSegment = now.toISOString().split('T')[0];
    return `${prefix}_${dateSegment}_${timeSegment}.log`;
};

// 로그 스트림 생성
const createLogStream = (prefix) => {
    const filename = getLogFilename(prefix);
    const filepath = path.join(logDir, filename);
    return fs.createWriteStream(filepath, { flags: 'a' });
};

// 로그 스트림
let webServerLogStream = createLogStream('web_server');
let chatServerLogStream = createLogStream('chat_server');
let mainServerLogStream = createLogStream('main_server');
let discordBotLogStream = createLogStream('discord_bot');

// 로그 출력 설정
const originalConsoleLog = console.log;
const discordLogQueues = {
    info: [],
    error: [],
};

// 로그에 서버 이름 포함 및 조건 처리
console.log = (serverName, ...args) => {
    const logMessage = `${new Date().toISOString()} - [${serverName}] ${args.join(' ')}`;
    originalConsoleLog(logMessage); // 콘솔 출력
    mainServerLogStream.write(`${logMessage}\n`); // 메인 서버 로그 파일 기록

    // 메인 서버 로그 조건 처리
    if (serverName === '메인 서버' && args.join(' ').includes('디스코드로 로그가 전송되었습니다')) {
        discordLogQueues.info.push(logMessage); // "디스코드로 로그가 전송되었습니다" 메시지만 전송
    } else if (serverName !== '메인 서버') {
        discordLogQueues.info.push(logMessage); // 나머지 서버 로그는 모두 전송
    }
};

console.error = (serverName, ...args) => {
    const logMessage = `${new Date().toISOString()} - [${serverName}] ${args.join(' ')}`;
    originalConsoleLog(logMessage); // 콘솔 출력
    mainServerLogStream.write(`${logMessage}\n`); // 메인 서버 로그 파일 기록

    // 에러 로그는 모든 서버에서 전송
    discordLogQueues.error.push(logMessage);
};

// 데이터베이스 연결
let dbConnection;

async function connectToDatabase() {
    try {
        dbConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
        });
        console.log('메인 서버', '데이터베이스에 연결되었습니다.');
    } catch (error) {
        console.error('메인 서버', '데이터베이스 연결 중 오류 발생:', error);
        process.exit(1);
    }
}

// 서버 실행 및 재시작 함수
function startServer(serverName, scriptPath, logStream) {
    let serverProcess;

    const restartServer = () => {
        console.log(serverName, `${serverName}를 시작합니다...`);
        serverProcess = spawn('node', [scriptPath]);

        serverProcess.stdout.on('data', (data) => {
            const logMessage = `[${serverName}] ${data.toString().trim()}`;
            originalConsoleLog(logMessage); // 콘솔 출력
            logStream.write(`${new Date().toISOString()} - ${logMessage}\n`);
            discordLogQueues.info.push(logMessage);
        });

        serverProcess.stderr.on('data', (data) => {
            const errorMessage = `[${serverName} 오류] ${data.toString().trim()}`;
            originalConsoleLog(errorMessage); // 콘솔 출력
            logStream.write(`${new Date().toISOString()} - 오류: ${errorMessage}\n`);
            discordLogQueues.error.push(errorMessage);
        });

        serverProcess.on('close', (code) => {
            const closeMessage = `[${serverName}] 프로세스가 종료되었습니다. 종료 코드: ${code}. 재시작합니다...`;
            originalConsoleLog(closeMessage); // 콘솔 출력
            logStream.write(`${new Date().toISOString()} - ${closeMessage}\n`);
            discordLogQueues.error.push(closeMessage);
            restartServer();
        });
    };

    restartServer();
}

// 디스코드 봇 실행 함수
function startDiscordBot() {
    let botProcess;

    const restartBot = () => {
        console.log('디스코드 봇', '디스코드 봇을 시작합니다...');
        botProcess = spawn('node', ['discord_bot.js']);

        botProcess.stdout.on('data', (data) => {
            const logMessage = `[디스코드 봇] ${data.toString().trim()}`;
            originalConsoleLog(logMessage); // 콘솔 출력
            discordBotLogStream.write(`${new Date().toISOString()} - ${logMessage}\n`);
            discordLogQueues.info.push(logMessage);
        });

        botProcess.stderr.on('data', (data) => {
            const errorMessage = `[디스코드 봇 오류] ${data.toString().trim()}`;
            originalConsoleLog(errorMessage); // 콘솔 출력
            discordBotLogStream.write(`${new Date().toISOString()} - 오류: ${errorMessage}\n`);
            discordLogQueues.error.push(errorMessage);
        });

        botProcess.on('close', (code) => {
            const closeMessage = `[디스코드 봇] 프로세스가 종료되었습니다. 종료 코드: ${code}. 재시작합니다...`;
            originalConsoleLog(closeMessage); // 콘솔 출력
            discordBotLogStream.write(`${new Date().toISOString()} - ${closeMessage}\n`);
            discordLogQueues.error.push(closeMessage);
            restartBot();
        });
    };

    restartBot();
}

// 디스코드 로그 전송
async function sendLogsToDiscordByType(logType) {
    const discordWebhook = process.env[`DISCORD_WEBHOOK_URL_${logType.toUpperCase()}`];
    if (!discordWebhook) {
        console.error('메인 서버', `${logType.toUpperCase()} DISCORD_WEBHOOK_URL이 설정되지 않았습니다.`);
        return;
    }

    setInterval(async () => {
        if (discordLogQueues[logType].length > 0) {
            const messages = discordLogQueues[logType].splice(0, 5).join('\n');
            try {
                await axios.post(discordWebhook, { content: `\`\`\`${messages}\`\`\`` });
            } catch (error) {
                console.error('메인 서버', `[${logType.toUpperCase()}] 디스코드 로그 전송 중 오류 발생:`, error.message);
            }
        }
    }, 2000);
}

// 초기 실행
(async () => {
    await connectToDatabase();
    startServer('웹 서버', 'server.js', webServerLogStream);
    startServer('채팅 서버', 'chat_server.js', chatServerLogStream);
    startDiscordBot();
    sendLogsToDiscordByType('info');
    sendLogsToDiscordByType('error');
    console.log('메인 서버', '서버가 성공적으로 시작되었습니다.');
})();
