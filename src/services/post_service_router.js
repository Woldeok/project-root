const express = require('express');
const router = express.Router();
const postsDb = require('../controllers/postsDb'); // 게시물 DB 모듈
const jwt = require('jsonwebtoken');
const winston = require('winston');
const SECRET_KEY = 'your_secret_key'; // 실제 비밀키로 교체하세요

// Logger 설정
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [new winston.transports.Console()]
});

// Middleware to verify session token
function verifyToken(req, res, next) {
  const token = req.cookies.auth_token;
  if (!token) {
    logger.warn('No token found, redirecting to login');
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user_id = decoded.user_id;
    req.session.user = { user_id: decoded.user_id }; // 세션 사용자 설정
    next();
  } catch (error) {
    logger.error('Invalid token, redirecting to login');
    res.clearCookie('auth_token'); // 토큰 무효화
    return res.redirect('/login');
  }
}

router.get('/', async (req, res) => {
  const search = req.query.search || ''; // 검색어 가져오기 (없으면 빈 문자열)
  try {
      const posts = await postsDb.getPosts(search); // 검색어를 통해 게시물 가져오기
      res.render('board', { title: '게시판', posts, search }); // 검색어 포함 전달
  } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).send('게시판 데이터를 불러오는 중 오류가 발생했습니다.');
  }
});
// 검색 라우트
router.get('/board/search', async (req, res) => {
  const { keyword } = req.query;
  const searchCondition = {
    $or: [
      { title: { $regex: keyword, $options: 'i' } },
      { content: { $regex: keyword, $options: 'i' } },
      { author: { $regex: keyword, $options: 'i' } },
    ],
  };
  const posts = await Post.find(searchCondition).sort({ createdAt: -1 });
  res.render('board', { posts });
});


router.get('/board', async (req, res) => {
  const search = req.query.search || ''; // 검색어 처리
  try {
    const posts = await postsDb.getPosts(search); // 게시물 목록 가져오기
    res.render('board', { 
      title: '게시판', 
      posts, 
      search, 
      currentUser: req.session.user || null 
    });
  } catch (error) {
    logger.error('게시물 불러오기 실패', error);
    res.status(500).render('error', { 
      title: 'Error', 
      message: '게시물 불러오기 실패. 다시 시도해 주세요.' 
    });
  }
});

router.post('/board/:postId/delete', async (req, res) => {
  const postId = req.params.postId;

  try {
    // 게시물 삭제 함수 호출
    const deletedRows = await postsDb.deletePost(postId);

    if (deletedRows > 0) {
      res.status(200).json({ message: '게시물이 성공적으로 삭제되었습니다.' });
    } else {
      res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
    }
  } catch (error) {
    logger.error('게시물 삭제 실패', error);
    res.status(500).json({ message: '게시물 삭제에 실패했습니다. 다시 시도해 주세요.' });
  }
});



// 게시물 작성 폼 - GET /board/new
router.get('/board/new', verifyToken, (req, res) => {
  res.render('newPost', { title: '새 게시물 작성', currentUser: req.session.user });
});


// 게시물 생성 - POST /board
router.post('/board', verifyToken, async (req, res) => {
  const { title, content } = req.body;
  const user_id = req.user_id;

  try {
    const result = await postsDb.executeQuery('INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)', [user_id, title, content]);
    logger.info(`Created post with ID ${result.insertId} by user ${user_id}`);
    res.redirect(`/board/${result.insertId}`);
  } catch (error) {
    logger.error('게시물 생성 실패', error);
    res.status(500).render('error', { title: 'Error', message: '게시물 생성 중 오류가 발생했습니다.' });
  }
});

// 게시물 상세 조회 - GET /board/:post_id
router.get('/board/:post_id', async (req, res) => {
  const { post_id } = req.params;
  try {
    const post = await postsDb.executeQuery('SELECT * FROM posts WHERE post_id = ?', [post_id]);
    const comments = await postsDb.executeQuery('SELECT * FROM comments WHERE post_id = ?', [post_id]);
    if (post.length === 0) {
      logger.warn(`Post ID ${post_id} not found`);
      return res.status(404).render('notFound', { title: 'Not Found', message: '게시물을 찾을 수 없습니다.' });
    }

    const isAuthorOrAdmin = req.session.user &&
      (req.session.user.user_id === post[0].user_id || req.session.user.isAdmin);

    res.render('postDetail', {
      title: '게시물 상세보기',
      post: post[0],
      comments,
      currentUser: req.session.user,
      isAuthorOrAdmin
    });
  } catch (error) {
    logger.error('게시물 상세 조회 실패', error);
    res.status(500).render('error', { title: 'Error', message: '게시물 조회 중 오류가 발생했습니다.' });
  }
});

// 게시물 수정 폼 - GET /board/:post_id/edit
router.get('/board/:post_id/edit', verifyToken, async (req, res) => {
  const { post_id } = req.params;
  try {
    const post = await postsDb.executeQuery('SELECT * FROM posts WHERE post_id = ?', [post_id]);
    if (post.length === 0) {
      logger.warn(`Post ID ${post_id} not found`);
      return res.status(404).render('notFound', { title: 'Not Found', message: '게시물을 찾을 수 없습니다.' });
    }
    res.render('editPost', { title: 'Edit Post', post: post[0], currentUser: req.session.user });
  } catch (error) {
    logger.error('게시물 수정 폼 조회 실패', error);
    res.status(500).render('error', { title: 'Error', message: '게시물 수정 폼 불러오기 실패.' });
  }
});


// 게시물 수정 - POST /board/:post_id
router.post('/board/:post_id', verifyToken, async (req, res) => {
  const { post_id } = req.params;
  const { title, content } = req.body;
  try {
    await postsDb.executeQuery('UPDATE posts SET title = ?, content = ? WHERE post_id = ?', [title, content, post_id]);
    logger.info(`Updated post with ID ${post_id}`);
    res.redirect(`/board/${post_id}`);
  } catch (error) {
    logger.error('게시물 수정 실패', error);
    res.status(500).render('error', { title: 'Error', message: '게시물 수정 중 오류가 발생했습니다.' });
  }
});

// 게시물 삭제 - POST /board/:post_id/delete
router.post('/board/:post_id/delete', verifyToken, async (req, res) => {
  const { post_id } = req.params;
  try {
    await postsDb.executeQuery('DELETE FROM posts WHERE post_id = ?', [post_id]);
    logger.info(`Deleted post with ID ${post_id}`);
    res.redirect('/board');
  } catch (error) {
    logger.error('게시물 삭제 실패', error);
    res.status(500).render('error', { title: 'Error', message: '게시물 삭제 중 오류가 발생했습니다.' });
  }
});

// 댓글 작성 라우트 - POST /board/:post_id/comments
router.post('/board/:post_id/comments', verifyToken, async (req, res) => {
  const { post_id } = req.params;
  const { content } = req.body;
  const user_id = req.user_id;

  try {
    await postsDb.executeQuery(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [post_id, user_id, content]
    );
    logger.info(`Comment added to post ${post_id} by user ${user_id}`);
    res.redirect(`/board/${post_id}`);
  } catch (error) {
    logger.error('댓글 작성 실패', error);
    res.status(500).render('error', { title: 'Error', message: '댓글 작성 중 오류가 발생했습니다.' });
  }
});

module.exports = router;
