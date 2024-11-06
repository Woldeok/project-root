// auth.js - User authentication routes

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('./db');
// 모든 절차는 콘솔에 로그로 띄워줍니다.
const logger = console;

const SECRET_KEY = 'your_secret_key'; // 토큰 생성에 사용할 비밀키

// User signup route
router.post('/signup', (req, res) => {
  logger.info('Signup request received:', req.body);
  const { user_id, nickname, password, email } = req.body;
  const token = jwt.sign({ user_id }, SECRET_KEY, { expiresIn: '1h' }); // 토큰 생성

  db.getConnection((err, connection) => {
    if (err) {
      logger.error('Error getting database connection:', err);
      return res.status(500).send('Database connection failed');
    }

    const sql = 'INSERT INTO user (user_id, nickname, password, email, token) VALUES (?, ?, ?, ?, ?)';
    const values = [user_id, nickname, password, email, token];

    logger.info('Executing query:', sql, values);
    connection.query(sql, values, (err, results) => {
      connection.release();
      if (err) {
        logger.error('Error inserting user:', err);
        return res.status(500).send('회원 생성에 실패했습니다');
      }
      logger.info('User created successfully with ID:', user_id);
      res.status(201).redirect('/'); // 회원가입 후 메인 페이지로 리다이렉트
    });
  });
});

// User login route
router.post('/login', (req, res) => {
  logger.info('Login request received:', req.body);
  const { user_id, password } = req.body;

  db.getConnection((err, connection) => {
    if (err) {
      logger.error('Error getting database connection:', err);
      return res.status(500).send('Database connection failed');
    }

    const sql = 'SELECT * FROM user WHERE user_id = ? AND password = ?';
    logger.info('Executing query:', sql, [user_id, password]);
    connection.query(sql, [user_id, password], (err, results) => {
      connection.release();
      if (err) {
        logger.error('Error querying user:', err);
        return res.status(500).send('Login failed');
      }
      if (results.length === 0) {
        logger.warn('Invalid credentials for user ID:', user_id);
        return res.status(401).send('Invalid credentials');
      }

      // 로그인 성공 시 토큰 생성 및 응답
      const token = jwt.sign({ user_id }, SECRET_KEY, { expiresIn: '1000h' });
      res.cookie('auth_token', token, { httpOnly: true }); // 쿠키에 토큰 저장
      logger.info('Login successful for user ID:', user_id);
      res.status(200).redirect('/'); // 로그인 후 메인 페이지로 리다이렉트
    });
  });
});

// User signup page route
router.get('/signup', (req, res) => {
  logger.info('Rendering signup page');
  res.render('signup', { title: '회원가입 페이지' });
});

// User login page route
router.get('/login', (req, res) => {
  logger.info('Rendering login page');
  res.render('login', { title: '로그인 페이지' });
});

module.exports = router; // Export router object
