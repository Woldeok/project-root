require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const geoip = require('geoip-lite');
const requestIp = require('request-ip'); // 추가된 라이브러리
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./src/controllers/db');
const authRouter = require('./src/controllers/auth');
const postRouter = require('./src/routes/post_service_router');
const fs = require('fs');
const winston = require('winston');
const session = require('express-session');
const axios = require('axios');
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
const http = require('http');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;
const ipBlockRouter = require('./src/routes/ip_block_router');
app.use('/', ipBlockRouter);
app.use(ipBlockRouter);
app.use('/board', ipBlockRouter);
app.use(ipBlockRouter);
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
app.use('/', express.static(path.join(__dirname, 'robots')));
app.use('/img', express.static(path.join(__dirname, 'img')));

const logInfo = (message) => {
  console.log(`\x1b[34m%s\x1b[0m`, message); // 파란색 출력
};

const getClientIp = (req) => {
  // 우선순위: X-Forwarded-For > X-Real-IP > req.connection.remoteAddress
  let ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.ip;
  
  // X-Forwarded-For 헤더에서 첫 번째 IP만 사용
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0];
  }
  
  // IPv6에서 ::ffff: 접두사 제거 (IPv4로 변환)
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  return ip.trim();
};

app.use((req, res, next) => {
  console.log(`req.ip: ${req.ip}`);
  console.log(`X-Forwarded-For: ${req.headers['x-forwarded-for']}`);
  console.log(`req.connection.remoteAddress: ${req.connection.remoteAddress}`);
  next();
});

const isInternalIp = (ip) => {
  return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.');
};

const adminRouter = require('./src/routes/admin');
app.use(adminRouter);

app.set('trust proxy', true);
const nodemailer = require('nodemailer');

// 이메일 전송 설정
const transporter = nodemailer.createTransport({    
  service: 'Gmail', // Gmail 사용 (다른 서비스도 가능)
  auth: {
    user: 'jungchwimisaenghwal63@gmail.com', // 개발자 이메일
    pass: 'dntt yvws cwls lqrt', // 이메일 비밀번호 또는 앱 비밀번호
  },
});

const { createProxyMiddleware } = require('http-proxy-middleware'); // 추가
app.use('/api/messages', createProxyMiddleware({
  target: 'http://승진.shop:4000', // 채팅 서버 URL
  changeOrigin: true
}));

// `/c` 경로에서 EJS 템플릿 렌더링
const chatRouter = require('./src/routes/chat'); 
app.use('/', chatRouter);
const cors = require('cors');


const corsOptions = {
  origin: ['http://xn--vu4bw2k.shop'],
  methods: ['GET', 'POST'],
  credentials: true
};

// Middleware to log all requests centrally
app.use((req, res, next) => {
  const ip = getClientIp(req);
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
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session && req.session.user ? true : false;
  res.locals.isAdmin = req.session && req.session.user && req.session
// 계속되는 서버 구성 코드...
res.locals.isAdmin = req.session && req.session.user && req.session.user.role === 'admin';
  next();
});

// Home route
app.get('/', (req, res) => {
  const isLoggedIn = req.session && req.session.user ? true : false;
  const isAdmin = req.session && req.session.user && req.session.user.role === 'admin';

  // Render the home page using EJS
  res.render('index', {
    title: 'Home Page',
    ip: getClientIp(req),
    country: 'Unknown',
    region: 'Unknown',
    isLoggedIn,
    isAdmin
  });
});

const rssRouter = require('./src/services/rss_router');
app.use(rssRouter);
const sitemapRouter = require('./src/services/sitemap_router');
app.use(sitemapRouter);

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

// Log search API
app.post('/logs/view', isAdmin, async (req, res) => {
  const { startTime, endTime, keyword, level } = req.body;

  try {
    // 로그 파일 읽기
    const logData = fs.readFileSync(logFilePath, 'utf8');
    const logs = logData
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        const matchesLevel = level ? log.level.toLowerCase() === level.toLowerCase() : true;
        const matchesKeyword = keyword ? log.message.includes(keyword) : true;
        const matchesTime =
          (!startTime || logTime >= new Date(startTime).getTime()) &&
          (!endTime || logTime <= new Date(endTime).getTime());
        return matchesLevel && matchesKeyword && matchesTime;
      });

    res.render('logs', {
      title: 'Log Viewer',
      logs,
      error: null,
    });
  } catch (error) {
    console.error(`로그 검색 중 오류 발생: ${error.message}`);
    res.render('logs', {
      title: 'Log Viewer',
      logs: [],
      error: '로그 검색 중 오류가 발생했습니다.',
    });
  }
});

// shop_router.js 추가
const shopRouter = require('./src/routes/shop_router'); // 라우터 경로 확인
app.use('/', shopRouter); // '/shop' 경로에 라우터 적용
const authRouterr = require('./src/routes/authRouter'); // 네이버 인증 관련 라우터
app.use('/', authRouterr); // 네이버 인증 라우터
const kakaoLoginRouter = require('./src/routes/kakao_login_router'); // 라우터 경로에 맞게 수정
app.use('/', kakaoLoginRouter); // 네이버 인증 라우터
// Start server

// const discordRouter = require('./src/routes/discord_router');
// app.use('/discord', discordRouter);

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});

