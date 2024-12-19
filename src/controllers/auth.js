const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const router = express.Router();
const db = require('../controllers/db'); // 데이터베이스 연결
const SECRET_KEY = process.env.SECRET_KEY;
const logger = console;

// 쿠키 파서 미들웨어
router.use(cookieParser());
router.get('/logout', (req, res) => {
  if (req.session) {
      // 세션 삭제
      req.session.destroy((err) => {
          if (err) {
              console.error('세션 삭제 중 오류:', err);
              return res.status(500).send('로그아웃 실패');
          }
          // 로그아웃 후 메인 페이지로 리다이렉트
          res.redirect('/');
      });
  } else {
      res.redirect('/');
  }
});
// 회원가입 라우트
router.post('/signup', async (req, res) => {
  console.time('회원가입 처리');
  logger.info('회원가입 요청 수신:', req.body);

  const { user_id, nickname, password, email } = req.body;
  const role = 'user'; // 기본 권한을 'user'로 설정

  try {
    // 비밀번호 해싱
    console.time('비밀번호 해싱');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.timeEnd('비밀번호 해싱');

    // JWT 생성
    console.time('JWT 토큰 생성');
    const token = jwt.sign({ user_id, role }, SECRET_KEY, { expiresIn: '1h' });
    console.timeEnd('JWT 토큰 생성');

    const sql = 'INSERT INTO user (user_id, nickname, password, email, token, role) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [user_id, nickname, hashedPassword, email || null, token, role];

    // DB에 사용자 삽입
    console.time('DB 사용자 삽입');
    logger.info('쿼리 실행:', sql, values);
    db.query(sql, values, (err) => {
      console.timeEnd('DB 사용자 삽입');
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          logger.error('중복된 사용자:', err);
          return res.status(409).send('이미 존재하는 사용자 ID 또는 이메일입니다.');
        }
        logger.error('사용자 삽입 오류:', err);
        return res.status(500).send('회원 생성에 실패했습니다.');
      }
      logger.info('사용자 생성 성공. 사용자 ID:', user_id);
      res.status(201).redirect('/');
    });
  } catch (error) {
    logger.error('회원가입 처리 실패:', error);
    res.status(500).send('회원 가입 중 오류가 발생했습니다.');
  } finally {
    console.timeEnd('회원가입 처리');
  }
});


// 로그인 라우트
router.post('/login', (req, res) => {
  console.time('로그인 처리');
  const { user_id, password } = req.body;

  logger.info('로그인 요청 수신:', { user_id });

  // 사용자 조회
  console.time('DB 사용자 조회');
  db.query('SELECT * FROM user WHERE user_id = ?', [user_id], async (err, results) => {
    console.timeEnd('DB 사용자 조회');
    if (err) {
      logger.error('DB 조회 오류:', err);
      return res.status(500).send('로그인 중 오류가 발생했습니다.');
    }

    if (results.length === 0) {
      logger.warn('잘못된 사용자 ID 또는 비밀번호. 사용자 ID:', user_id);
      return res.status(401).send('잘못된 사용자 ID 또는 비밀번호입니다.');
    }

    const user = results[0];
    const role = user.role;
    const isAdmin = role === 'admin';

    logger.info(`DB에서 조회된 사용자 정보: ID: ${user.user_id}, 권한: ${role}`);

    // 비밀번호 검증
    console.time('비밀번호 검증');
    const validPassword = await bcrypt.compare(password, user.password);
    console.timeEnd('비밀번호 검증');

    if (!validPassword) {
      logger.warn('잘못된 비밀번호. 사용자 ID:', user_id);
      return res.status(401).send('잘못된 사용자 ID 또는 비밀번호입니다.');
    }

    // JWT 생성
    console.time('JWT 토큰 생성');
    const token = jwt.sign(
      {
        user_id: user_id, // 사용자 ID
        role: role        // 사용자 권한
      },
      process.env.SECRET_KEY, // 환경 변수에서 키 가져오기
      {
        expiresIn: '1h' // 1시간 유효
      }
    );
    console.timeEnd('JWT 토큰 생성');

    // JWT를 쿠키에만 저장
    res.cookie('auth_token', token, {
      httpOnly: true, // 클라이언트에서 JavaScript로 접근 불가
      secure: false, // HTTP 환경에서는 false로 설정
      sameSite: 'Lax' // 리디렉션 후에도 쿠키가 전송되도록 설정
  });
  

    // 세션에 사용자 정보 저장
    req.session.user = { user_id, role };

    logger.info(`${isAdmin ? '관리자' : '사용자'} 로그인 성공. 사용자 ID: ${user_id}`);
    res.status(200).redirect('/'); // 메인 페이지로 리다이렉트
  });

  console.timeEnd('로그인 처리');
});

// 회원가입 페이지 라우트
router.get('/signup', (req, res) => {
  logger.info('회원가입 페이지 렌더링');
  res.render('signup', { title: '회원가입 페이지' });
});

// 로그인 페이지 라우트
router.get('/login', (req, res) => {
  logger.info('로그인 페이지 렌더링');
  res.render('login', { title: '로그인 페이지' });
});

// JWT 디코딩 (디버깅용)
router.get('/decode', (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).send('토큰이 없습니다.');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ decoded });
  } catch (err) {
    res.status(403).send('유효하지 않은 토큰입니다.');
  }
});

module.exports = router;
