const express = require('express');
const { exec } = require('child_process');
const mysql = require('mysql2/promise');
const useragent = require('user-agent');
const geoip = require('geoip-lite');
const router = express.Router();

const BLOCK_TIME = 3600 * 1000; // 1시간
const MAX_INVALID_ATTEMPTS = 5; // 최대 허용 비정상 시도 횟수
const INVALID_ATTEMPT_WINDOW = 60000; // 1분 기준 (밀리초)

const invalidAttempts = new Map(); // IP별 비정상 시도 기록

// MySQL 연결 설정
const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// 방화벽 차단
const blockIpOnFirewall = (ip) => {
    const command = `netsh advfirewall firewall add rule name="Block IP ${ip}" dir=in action=block remoteip=${ip}`;
    exec(command, (error) => {
        if (error) {
            console.error(`[Firewall Error] IP: ${ip}, Error: ${error.message}`);
        } else {
            console.log(`[Firewall Blocked] IP: ${ip}`);
        }
    });
};

// 차단 기록 DB 추가
const addBlockedIpToDb = async (ip, unblockTime, reason) => {
    const query = `INSERT INTO blocked_ips (ip_address, blocked_until, reason) VALUES (?, ?, ?)`;
    await db.query(query, [ip, new Date(unblockTime), reason]);
    console.log(`[DB Updated] IP: ${ip} 차단 기록 추가됨.`);
};

// 화이트리스트 확인
const isIpWhitelisted = async (ip) => {
    const query = 'SELECT 1 FROM whitelisted_ips WHERE ip_address = ? LIMIT 1;';
    const [rows] = await db.query(query, [ip]);
    return rows.length > 0;
};

// 접속 정보 로그 출력
const logRequestDetails = (req) => {
    const ip = req.ip;
    const userAgent = useragent.parse(req.headers['user-agent']);
    const geo = geoip.lookup(ip);

    const browser = `${userAgent.family} ${userAgent.major}`;
    const os = `${userAgent.os.family} ${userAgent.os.major}`;
    const location = geo
        ? `${geo.country || '알 수 없음'}, ${geo.city || '알 수 없음'}`
        : '위치 정보 없음';

    console.log(
        '\x1b[36m%s\x1b[0m', // 하늘색 로그
        `[접속 로그] IP: ${ip}, 요청: ${req.method} ${req.path}, 브라우저: ${browser}, 운영체제: ${os}, 위치: ${location}`
    );
};

// 서버에 등록된 경로 확인 함수
const getRegisteredRoutes = (app) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // 라우터 직접 등록
            routes.push({ path: middleware.route.path, methods: Object.keys(middleware.route.methods) });
        } else if (middleware.name === 'router') {
            // 다른 라우터에서 정의된 경로
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push({ path: handler.route.path, methods: Object.keys(handler.route.methods) });
                }
            });
        }
    });
    return routes;
};

// 비정상 경로 감지 및 차단 미들웨어
router.use(async (req, res, next) => {
    const ip = req.ip;
    const currentTime = Date.now();

    logRequestDetails(req); // 요청 정보 로그 출력

    // 화이트리스트 확인
    if (await isIpWhitelisted(ip)) {
        console.log(`[Whitelist] IP: ${ip}은 화이트리스트에 포함되어 있습니다.`);
        return next(); // 요청 허용
    }

    // 현재 앱의 등록된 경로 가져오기
    const app = req.app;
    const registeredRoutes = getRegisteredRoutes(app);

    // 현재 요청 경로와 메서드가 등록된 경로에 있는지 확인
    const isRouteRegistered = registeredRoutes.some(
        (route) => route.path === req.path && route.methods.includes(req.method.toLowerCase())
    );

    if (!isRouteRegistered) {
        if (!invalidAttempts.has(ip)) {
            invalidAttempts.set(ip, []);
        }

        const attempts = invalidAttempts.get(ip);
        attempts.push(currentTime);

        // 1분 이내의 시도만 유지
        invalidAttempts.set(
            ip,
            attempts.filter((timestamp) => currentTime - timestamp <= INVALID_ATTEMPT_WINDOW)
        );

        if (attempts.length >= MAX_INVALID_ATTEMPTS) {
            const unblockTime = currentTime + BLOCK_TIME;
            const reason = '비정상 경로 접근';

            blockIpOnFirewall(ip); // 방화벽에서 차단
            await addBlockedIpToDb(ip, unblockTime, reason); // DB에 차단 기록 추가

            console.log(`[Blocked] IP ${ip}가 비정상 경로에 ${MAX_INVALID_ATTEMPT_WINDOW}번 이상 접근하여 차단됨.`);
            return res.status(403).send('비정상적인 접근으로 인해 차단되었습니다.');
        }

        console.log(`[Invalid Attempt] IP ${ip}, 경로: ${req.path}, 시도 횟수: ${attempts.length}`);
    }

    next(); // 정상 경로라면 다음 미들웨어로 이동
});

module.exports = router;
