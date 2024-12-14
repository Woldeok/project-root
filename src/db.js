const mysql = require('mysql2/promise');
require('dotenv').config(); // dotenv 파일 로드

const pool = mysql.createPool({
  host: process.env.DB_HOST, // 환경 변수에서 데이터베이스 호스트 가져오기
  user: process.env.DB_USER, // 데이터베이스 사용자
  password: process.env.DB_PASSWORD, // 데이터베이스 비밀번호
  database: process.env.DB_NAME, // 데이터베이스 이름
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
