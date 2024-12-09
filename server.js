// Backend implementation using Node.js and Express with centralized logging management

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const geoip = require('geoip-lite');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./src/controllers/db');
const authRouter = require('./src/controllers/auth');
const postRouter = require('./src/services/post_service_router');
const fs = require('fs');
const winston = require('winston');
const session = require('express-session');

// 로그 파일 경로 정의
const logFilePath = path.join(__dirname, 'src/logs/app.log');

// 로그 파일이 없으면 생성
try {
  if (!fs.existsSync(logFilePath)) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    fs.writeFileSync(logFilePath, '');
  }
} catch (error) {
  console.error('로그 파일 생성 중 오류 발생:', error);
}

// 로그 포맷 정의
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});



// winston 설정
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: logFilePath, // 로그 파일 저장
    }),
    new winston.transports.Console({ format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat) }), // 콘솔 출력
  ],
});

// 모든 로그 자동 수집 및 저장
logger.stream = {
  write: function(message) {
    logger.info(message.trim());
  },
};

const app = express();
const port = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // In production, set secure: true
}));

// Middleware
app.use(bodyParser.json());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } })); // Save logs to file
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use('/', express.static(path.join(__dirname, 'ioc')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Middleware to log all requests centrally
app.use((req, res, next) => {
  const ip = req.ip === '::1' ? '127.0.0.1' : req.ip; // Handle local IP
  const geo = geoip.lookup(ip) || {}; // Look up location info based on IP
  const user = req.session.user ? req.session.user.user_id : 'Guest';
  const role = req.session.user && req.session.user.isAdmin ? 'Admin' : 'User';

  logger.info(`Accessed route: ${req.originalUrl}, Method: ${req.method}, IP: ${ip}, Country: ${geo.country || 'Unknown'}, Region: ${geo.region || 'Unknown'}, User: ${user}, Role: ${role}`);

  next();
});

function isAdmin(req, res, next) {
  try {
    // 세션에서 사용자 정보를 확인
    const user = req.session.user;

    // 사용자 정보와 관리자 권한 확인
    if (user && user.role === 'admin') {
      logger.info(`관리자 인증 성공. 사용자 ID: ${user.user_id}`);
      return next(); // 다음 미들웨어 또는 라우터로 진행
    }

    // 인증 실패 시 처리
    const userId = user?.user_id || 'Unknown'; // 사용자 ID가 없을 경우 대비
    logger.warn(`관리자 인증 실패: 권한 없음. 사용자 ID: ${userId}`);
    res.status(403).render('accessDenied', {
      title: 'Access Denied',
      message: '관리자만 접근할 수 있습니다.',
    });
  } catch (error) {
    // 세션이 없거나 기타 오류 발생 시 처리
    const userId = req.session?.user?.user_id || 'Unknown'; // 에러 상황에서도 사용자 ID 확인
    logger.error(`관리자 인증 중 오류 발생. 사용자 ID: ${userId}, 오류 메시지: ${error.message}`);
    res.status(403).render('accessDenied', {
      title: 'Access Denied',
      message: '관리자만 접근할 수 있습니다.',
    });
  }
}

// Home route
app.get('/', (req, res) => {
  // Render the home page using EJS
  res.render('index', {
    title: 'Home Page',
    ip: req.ip,
    country: 'Unknown',
    region: 'Unknown'
  });
});

// Connect authentication router
app.use('/', authRouter);

// Connect post and comment router
app.use('/', postRouter);

// Logs page route (admin only)
app.get('/logs', isAdmin, (req, res) => {
  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Failed to read log file: ${err.message}`);
      return res.status(500).send('로그 파일을 읽는 중 오류가 발생했습니다.');
    }

    // 로그 데이터를 JSON 배열로 처리
    const logs = data
      .split('\n') // 줄바꿈 기준으로 나누기
      .filter(Boolean) // 빈 줄 제거
      .map(line => {
        try {
          return JSON.parse(line); // JSON 포맷으로 변환
        } catch (error) {
          return { message: line }; // JSON 변환 실패 시 원본 줄 반환
        }
      });

    res.render('logs', {
      title: '서버 로그',
      logs: logs, // 로그 배열 전달
      error: null, // 에러 메시지 없음
    });
  });
});


app.post('/logs/view', isAdmin, async (req, res) => {
  const { startTime, endTime, keyword, level } = req.body;

  try {
    const userId = req.user?.user_id || 'Unknown'; // req.user가 없을 경우 대비
    console.log(`Log search requested by user ID: ${userId}, Filters: ${JSON.stringify(req.body)}`);

    const logs = await searchLogs({ startTime, endTime, keyword, level });
    res.render('logs', { 
      title: 'Log Viewer', 
      logs, 
      error: null 
    });
  } catch (error) {
    const userId = req.user?.user_id || 'Unknown'; // 에러 발생 시에도 안전하게 user_id를 확인
    console.error(`Error fetching logs for user ID: ${userId}`, error.message);
    res.status(500).render('logs', { 
      title: 'Log Viewer', 
      logs: [], 
      error: '로그 검색 중 오류가 발생했습니다.' 
    });
  }
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
