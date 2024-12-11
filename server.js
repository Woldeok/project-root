require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const geoip = require('geoip-lite');
const requestIp = require('request-ip'); // 추가된 라이브러리
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
const http = require('http');

const port = process.env.PORT || 3000;
// http.createServer((req, res) => {
//   const options = {
//     hostname: 'localhost',
//     port: 3000,
//     path: req.url,
//     method: req.method,
//     headers: req.headers,
//   };

//   const proxy = http.request(options, (response) => {
//     res.writeHead(response.statusCode, response.headers);
//     response.pipe(res, { end: true });
//   });

//   req.pipe(proxy, { end: true });
// }).listen(80, () => {
//   console.log('Proxy running on port 80');
// });
// app.set('trust proxy', true);

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

const blockedIPs = new Map(); // 차단된 IP와 만료 시간 저장
const failedRequests = {}; // 요청 실패 기록
const ipRequestCounts = {}; // IP별 요청 빈도 기록
const BLOCK_TIME = 3600 * 1000; // 1시간 (밀리초)
const MAX_FAILED_REQUESTS = 50; // 허용 가능한 최대 요청 실패 수
const REQUEST_WINDOW = 60000; // 1분 (밀리초)
const MAX_REQUESTS_PER_MINUTE = 100; // 1분당 최대 요청 수

// 파란색 로그 출력 함수
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
// 차단된 IP 목록 확인 API
app.get('/list-blocked-ips', isAdmin, (req, res) => {
  const blockedList = Array.from(blockedIPs.entries()).map(([ip, unblockTime]) => ({
      ip,
      unblockTime: new Date(unblockTime).toLocaleString(),
  }));

  res.json({ blockedIPs: blockedList });
});
// IP 차단 해제 API
app.post('/unblock-ip', isAdmin, (req, res) => {
  const { ip } = req.body; // 클라이언트에서 차단 해제할 IP를 전달받음

  if (!ip) {
      return res.status(400).json({ error: 'IP를 입력하세요.' });
  }

  if (blockedIPs.has(ip)) {
      blockedIPs.delete(ip);
      logger.info(`IP ${ip}의 차단이 해제되었습니다.`);
      return res.json({ message: `IP ${ip}의 차단이 해제되었습니다.` });
  } else {
      return res.status(404).json({ error: `IP ${ip}는 차단된 상태가 아닙니다.` });
  }
});






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
const blockIp = (ip) => {
  const unblockTime = Date.now() + BLOCK_TIME;
  blockedIPs.set(ip, unblockTime);
  console.log(`IP ${ip} 차단됨. 해제 시간: ${new Date(unblockTime).toLocaleString()}`);
};
// IP 차단 미들웨어
app.use((req, res, next) => {
  const ip = getClientIp(req);
  const currentTime = Date.now();

  // 내부 IP는 차단 로직 우회
  if (isInternalIp(ip)) {
    logInfo(`내부 IP ${ip}는 차단 대상에서 제외됩니다.`);
    return next();
  }

  // 차단된 IP인지 확인
  if (blockedIPs.has(ip)) {
    const unblockTime = blockedIPs.get(ip);
    if (currentTime < unblockTime) {
      logInfo(`IP ${ip}는 현재 차단된 상태입니다. 차단 해제 시간: ${new Date(unblockTime).toLocaleString('ko-KR')}`);
      return res.status(403).send('당신의 접근이 일시적으로 차단되었습니다. 나중에 다시 시도하세요.');
    } else {
      blockedIPs.delete(ip); // 차단 시간이 지났으면 차단 해제
      logInfo(`IP ${ip}의 차단이 해제되었습니다.`);
    }
  }

  next();
});
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

