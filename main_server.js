const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

// .env 파일 로드
dotenv.config();

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
console.log = (...args) => {
    originalConsoleLog(...args);
    mainServerLogStream.write(`${new Date().toISOString()} - ${args.join(' ')}\n`);
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
        });
        console.log('데이터베이스에 연결되었습니다.');
    } catch (error) {
        console.error('데이터베이스 연결 중 오류 발생:', error);
        process.exit(1);
    }
}

// 서버 실행 및 재시작 함수
function startServer(serverName, scriptPath, logStream) {
    let serverProcess;

    const restartServer = () => {
        console.log(`${serverName}를 시작합니다...`);
        serverProcess = spawn('node', [scriptPath]);

        serverProcess.stdout.on('data', (data) => {
            console.log(`[${serverName}] ${data}`);
            logStream.write(`${new Date().toISOString()} - ${data}`);
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`[${serverName} 오류] ${data}`);
            logStream.write(`${new Date().toISOString()} - 오류: ${data}`);
        });

        serverProcess.on('close', (code) => {
            console.error(`[${serverName}] 프로세스가 종료되었습니다. 종료 코드: ${code}. 재시작합니다...`);
            sendEmail(`[${serverName}] 종료 알림`, `[${serverName}] 프로세스가 종료되었습니다. 종료 코드: ${code}.`);
            restartServer();
        });
    };

    restartServer();
}

// 이메일 설정
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 이메일 전송 함수
const sendEmail = (subject, text, attachments = []) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: subject,
        text: text,
        attachments: attachments,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('이메일 전송 중 오류 발생:', error);
        } else {
            console.log(`이메일이 전송되었습니다: ${info.response}`);
        }
    });
};

// 30분 단위 로그 분할 및 이메일 전송
const rotateAndSendLogs = () => {
    const attachments = [];

    // 기존 로그 스트림 종료
    [webServerLogStream, chatServerLogStream, mainServerLogStream, discordBotLogStream].forEach((stream) =>
        stream.end()
    );

    // 새로운 로그 스트림 생성
    webServerLogStream = createLogStream('web_server');
    chatServerLogStream = createLogStream('chat_server');
    mainServerLogStream = createLogStream('main_server');
    discordBotLogStream = createLogStream('discord_bot');

    // 이전 로그 파일을 아카이브로 이동하고 이메일 첨부 파일에 추가
    fs.readdirSync(logDir).forEach((file) => {
        if (file.endsWith('.log') && !file.includes('archive')) {
            const oldPath = path.join(logDir, file);
            const newPath = path.join(archiveDir, file);

            fs.renameSync(oldPath, newPath);
            attachments.push({ filename: file, path: newPath });
        }
    });

    // 로그 파일 이메일 전송
    if (attachments.length > 0) {
        sendEmail('30분 단위 서버 로그 파일', '서버 로그 파일을 첨부합니다.', attachments);
    }

    // 다음 30분 후에 다시 호출
    setTimeout(rotateAndSendLogs, 30 * 60 * 1000); // 30분 후 실행
}

// 디스코드 봇 실행 함수
function startDiscordBot() {
    let botProcess;

    const restartBot = () => {
        console.log('디스코드 봇을 시작합니다...');
        botProcess = spawn('node', ['discord_bot.js']);

        botProcess.stdout.on('data', (data) => {
            console.log(`[디스코드 봇] ${data}`);
            discordBotLogStream.write(`${new Date().toISOString()} - ${data}`);
        });

        botProcess.stderr.on('data', (data) => {
            console.error(`[디스코드 봇 오류] ${data}`);
            discordBotLogStream.write(`${new Date().toISOString()} - 오류: ${data}`);
        });

        botProcess.on('close', (code) => {
            console.error(`[디스코드 봇] 프로세스가 종료되었습니다. 종료 코드: ${code}. 재시작합니다...`);
            sendEmail('디스코드 봇 종료 알림', `디스코드 봇이 종료되었습니다. 종료 코드: ${code}.`);
            restartBot();
        });
    };

    restartBot();
}

// 초기 실행
(async () => {
    await connectToDatabase(); // 데이터베이스 연결
    startServer('웹 서버', 'server.js', webServerLogStream);
    startServer('채팅 서버', 'chat_server.js', chatServerLogStream);
    startDiscordBot(); // 디스코드 봇 실행
    rotateAndSendLogs(); // 로그 분할 및 이메일 전송 스케줄 시작
    sendEmail('서버 시작 알림', '서버가 성공적으로 시작되었습니다.');
})();
