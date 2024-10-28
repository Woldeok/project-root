const express = require('express');
const morgan = require('morgan');
const geoip = require('geoip-lite');
const path = require('path');
const db = require('./src/controllers/db');

// logger 모듈을 절대 경로로 불러오기
const logger = require(path.join(__dirname, 'src', 'logs', 'logger'));

const app = express();
const PORT = process.env.PORT || 3000;

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// HTTP 요청 로깅 설정 (morgan 사용)
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use('/', express.static(path.join(__dirname, 'ioc')));
app.use('/img', express.static(path.join(__dirname, 'img')));
// 데이터베이스 연결 시도
db.getConnection((err, connection) => {
  if (err) {
    logger.error('DB 연결 실패:', err);
  } else {
    logger.info('DB 연결 성공');
    connection.release();
  }
});

// 홈 경로 라우트
app.get('/', (req, res) => {
  const ip = req.ip === '::1' ? '127.0.0.1' : req.ip; // 로컬 IP 처리
  const geo = geoip.lookup(ip) || {}; // IP를 통해 위치 정보 조회

  logger.info(
    `접속 경로: /, IP: ${ip}, 국가: ${geo.country || '알 수 없음'}, 지역: ${geo.region || '알 수 없음'}`
  );

  // EJS로 페이지 렌더링
  res.render('index', {
    title: '홈 페이지',
    ip: ip,
    country: geo.country || '알 수 없음',
    region: geo.region || '알 수 없음'
  });
});

// 서버 시작
app.listen(PORT, () => {
  logger.info(`서버가 http://localhost:${PORT} 에서 시작되었습니다.`);
});