// 이메일 전송 함수
const sendEmail = async (ip, startTime, unblockTime) => {
  const mailOptions = {
    from: 'jungchwimisaenghwal63@gmail.com', // 발신 이메일
    to: 'jungchwimisaenghwal63@gmail.com', // 수신 이메일
    subject: `IP 차단 알림: ${ip}`,
    text: `IP ${ip}가 1분당 요청 제한을 초과하여 차단되었습니다.\n\n
    - 차단 시작 시간: ${new Date(startTime).toLocaleString('ko-KR')}\n
    - 차단 해제 예정 시간: ${new Date(unblockTime).toLocaleString('ko-KR')}\n\n
    디도스 공격 가능성을 확인하세요.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`개발자에게 차단 이메일 전송 완료: ${ip}`);
  } catch (error) {
    console.error('이메일 전송 중 오류 발생:', error);
  }
};
const unblockIp = (ip) => {
  if (blockedIPs.has(ip)) {
    blockedIPs.delete(ip);
    console.log(`IP ${ip}의 차단이 해제되었습니다.`);
  } else {
    console.log(`IP ${ip}는 차단 목록에 없습니다.`);      
  }
};
// 요청 감시 및 차단 로직
app.use((req, res, next) => {
  const ip = getClientIp(req);
  const currentTime = Date.now();

  // 내부 IP는 차단 로직 우회
  if (isInternalIp(ip)) {
    logInfo(`내부 IP ${ip}는 요청 제한에서 제외됩니다.`);
    return next();
  }

  // 관리자는 차단하지 않음
  const currentUser = req.session?.user; // 세션에서 사용자 정보 가져오기
  if (currentUser && currentUser.role === 'admin') {
    logInfo(`관리자 IP ${ip}는 차단 대상에서 제외됩니다.`);
    return next();
  }

  // IP별 요청 빈도 기록
  if (!ipRequestCounts[ip]) {
    ipRequestCounts[ip] = [];
  }

  ipRequestCounts[ip].push(currentTime);
  ipRequestCounts[ip] = ipRequestCounts[ip].filter(timestamp => currentTime - timestamp <= REQUEST_WINDOW);

  if (ipRequestCounts[ip].length > MAX_REQUESTS_PER_MINUTE) {
    blockedIPs.set(ip, Date.now() + BLOCK_TIME);
    logInfo(`IP ${ip}가 1분당 요청 제한을 초과하여 차단되었습니다. 차단 해제 시간: ${new Date(Date.now() + BLOCK_TIME).toLocaleString('ko-KR')}`);
    sendEmail(ip, startTime, unblockTime);
    return res.status(403).send('1분 내 과도한 요청으로 인해 접근이 차단되었습니다.');
   
  }

  // 실패 요청 기록 증가
  failedRequests[ip] = (failedRequests[ip] || 0) + 1;

  if (failedRequests[ip] > MAX_FAILED_REQUESTS) {
    blockedIPs.set(ip, Date.now() + BLOCK_TIME); // 현재 시간 기준 차단 시간 설정
    logInfo(`IP ${ip}가 너무 많은 실패 요청으로 인해 차단되었습니다. 차단 해제 시간: ${new Date(Date.now() + BLOCK_TIME).toLocaleString('ko-KR')}`);
    return res.status(403).send('너무 많은 요청으로 인해 접근이 일시적으로 차단되었습니다.');
  }

  logInfo(`IP ${ip}의 요청 실패 횟수: ${failedRequests[ip]} / ${MAX_FAILED_REQUESTS}`);
  next();
});




const shopRouter = require('./src/routes/shop_router');

// 상점 라우터 등록
app.use('/shop', shopRouter);


// 요청 정상 처리 후 실패 기록 초기화
app.use((req, res, next) => {
  const ip = getClientIp(req);
  
  // 내부 IP는 실패 기록 초기화에서 제외
  if (isInternalIp(ip)) {
    return next();
  }

  if (failedRequests[ip]) {
    delete failedRequests[ip]; // 정상 요청 시 실패 기록 삭제
    logInfo(`IP ${ip}의 요청 실패 기록이 초기화되었습니다.`);
  }
  next();
});

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





// Express 미들웨어로 IP 감지 및 로깅
const logClientIp = (req, res, next) => {
  const ip = getClientIp(req);
  console.log(`클라이언트 IP: ${ip}`);
  next();
};


// Start server
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
