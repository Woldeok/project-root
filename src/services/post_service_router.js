const express = require('express');
const router = express.Router();
const postsDb = require('../controllers/postsDb'); // 게시물 DB 모듈
const jwt = require('jsonwebtoken');
const winston = require('winston');
const SECRET_KEY = 'your_secret_key'; // 실제 비밀키로 교체하세요
// 관리자 또는 작성자 여부 확인 함수
async function canDeletePost(req, postId) {
  const currentUser = req.session.user;

  if (!currentUser) {
    return false; // 로그인하지 않은 사용자는 권한 없음
  }

  if (currentUser.role === 'admin') {
    return true; // 관리자는 항상 삭제 가능
  }
    // 작성자인지 확인
    const post = await postsDb.getPostById(postId);
    return post && post.user_id === currentUser.user_id;
  }
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
    // 게시물 목록 가져오기
    const posts = await postsDb.getPosts(search);

    // 로그에 is_notice 상태 표시
    posts.forEach(post => {
      console.log(`게시물 ID: ${post.post_id}, 제목: ${post.title}, 공지 여부: ${post.is_notice}`);
    });

    // 프론트엔드에 데이터 전달
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


// 게시물 삭제 라우트
router.get('/board/:post_id', async (req, res) => {
  const { post_id } = req.params;
  const currentUser = req.session.user; // 현재 로그인 사용자 정보

  console.log(`현재 사용자 정보:`, currentUser);

  try {
    const post = await postsDb.getPostById(post_id); // 게시물 데이터 가져오기
    const comments = await postsDb.getCommentsByPostId(post_id); // 댓글 가져오기

    if (!post) {
      console.error('게시물을 찾을 수 없습니다.');
      return res.status(404).send('게시물을 찾을 수 없습니다.');
    }

    // 권한 로그 출력
    if (currentUser) {
      console.log(`권한 상태: ${currentUser.role === 'admin' ? '관리자' : '일반 사용자'}`);
    } else {
      console.log('권한 상태: 비로그인 사용자');
    }

    res.render('post_detail', {
      title: '게시물 상세 보기',
      post,
      comments,
      currentUser, // 사용자 정보 전달
    });
  } catch (err) {
    console.error('게시물 상세 조회 실패:', err);
    res.status(500).send('오류가 발생했습니다.');
  }
});




// 게시물 작성 폼 - GET /board/new
router.get('/board/new/new', (req, res) => {
  try {
      // 현재 사용자 확인
      const currentUser = req.session.user;

      if (!currentUser) {
          console.log('비로그인 사용자 접근');
          return res.status(403).redirect('/login'); // 로그인 페이지로 리다이렉트
      }

      res.render('post_new', { 
          title: '새 게시물 작성', 
          currentUser 
      });
  } catch (error) {
      console.error('게시물 작성 페이지 로드 중 오류:', error);
      res.status(500).send('게시물 작성 페이지를 로드할 수 없습니다.');
  }
});

router.get('/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EC%B2%98%EB%A6%AC%EB%B0%A9%EC%B9%A8', (req, res) => {
      res.render('%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EC%B2%98%EB%A6%AC%EB%B0%A9%EC%B9%A8')
});
router.post('/board', async (req, res) => {
  const { title, content } = req.body;

  try {
    // 데이터베이스에 저장
    await postsDb.createPost(req.session.user.user_id, title, content);
    res.redirect('/board');
  } catch (error) {
    console.error('게시물 작성 중 오류:', error);
    res.status(500).send('게시물 작성 중 오류가 발생했습니다.');
  }
});



router.use((req, res, next) => {
  // JWT 또는 세션에서 사용자 정보 가져오기
  if (req.cookies.auth_token) {
    try {
      req.user = jwt.verify(req.cookies.auth_token, SECRET_KEY);
    } catch (err) {
      console.error('JWT 인증 오류:', err);
    }
  }
  next();
});

