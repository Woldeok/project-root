const mysql = require('mysql2/promise');
require('dotenv').config(); // 환경 변수 사용

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

// 모든 페이지 가져오기
async function getAllPages() {
  try {
    const query = `
      SELECT page_id, title, content, updated_at
      FROM pages
      ORDER BY updated_at DESC
    `;
    const [rows] = await pool.query(query);
    return rows;
  } catch (err) {
    console.error('Error fetching pages:', err);
    throw err;
  }
}

module.exports = {
  getAllPages
};
