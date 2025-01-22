const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { exec } = require('child_process');

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '.env') });

// 환경 변수 유효성 검증
const requiredVars = [
    'DISCORD_WEBHOOK_URL_INFO',
    'DISCORD_WEBHOOK_URL_ERROR',
    'DISCORD_BOT_TOKEN',
    'DISCORD_CHANNEL_ID',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_PORT',
    'EMAIL_USER',
    'EMAIL_PASS'
];
const missingVars = requiredVars.filter((key) => !process.env[key]);
if (missingVars.length > 0) {
    console.error(`필수 환경 변수가 누락되었습니다: ${missingVars.join(', ')}`);
    process.exit(1);
}

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 로그 관리 폴더 생성 및 오래된 로그 삭제
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const cleanOldLogs = () => {
    const files = fs.readdirSync(logDir);
    const now = Date.now();
    const threeDays = 3 * 24 * 60 * 60 * 1000;

    files.forEach((file) => {
        const filePath = path.join(logDir, file);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const stats = fs.statSync(filePath);
            if (now - stats.mtimeMs > threeDays) {
                fs.unlinkSync(filePath);
                console.log('메인 서버', `${file} 파일을 삭제했습니다.`);
            }
        }
    });
};
cleanOldLogs();

// 로그 스트림 생성
const createLogStream = (prefix) => {
    const filename = `${prefix}_${new Date().toISOString().split('T')[0]}.log`;
    const filepath = path.join(logDir, filename);
    return fs.createWriteStream(filepath, { flags: 'a' });
};

// 로그 스트림
let webServerLogStream = createLogStream('web_server');
let chatServerLogStream = createLogStream('chat_server');
let mainServerLogStream = createLogStream('main_server');
let discordBotLogStream = createLogStream('discord_bot');

// 로그 관리
const originalConsoleLog = console.log;
const discordLogQueues = {
    info: [],
    error: [],
};

console.log = (serverName, ...args) => {
    const logMessage = `${new Date().toISOString()} - [${serverName}] ${args.join(' ')}`;
    originalConsoleLog(logMessage);
    mainServerLogStream.write(`${logMessage}\n`);
    discordLogQueues.info.push(logMessage);
};

console.error = (serverName, ...args) => {
    const logMessage = `${new Date().toISOString()} - [${serverName}] ${args.join(' ')}`;
    originalConsoleLog(logMessage);
    mainServerLogStream.write(`${logMessage}\n`);
    discordLogQueues.error.push(logMessage);
};

// 데이터베이스 연결
let dbConnection;

async function connectToDatabase() {
    try {
        console.log('메인 서버', '데이터베이스에 연결을 시도합니다...');
        dbConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
        });
        console.log('메인 서버', '데이터베이스에 연결되었습니다.');
    } catch (error) {
        console.error('메인 서버', '데이터베이스 연결 중 오류 발생:', error.message);
        process.exit(1);
    }
}

// 이메일 전송 함수
async function sendEmail(subject, text) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject,
            text,
        });
        console.log('메인 서버', '이메일 전송 완료:', subject);
    } catch (error) {
        console.error('메인 서버', '이메일 전송 중 오류 발생:', error);
    }
}

