require('dotenv').config();
const mysql = require('mysql2/promise'); // mysql2의 promise 모듈 사용

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// 게시물 목록 가져오는 함수
async function getPosts() {
  try {
    const [rows] = await pool.query('SELECT * FROM posts');
    return rows;
  } catch (err) {
    console.error('Error fetching posts:', err);
    throw err;
  }
}

// 특정 쿼리를 실행하는 일반 함수
async function executeQuery(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

// 데이터베이스 연결 확인
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the new database');
    connection.release();
  } catch (err) {
    console.error('Initial database connection error:', err);
  }
})();

module.exports = { getPosts, executeQuery };
