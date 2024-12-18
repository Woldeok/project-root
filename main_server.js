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
const mainLogDir = path.join(logDir, 'main_server_logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
if (!fs.existsSync(mainLogDir)) fs.mkdirSync(mainLogDir, { recursive: true });

// 로그 파일 설정
const webServerLog = fs.createWriteStream(path.join(logDir, 'web_server.log'), { flags: 'a' });
const chatServerLog = fs.createWriteStream(path.join(logDir, 'chat_server.log'), { flags: 'a' });
const mainServerLog = fs.createWriteStream(path.join(mainLogDir, 'main_server.log'), { flags: 'a' });

// 로그 출력 설정
const originalConsoleLog = console.log;
console.log = (...args) => {
    originalConsoleLog(...args);
    mainServerLog.write(`${new Date().toISOString()} - ${args.join(' ')}\n`);
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
            process.stdout.write(`${serverName}: ${data}`);
            logStream.write(data);
        });

        serverProcess.stderr.on('data', (data) => {
            process.stderr.write(`${serverName} 오류: ${data}`);
            logStream.write(data);
        });

        serverProcess.on('close', (code) => {
            console.error(`${serverName}가 종료되었습니다. 종료 코드: ${code}. 재시작합니다...`);
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

// 로그 파일 이메일 전송 함수
const sendLogFiles = () => {
    const attachments = [
        { filename: 'web_server.log', path: path.join(logDir, 'web_server.log') },
        { filename: 'chat_server.log', path: path.join(logDir, 'chat_server.log') },
        { filename: 'main_server.log', path: path.join(mainLogDir, 'main_server.log') },
    ];

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: '서버 로그 파일',
        text: '서버 로그 파일을 첨부합니다.',
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

// 정각과 30분마다 로그 전송
const scheduleLogSend = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    let delay;

    if (minutes < 30) {
        delay = ((30 - minutes) * 60 - seconds) * 1000; // 다음 30분까지 남은 시간
    } else {
        delay = ((60 - minutes) * 60 - seconds) * 1000; // 다음 정각까지 남은 시간
    }

    console.log(`다음 로그 전송 시간까지 ${Math.ceil(delay / 1000)}초 남았습니다.`);

    setTimeout(() => {
        sendLogFiles();
        scheduleLogSend(); // 다시 타이머 설정
    }, delay);
};
function startDiscordBot() {
    console.log('디스코드 봇을 시작합니다...');
    spawn('node', ['discord_bot.js'], {
        stdio: 'inherit', // 메인 프로세스에서 디스코드 봇 로그를 출력
    });
}
// 초기 실행
(async () => {
    await connectToDatabase(); // 데이터베이스 연결
      await exportDatabaseToSQL(); // DB 내보내기
    startServer('웹 서버', 'server.js', webServerLog);
    startServer('채팅 서버', 'chat_server.js', chatServerLog);
    startDiscordBot();
    scheduleLogSend(); // 로그 전송 타이머 시작
    
})();
const exportDatabaseToSQL = async () => {
    try {
        console.log('데이터베이스 내보내기를 시작합니다...');

        // 모든 테이블 목록 가져오기
        const [tables] = await dbConnection.query("SHOW TABLES");

        const sqlDump = [];
        
        for (const table of tables) {
            const tableName = table[Object.keys(table)[0]];

            // 테이블 생성 쿼리 가져오기
            const [createTableQuery] = await dbConnection.query(`SHOW CREATE TABLE \`${tableName}\``);
            sqlDump.push(`-- 테이블 생성: ${tableName}\n${createTableQuery[0]['Create Table']};\n\n`);

            // 테이블 데이터 가져오기
            const [rows] = await dbConnection.query(`SELECT * FROM \`${tableName}\``);
            if (rows.length > 0) {
                const insertStatements = rows.map(row => {
                    const values = Object.values(row)
                        .map(value => (value === null ? 'NULL' : `'${String(value).replace(/'/g, "\\'")}'`))
                        .join(', ');
                    return `INSERT INTO \`${tableName}\` VALUES (${values});`;
                });
                sqlDump.push(`-- ${tableName} 데이터 삽입\n${insertStatements.join('\n')}\n\n`);
            }
        }

        // SQL 덤프 파일로 저장
        const sqlDumpPath = path.join(logDir, 'database_dump.sql');
        fs.writeFileSync(sqlDumpPath, sqlDump.join('\n'));
        console.log(`데이터베이스가 SQL 파일로 내보내졌습니다: ${sqlDumpPath}`);
    } catch (error) {
        console.error('데이터베이스 내보내기 중 오류 발생:', error);
    }
};

// 종료 신호 처리
process.on('SIGINT', async () => {
    console.log('서버 종료 신호를 받았습니다. 모든 프로세스를 종료합니다...');
    if (dbConnection) await dbConnection.end(); // 데이터베이스 연결 종료
    process.exit();
});
