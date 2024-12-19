const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { searchLogs } = require('../controllers/logsController'); // 로그 검색 함수
const SECRET_KEY = process.env.SECRET_KEY;
const db = require('../controllers/db'); // DB 연결 (role 확인용)

// 쿠키 파서 미들웨어 설정
router.use(cookieParser());

// 관리자 인증 미들웨어
async function verifyAdmin(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    console.log('Unauthorized access attempt: No token provided.');
    return res.status(401).render('accessDenied', { 
      title: 'Unauthorized', 
      message: '로그인이 필요합니다. 접근할 수 없습니다.' 
    });
  }

  try {
    // JWT 토큰 검증
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log(`Access attempt by user ID: ${decoded.user_id}, Role: ${decoded.role}`);

    // DB에서 사용자 권한 확인 (추가 검증)
    db.query('SELECT role FROM user WHERE user_id = ?', [decoded.user_id], (err, results) => {
      if (err || results.length === 0) {
        console.error('Database role validation failed:', err || 'User not found.');
        return res.status(403).render('accessDenied', { 
          title: 'Forbidden', 
          message: '관리자 권한이 필요합니다.' 
        });
      }

      const userRole = results[0].role;
      console.log(`Role from database for user ID ${decoded.user_id}: ${userRole}`);

      if (userRole === 'admin' || decoded.role === 'admin') {
        req.user = decoded; // 인증된 사용자 정보 저장
        next();
      } else {
        console.log(`Forbidden access by user ID: ${decoded.user_id}`);
        return res.status(403).render('accessDenied', { 
          title: 'Forbidden', 
          message: '관리자 권한이 필요합니다.' 
        });
      }
    });
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).render('accessDenied', { 
      title: 'Invalid Token', 
      message: '유효하지 않은 토큰입니다.' 
    });
  }
}
router.get('/logs', isAdmin, (req, res) => {
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



module.exports = router;
