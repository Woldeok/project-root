const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const router = express.Router();
const db = require('./db');
const SECRET_KEY = 'your_secret_key'; // 실제 비밀키로 교체하세요
const logger = console;

// 쿠키 파서 미들웨어 사용 설정
router.use(cookieParser());

// 회원가입 라우트
router.post('/signup', async (req, res) => {
  console.time('Signup process');
  logger.info('Signup request received:', req.body);

  const { user_id, nickname, password, email } = req.body;

  try {
    console.time('Hash password');
    const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화
    console.timeEnd('Hash password');

    console.time('Generate token');
    const token = jwt.sign({ user_id }, SECRET_KEY, { expiresIn: '1h' }); // JWT 토큰 생성
    console.timeEnd('Generate token');

    const emailValue = email === '' ? null : email; // 빈 이메일 값 처리

    const sql = 'INSERT INTO user (user_id, nickname, password, email, token) VALUES (?, ?, ?, ?, ?)';
    const values = [user_id, nickname, hashedPassword, emailValue, token];

    console.time('DB insert user');
    logger.info('Executing query:', sql, values);
    db.query(sql, values, (err, results) => {
      console.timeEnd('DB insert user');
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          logger.error('Duplicate entry:', err);
          return res.status(409).send('이미 존재하는 사용자 ID 또는 이메일입니다.');
        }
        logger.error('Error inserting user:', err);
        return res.status(500).send('회원 생성에 실패했습니다');
      }
      logger.info('User created successfully with ID:', user_id);
      res.status(201).redirect('/'); // 회원가입 후 메인 페이지로 리다이렉트
    });
  } catch (error) {
    logger.error('Signup process failed:', error);
    res.status(500).send('회원 가입 중 오류가 발생했습니다.');
  } finally {
    console.timeEnd('Signup process');
  }
});

// 로그인 라우트
router.post('/login', (req, res) => {
  console.time('Login process');
  logger.info('Login request received:', req.body);
  const { user_id, password } = req.body;

  console.time('DB query user');
  db.query('SELECT * FROM user WHERE user_id = ?', [user_id], async (err, results) => {
    console.timeEnd('DB query user');
    if (err) {
      logger.error('Error querying user:', err);
      return res.status(500).send('로그인 중 오류가 발생했습니다.');
    }

    if (results.length === 0) {
      logger.warn('Invalid credentials for user ID:', user_id);
      return res.status(401).send('잘못된 사용자 ID 또는 비밀번호입니다.');
    }

    const user = results[0];

    console.time('Compare password');
    const validPassword = await bcrypt.compare(password, user.password); // 비밀번호 검증
    console.timeEnd('Compare password');

    if (!validPassword) {
      logger.warn('Invalid password for user ID:', user_id);
      return res.status(401).send('잘못된 사용자 ID 또는 비밀번호입니다.');
    }

    console.time('Generate token');
    const token = jwt.sign({ user_id }, SECRET_KEY, { expiresIn: '10000h' }); // 10000시간 만료
    console.timeEnd('Generate token');

    res.cookie('auth_token', token, { httpOnly: true, secure: true });
    logger.info(`Login successful for user ID: ${user_id}. Token: ${token}`);
    res.status(200).redirect('/'); // 로그인 후 메인 페이지로 리다이렉트
  });
  console.timeEnd('Login process');
});

// 회원가입 페이지 라우트
router.get('/signup', (req, res) => {
  logger.info('Rendering signup page');
  res.render('signup', { title: '회원가입 페이지' });
});

// 로그인 페이지 라우트
router.get('/login', (req, res) => {
  logger.info('Rendering login page');
  res.render('login', { title: '로그인 페이지' });
});

module.exports = router;
