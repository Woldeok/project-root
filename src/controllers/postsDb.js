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

// 게시물 목록 가져오기
async function getPosts(search = '') {
  try {
    let query = `
      SELECT posts.*, user.nickname AS user_name, user.role AS user_role
      FROM posts
      LEFT JOIN user ON posts.user_id = user.user_id
    `;
    let params = [];

    if (search) {
      query += ` WHERE posts.title LIKE ? OR posts.content LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY posts.created_at DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  } catch (err) {
    console.error('Error fetching posts:', err);
    throw err;
  }
}

// 특정 게시물 가져오기
async function getPostById(postId) {
  try {
    const query = `
      SELECT posts.*, user.nickname AS user_name, user.role AS user_role
      FROM posts
      LEFT JOIN user ON posts.user_id = user.user_id
      WHERE posts.post_id = ?
    `;
    const [rows] = await pool.query(query, [postId]);
    return rows[0]; // 단일 게시물 반환
  } catch (err) {
    console.error('Error fetching post by ID:', err);
    throw err;
  }
}

// 게시물 생성
async function createPost(userId, title, content) {
  try {
    const query = `
      INSERT INTO posts (user_id, title, content, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    const [result] = await pool.execute(query, [userId, title, content]);
    return result.insertId; // 생성된 게시물 ID 반환
  } catch (err) {
    console.error('Error creating post:', err);
    throw err;
  }
}

// 댓글 삭제 함수 (게시물 삭제 시 호출)
async function deleteCommentsByPostId(postId) {
  try {
    const query = `DELETE FROM comments WHERE post_id = ?`;
    const [result] = await pool.execute(query, [postId]);
    return result.affectedRows; // 삭제된 행 수 반환
  } catch (err) {
    console.error('Error deleting comments:', err);
    throw err;
  }
}

// 게시물 삭제
async function deletePost(postId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 댓글 삭제
    await connection.query('DELETE FROM comments WHERE post_id = ?', [postId]);

    // 게시물 삭제
    await connection.query('DELETE FROM posts WHERE post_id = ?', [postId]);

    await connection.commit();
    console.log('게시물과 관련된 댓글이 성공적으로 삭제되었습니다.');
  } catch (err) {
    await connection.rollback();
    console.error('Error deleting post:', err);
    throw err;
  } finally {
    connection.release();
  }
}

// 데이터베이스 연결 확인
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
  } catch (err) {
    console.error('Initial database connection error:', err);
  }
})();

module.exports = {
  getPosts,
  getPostById,
  createPost,
  deleteCommentsByPostId,
  deletePost,
};
