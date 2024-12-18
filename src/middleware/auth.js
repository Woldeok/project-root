const jwt = require('jsonwebtoken');

// JWT 토큰 검증 미들웨어
exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer token'
    if (!token) {
        return res.status(403).json({ message: '토큰이 제공되지 않았습니다.' });
    }

    try {
        // JWT 검증
        const decoded = jwt.verify(token, 'secret-key'); // secret-key는 환경 변수에서 관리할 것
        req.user = decoded; // 검증된 사용자 정보
        next();
    } catch (error) {
        return res.status(401).json({ message: '유효하지 않은 토큰입니다.', error });
    }
};
