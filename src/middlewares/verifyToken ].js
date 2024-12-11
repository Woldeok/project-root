// Middleware to verify session token
function verifyToken(req, res, next) {
    const token = req.cookies.auth_token;
  
    if (!token) {
      logger.warn('No token found, redirecting to login');
      return res.status(401).render('error', {
        title: 'Unauthorized',
        message: '로그인이 필요합니다. 로그인 페이지로 이동합니다.',
        redirectTo: '/login',
      });
    }
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user_id = decoded.user_id;
  
      // 세션에 사용자 정보 저장
      req.session.user = { user_id: decoded.user_id };
  
      next();
    } catch (error) {
      logger.error('Invalid or expired token:', error.message);
      res.clearCookie('auth_token'); // 무효한 토큰 삭제
  
      // 토큰 만료 상태와 기타 오류를 구분
      if (error.name === 'TokenExpiredError') {
        return res.status(401).render('error', {
          title: 'Session Expired',
          message: '세션이 만료되었습니다. 다시 로그인해주세요.',
          redirectTo: '/login',
        });
      }
  
      return res.status(401).render('error', {
        title: 'Invalid Token',
        message: '유효하지 않은 세션입니다. 다시 로그인해주세요.',
        redirectTo: '/login',
      });
    }
  }
  