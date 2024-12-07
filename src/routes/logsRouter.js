const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { searchLogs } = require('../controllers/logsController'); // 로그 검색 함수
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';
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

router.get('/view', verifyAdmin, (req, res) => {
  try {
    console.log(`Log Viewer page accessed by user ID: ${req.user.user_id}`);
    res.render('logs', { title: 'Log Viewer', logs: [] }); // 기본적으로 빈 배열 전달
  } catch (error) {
    console.error('Error loading log viewer:', error.message);
    res.status(500).send('로그 뷰어 로드 중 오류가 발생했습니다.');
  }
});

router.post('/view', verifyAdmin, async (req, res) => {
  const { startTime, endTime, keyword, level } = req.body; // 검색 조건

  try {
    console.log(`Log search requested by user ID: ${req.user.user_id}, Filters: ${JSON.stringify(req.body)}`);
    const logs = await searchLogs({ startTime, endTime, keyword, level }) || []; // 항상 배열 반환
    res.render('logs', {
      title: 'Log Viewer',
      logs,
      filters: { startTime, endTime, keyword, level }, // 검색 조건 표시
    });
  } catch (error) {
    console.error(`Error fetching logs for user ID: ${req.user.user_id}`, error.message);
    res.status(500).render('logs', {
      title: 'Log Viewer',
      logs: [], // 에러 발생 시 빈 배열 전달
      error: '로그 검색 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
