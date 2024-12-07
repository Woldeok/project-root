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
    logger.warn('관리자 인증 실패: 권한 없음');
    res.status(403).render('accessDenied', {
      title: 'Access Denied',
      message: '관리자만 접근할 수 있습니다.',
    });
  } catch (error) {
    // 세션이 없거나 기타 오류 발생 시 처리
    logger.error('관리자 인증 중 오류 발생:', error.message);
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
      return res.status(500).send('Unable to read log file.');
    }
    res.render('logs', {
      title: 'Server Logs',
      logs: data
    });
  });
});

// Start server
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
