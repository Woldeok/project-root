const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// 관리자 인증 미들웨어
function verifyAdmin(req, res, next) {
  try {
    // 세션 확인
    const user = req.session.user || {};
    if (user.role === 'admin') {
      console.log(`Session-based admin access: ${user.user_id}`);
      return next();
    }

    // JWT 토큰 확인
    const token = req.cookies.auth_token;
    if (!token) {
      console.warn('No token found in cookies.');
      return res.status(403).render('accessDenied', {
        title: '접근 거부',
        message: '관리자 권한이 필요합니다.',
      });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role === 'admin') {
      console.log(`JWT-based admin access: ${decoded.user_id}`);
      req.user = decoded;
      return next();
    }

    console.warn('User does not have admin privileges.');
    return res.status(403).render('accessDenied', {
      title: '접근 거부',
      message: '관리자 권한이 필요합니다.',
    });
  } catch (err) {
    console.error('Authentication error:', err.message);
    return res.status(403).render('accessDenied', {
      title: '접근 거부',
      message: '유효하지 않은 토큰입니다.',
    });
  }
}

module.exports = verifyAdmin;