router.get('/board/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await postsDb.getPostById(postId); // 게시물 가져오기
    const comments = await postsDb.getCommentsByPostId(postId); // 댓글 가져오기
    const currentUser = req.user || null; // 현재 사용자 정보

    // 로그 확인
    console.log('게시물:', post);
    console.log('댓글 목록:', comments);
    console.log('현재 사용자:', currentUser);

    res.render('post_detail', {
      title: post.title,
      post,
      comments,
      currentUser,
    });
  } catch (error) {
    console.error('게시물 상세 조회 중 오류:', error);
    res.status(500).send('오류가 발생했습니다.');
  }
});













const authenticateJWT = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    req.user = null; // 비로그인 상태 처리
    return next();
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // JWT 디코딩 결과를 req.user에 저장
    next();
  } catch (err) {
    console.error('JWT 인증 오류:', err);
    res.clearCookie('auth_token'); // 잘못된 토큰 삭제
    req.user = null;
    return next();
  }
};

// 모든 라우트에 JWT 인증 미들웨어 추가
router.use(authenticateJWT);

router.get('/board/:postId/comments/:commentId/edit', async (req, res) => {
  const { postId, commentId } = req.params;
  const currentUser = req.user || {}; // 기본값 설정

  console.log('현재 사용자 정보:', currentUser);

  try {
    const comment = await postsDb.getCommentById(commentId);

    if (!comment) {
      return res.status(404).send('댓글을 찾을 수 없습니다.');
    }

    console.log('댓글 정보:', comment);

    // 권한 확인
    if (!(currentUser.role === 'admin' || currentUser.user_id === comment.user_id)) {
      console.log('권한 없음:', { currentUser, comment });
      return res.status(403).send('수정 권한이 없습니다.');
    }

    // 댓글 수정 페이지 렌더링
    res.render('comment_edit', {
      title: '댓글 수정',
      comment: comment,
      postId: postId,
    });
  } catch (error) {
    console.error('댓글 수정 페이지 렌더링 중 오류:', error);
    res.status(500).send('댓글 수정 페이지를 로드할 수 없습니다.');
  }
});



// 댓글 수정 요청 처리
router.post('/board/:postId/comments/:commentId/edit', async (req, res) => {
  const { postId, commentId } = req.params;
  const { content } = req.body;
  const currentUser = req.user;

  try {
    // 댓글 데이터 가져오기
    const comment = await postsDb.getCommentById(commentId);

    if (!comment) {
      return res.status(404).send('댓글을 찾을 수 없습니다.');
    }

    // 권한 확인: 관리자 또는 댓글 작성자인 경우만 수정 가능
    if (currentUser.role !== 'admin' && currentUser.user_id !== comment.user_id) {
      return res.status(403).send('수정 권한이 없습니다.');
    }

    // 댓글 내용 업데이트
    await postsDb.updateCommentById(commentId, content);
    res.redirect(`/board/${postId}`);
  } catch (error) {
    console.error('댓글 수정 중 오류:', error);
    res.status(500).send('댓글 수정에 실패했습니다.');
  }
});

router.post('/board/:postId/comments/:commentId/delete', async (req, res) => {
  const { postId, commentId } = req.params;
  const currentUser = req.session.user; // 현재 로그인한 사용자 정보

  if (!currentUser) {
    console.warn('비로그인 사용자의 댓글 삭제 시도');
    return res.status(403).send('로그인이 필요합니다.');
  }

  try {
    // 댓글 가져오기
    const comment = await postsDb.getCommentById(commentId);
    if (!comment) {
      console.warn(`댓글 ID ${commentId}를 찾을 수 없음`);
      return res.status(404).send('댓글을 찾을 수 없습니다.');
    }

    // 권한 검사
    if (currentUser.role !== 'admin' && currentUser.user_id !== comment.user_id) {
      console.warn(`삭제 권한 없음 - 사용자 ID: ${currentUser.user_id}, 댓글 작성자: ${comment.user_id}`);
      return res.status(403).send('댓글을 삭제할 권한이 없습니다.');
    }

    // 댓글 삭제
    await postsDb.deleteCommentById(commentId);
    console.log(`댓글 ID ${commentId} 삭제 완료`);
    res.redirect(`/board/${postId}`);
  } catch (error) {
    console.error('댓글 삭제 중 오류:', error);
    res.status(500).send('댓글 삭제 중 오류가 발생했습니다.');
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