// 디스코드 메시지 전송 함수 (Webhook 또는 Bot Token 사용)
async function sendToDiscord(logType, messages) {
    const discordWebhook = process.env[`DISCORD_WEBHOOK_URL_${logType.toUpperCase()}`];
    const discordToken = process.env.DISCORD_BOT_TOKEN;
    const discordChannelId = process.env.DISCORD_CHANNEL_ID;

    const splitMessages = [];
    while (messages.length > 2000) {
        const splitIndex = messages.lastIndexOf('\n', 2000);
        splitMessages.push(messages.substring(0, splitIndex !== -1 ? splitIndex : 2000));
        messages = messages.substring(splitMessages[splitMessages.length - 1].length).trim();
    }
    splitMessages.push(messages);

    for (const msg of splitMessages) {
        const payload = { content: `\`\`\`${msg}\`\`\`` };

        if (discordWebhook) {
            try {
                await axios.post(discordWebhook, payload);
            } catch (error) {
                console.error('메인 서버', `[${logType.toUpperCase()}] Webhook 전송 오류:`, error.message);
            }
        }

        if (discordToken && discordChannelId) {
            try {
                await axios.post(
                    `https://discord.com/api/v10/channels/${discordChannelId}/messages`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bot ${discordToken}`,
                        },
                    }
                );
            } catch (error) {
                console.error('메인 서버', `[${logType.toUpperCase()}] Bot Token 전송 오류:`, error.message);
            }
        }
    }
}

// 디스코드 로그 전송 주기 관리
async function sendLogsToDiscordByType(logType) {
    setInterval(async () => {
        if (discordLogQueues[logType].length > 0) {
            const messagesToSend = discordLogQueues[logType].splice(0, 5).join('\n');
            await sendToDiscord(logType, messagesToSend);
        }
    }, 2000);
}

// 데이터베이스 백업 및 SQL 생성
const backupDir = path.join(__dirname, 'db_backups');
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
const mysqldumpPath = '"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump"';

async function backupDatabase() {
    try {
        const [databases] = await dbConnection.query('SHOW DATABASES');
        databases
            .map((db) => db.Database)
            .filter((dbName) => !['information_schema', 'performance_schema', 'mysql', 'sys'].includes(dbName))
            .forEach((dbName) => {
                const backupFile = path.join(backupDir, `${dbName}_${new Date().toISOString().split('T')[0]}.sql`);
                const dumpCommand = `${mysqldumpPath} -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} --databases ${dbName} > "${backupFile}"`;
                exec(dumpCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error('메인 서버', `데이터베이스 ${dbName} 덤프 중 오류 발생:`, error.message);
                        return;
                    }
                    console.log('메인 서버', `데이터베이스 ${dbName} 백업 완료: ${backupFile}`);
                });
            });
    } catch (error) {
        console.error('메인 서버', '백업 중 오류 발생:', error.message);
    }
}


async function saveDatabaseCreationSQL() {
    try {
        const [databases] = await dbConnection.query('SHOW DATABASES');
        const dbNames = databases
            .map((db) => db.Database)
            .filter((dbName) => !['information_schema', 'performance_schema', 'mysql', 'sys'].includes(dbName));

        if (dbNames.length === 0) {
            console.log('메인 서버', '저장할 데이터베이스가 없습니다.');
            return;
        }

        const sqlFilePath = path.join(__dirname, 'database_creation.sql');
        const writeStream = fs.createWriteStream(sqlFilePath, { flags: 'w' });

        for (const dbName of dbNames) {
            console.log('메인 서버', `데이터베이스 ${dbName}의 구조와 데이터를 저장합니다.`);

            // 데이터베이스 구조와 데이터 덤프 생성
            const dumpCommand = `mysqldump -h ${process.env.DB_HOST} -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} --databases ${dbName}`;
            exec(dumpCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error('메인 서버', `데이터베이스 ${dbName} 덤프 중 오류 발생:`, error.message);
                    return;
                }

                writeStream.write(stdout + '\n');
                console.log('메인 서버', `데이터베이스 ${dbName} SQL 생성 완료.`);
            });
        }

        writeStream.end();
        console.log('메인 서버', `데이터베이스 생성 SQL 저장 완료: ${sqlFilePath}`);
    } catch (error) {
        console.error('메인 서버', '데이터베이스 생성 SQL 저장 중 오류 발생:', error.message);
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
            originalConsoleLog(logMessage);
            logStream.write(`${new Date().toISOString()} - ${logMessage}\n`);
            discordLogQueues.info.push(logMessage);
        });

        serverProcess.stderr.on('data', (data) => {
            const errorMessage = `[${serverName} 오류] ${data.toString().trim()}`;
            originalConsoleLog(errorMessage);
            logStream.write(`${new Date().toISOString()} - 오류: ${errorMessage}\n`);
            discordLogQueues.error.push(errorMessage);
        });

        serverProcess.on('close', async (code) => {
            const closeMessage = `[${serverName}] 프로세스가 종료되었습니다. 종료 코드: ${code}. 재시작합니다...`;
            originalConsoleLog(closeMessage);
            logStream.write(`${new Date().toISOString()} - ${closeMessage}\n`);
            discordLogQueues.error.push(closeMessage);
            await sendToDiscord('error', closeMessage);
            await sendEmail(`서버 종료 알림`, closeMessage);
            restartServer();
        });
    };

    restartServer();
    sendEmail(`${serverName} 서버 시작 알림`, `${serverName} 서버가 성공적으로 시작되었습니다.`);
}

function startDiscordBot() {
    console.log('메인 서버', '디스코드 봇을 실행합니다...');
    spawn('node', ['discord_bot.js'], { stdio: 'inherit' });
}

(async () => {
    try {
        await connectToDatabase();
        await saveDatabaseCreationSQL(); // 데이터베이스 생성 SQL 저장
        await backupDatabase(); // 초기 백업 수행

        // 주기적 백업 (1시간마다 실행)
        setInterval(backupDatabase, 60 * 60 * 1000); // 1시간 = 3600000ms

        startServer('웹 서버', 'server.js', webServerLogStream);
        startServer('채팅 서버', 'chat_server.js', chatServerLogStream);
        sendLogsToDiscordByType('info');
        sendLogsToDiscordByType('error');
        startDiscordBot();
        console.log('메인 서버', '서버가 성공적으로 시작되었습니다.');
    } catch (error) {
        console.error('메인 서버', '초기화 중 오류:', error.message);
    } finally {
        if (dbConnection) await dbConnection.end(); // 연결 종료
    }
})();
