// Backend implementation using Node.js and Express with centralized logging management

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const geoip = require('geoip-lite');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./src/controllers/db');
const authRouter = require('./src/controllers/auth');
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

// Middleware to check admin authentication
function isAdmin(req, res, next) {
  const user = req.session.user; // Assuming `req.session.user` has user info after authentication
  if (user && user.isAdmin) {
    next();
  } else {
    res.status(403).render('accessDenied', { title: 'Access Denied', message: 'Access denied. Admins only.' });
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
