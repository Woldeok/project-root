const express = require('express');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const { exec } = require('child_process'); // 방화벽 명령어 실행용
const jwt = require('jsonwebtoken');
const router = express.Router();

const BLOCK_TIME = 3600 * 1000; // 1시간 (밀리초)
const MAX_REQUESTS_PER_MINUTE = 100; // 1분당 최대 요청 허용 수
const REQUEST_WINDOW = 60000; // 1분 (밀리초)
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key'; // 비밀 키
const requestCounts = new Map(); // IP별 요청 기록

// MySQL 연결 설정
const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
});

db.getConnection()
  .then(() => console.log('\x1b[36m%s\x1b[0m', 'MySQL Database connected successfully!')) // 하늘색 로그
  .catch((err) => console.error('\x1b[31m%s\x1b[0m', 'MySQL connection error:', err)); // 빨간색 로그

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'jungchwimisaenghwal63@gmail.com',
        pass: 'dntt yvws cwls lqrt',
    },
});

const sendEmail = async (ip, unblockTime) => {
    const mailOptions = {
        from: 'jungchwimisaenghwal63@gmail.com',
        to: 'jungchwimisaenghwal63@gmail.com',
        subject: `IP 차단 알림: ${ip}`,
        text: `IP ${ip}가 비정상적인 트래픽으로 차단되었습니다.\n\n- 차단 해제 예정 시간: ${new Date(unblockTime).toLocaleString('ko-KR')}`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('\x1b[36m%s\x1b[0m', `관리자에게 차단 이메일 전송 완료: ${ip}`); // 하늘색 로그
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '이메일 전송 중 오류 발생:', error); // 빨간색 로그
    }
};

const getClientIp = (req) => {
    let ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.ip;
    if (ip && ip.includes(',')) ip = ip.split(',')[0];
    if (ip && ip.startsWith('::ffff:')) ip = ip.substring(7);
    return ip.trim();
};
const blockIpOnFirewall = (ip) => {
    const command = `netsh advfirewall firewall add rule name="Block IP ${ip}" dir=in interface=any action=block remoteip=${ip}`;
    exec(command, (err) => {
        if (err) {
            console.error('\x1b[31m%s\x1b[0m', `방화벽 차단 오류: ${err.message}`); // 빨간색 로그
            return;
        }
        console.log('\x1b[36m%s\x1b[0m', `방화벽에서 IP 차단 완료: ${ip}`); // 하늘색 로그
    });
};

const unblockIpOnFirewall = (ip) => {
    const command = `netsh advfirewall firewall delete rule name="Block IP ${ip}"`;
    exec(command, (err) => {
        if (err) {
            console.error('\x1b[31m%s\x1b[0m', `방화벽 해제 오류: ${err.message}`); // 빨간색 로그
            return;
        }
        console.log('\x1b[36m%s\x1b[0m', `방화벽에서 IP 해제 완료: ${ip}`); // 하늘색 로그
    });
};

// 화이트리스트 확인
const isIpWhitelisted = async (ip) => {
    const query = `SELECT 1 FROM whitelisted_ips WHERE ip_address = ? LIMIT 1;`;
    const [rows] = await db.query(query, [ip]);
    return rows.length > 0;
};

// 차단 기록 추가
const addBlockedIpToHistory = async (ip, unblockTime, reason = '과도한 요청') => {
    const query = `
        INSERT INTO blocked_ip_history (ip_address, blocked_until, reason)
        VALUES (?, ?, ?);
    `;
    const values = [ip, new Date(unblockTime), reason];
    await db.query(query, values);
    console.log('\x1b[36m%s\x1b[0m', `IP ${ip}가 차단 기록 테이블에 추가되었습니다.`); // 하늘색 로그
};

// 차단 해제 기록 업데이트
const updateUnblockedIpInHistory = async (ip) => {
    const query = `
        UPDATE blocked_ip_history
        SET unblocked_at = CURRENT_TIMESTAMP
        WHERE ip_address = ? AND unblocked_at IS NULL;
    `;
    await db.query(query, [ip]);
    console.log('\x1b[36m%s\x1b[0m', `IP ${ip}의 차단 해제 시간이 기록되었습니다.`); // 하늘색 로그
};
// 차단 목록 DB 업데이트
const blockIpInDb = async (ip, unblockTime, reason = '과도한 요청') => {
    const query = `
        INSERT INTO blocked_ips (ip_address, blocked_until, reason)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE blocked_until = ?, reason = ?, created_at = CURRENT_TIMESTAMP;
    `;
    const values = [ip, new Date(unblockTime), reason, new Date(unblockTime), reason];
    await db.query(query, values);
    console.log('\x1b[36m%s\x1b[0m', `IP ${ip}가 차단 DB에 기록되었습니다.`); // 하늘색 로그
};

// IP 차단 해제 DB 업데이트
const unblockIpInDb = async (ip) => {
    const query = `DELETE FROM blocked_ips WHERE ip_address = ?;`;
    await db.query(query, [ip]);
    console.log('\x1b[36m%s\x1b[0m', `IP ${ip}의 차단이 DB에서 해제되었습니다.`); // 하늘색 로그
};

// IP 요청 필터링 미들웨어
router.use(async (req, res, next) => {
    const ip = getClientIp(req);
    const currentTime = Date.now();

    console.log('\x1b[35m%s\x1b[0m', `[접속 로그] IP: ${ip}, 요청 경로: ${req.originalUrl}, 요청 메서드: ${req.method}, 현재 시간: ${new Date(currentTime).toLocaleString('ko-KR')}`); // 핑크색 로그

    // 화이트리스트 체크
    if (await isIpWhitelisted(ip)) {
        console.log('\x1b[36m%s\x1b[0m', `IP ${ip}는 화이트리스트에 포함되어 차단되지 않습니다.`); // 하늘색 로그
        return next(); // 요청을 허용
    }

    try {
        // DB에서 차단 상태 확인
        const dbCheckQuery = `SELECT blocked_until FROM blocked_ips WHERE ip_address = ? AND blocked_until > CURRENT_TIMESTAMP;`;
        const [dbResult] = await db.query(dbCheckQuery, [ip]);

        if (dbResult.length > 0) {
            const unblockTime = dbResult[0].blocked_until;
            console.log('\x1b[31m%s\x1b[0m', `IP ${ip}는 현재 차단된 상태입니다. 차단 해제 시간: ${new Date(unblockTime).toLocaleString('ko-KR')}`); // 빨간색 로그

            // 방화벽에서도 차단 적용
            blockIpOnFirewall(ip);
            res.status(403).end(); // 응답 종료
            return; // 다음 요청을 처리하지 않음
        }
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `DB 쿼리 오류: ${error.message}`); // 빨간색 로그
        res.status(500).send('서버 오류로 인해 요청을 처리할 수 없습니다.');
        return; // 다음 요청을 처리하지 않음
    }

    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }

    const timestamps = requestCounts.get(ip);
    timestamps.push(currentTime);
    requestCounts.set(ip, timestamps.filter((timestamp) => currentTime - timestamp <= REQUEST_WINDOW));

    console.log('\x1b[35m%s\x1b[0m', `[요청 기록] IP: ${ip}, 요청 횟수: ${timestamps.length}`); // 핑크색 로그

    if (timestamps.length > MAX_REQUESTS_PER_MINUTE) {
        const unblockTime = currentTime + BLOCK_TIME;
        await blockIpInDb(ip, unblockTime);
        await addBlockedIpToHistory(ip, unblockTime);
        blockIpOnFirewall(ip); // 방화벽에서도 차단 적용
        sendEmail(ip, unblockTime);
        console.log('\x1b[31m%s\x1b[0m', `IP ${ip}가 1분당 요청 제한(${MAX_REQUESTS_PER_MINUTE})을 초과하여 차단되었습니다.`); // 빨간색 로그
        res.status(403).end(); // 응답 종료
        return; // 다음 요청을 처리하지 않음
    }

    next(); // 차단되지 않은 경우에만 다음 요청 처리
});
// 차단 목록 확인 (GET 요청, 관리자 인증 없이 접근 가능)
router.get('/list-blocked-ips', async (req, res) => {
    try {
        const query = `SELECT * FROM blocked_ips ORDER BY created_at DESC;`;
        const [result] = await db.query(query);
        res.render('list-blocked-ips', { blockedIps: result });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `차단 목록 조회 중 오류: ${error.message}`); // 빨간색 로그
        res.status(500).json({ error: '차단 목록 조회 중 오류 발생.' });
    }
});

// 차단 기록 조회 (GET 요청, 관리자 인증 없이 접근 가능)
router.get('/history', async (req, res) => {
    try {
        const query = `SELECT * FROM blocked_ip_history ORDER BY created_at DESC;`;
        const [result] = await db.query(query);
        res.render('history', { history: result });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `차단 기록 조회 중 오류: ${error.message}`); // 빨간색 로그
        res.status(500).json({ error: '차단 기록 조회 중 오류 발생.' });
    }
});

// IP 직접 차단 화면 렌더링 (GET 요청, 관리자 인증 없이 접근 가능)
router.get('/block-ip', async (req, res) => {
    try {
        res.render('block-ip', { message: null });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `IP 차단 화면 렌더링 중 오류: ${error.message}`); // 빨간색 로그
        res.status(500).send('서버 오류로 인해 화면을 렌더링할 수 없습니다.');
    }
});

// IP 직접 차단 처리 (POST 요청, 관리자 인증 없이 접근 가능)
router.post('/block-ip', async (req, res) => {
    const { ip, reason } = req.body;

    if (!ip || !reason) {
        return res.render('block-ip', { message: 'IP와 차단 사유를 모두 입력해주세요.' });
    }

    try {
        const unblockTime = Date.now() + BLOCK_TIME;
        await blockIpInDb(ip, unblockTime, reason);
        await addBlockedIpToHistory(ip, unblockTime, reason);
        blockIpOnFirewall(ip); // 방화벽에서도 차단
        console.log('\x1b[36m%s\x1b[0m', `IP ${ip}가 직접 차단되었습니다. 사유: ${reason}`); // 하늘색 로그
        res.render('block-ip', { message: `IP ${ip}가 성공적으로 차단되었습니다.` });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `IP 직접 차단 중 오류: ${error.message}`); // 빨간색 로그
        res.render('block-ip', { message: 'IP 차단 중 오류가 발생했습니다.' });
    }
});

// 화이트리스트에 IP 추가 (POST 요청, 관리자 인증 없이 접근 가능)
router.post('/whitelist-ip', async (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP를 입력하세요.' });

    try {
        const query = `
            INSERT INTO whitelisted_ips (ip_address) VALUES (?) 
            ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;
        `;
        await db.query(query, [ip]);
        console.log('\x1b[36m%s\x1b[0m', `IP ${ip}가 화이트리스트에 추가되었습니다.`); // 하늘색 로그
        res.json({ message: `IP ${ip}가 화이트리스트에 추가되었습니다.` });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `화이트리스트 추가 중 오류: ${error.message}`); // 빨간색 로그
        res.status(500).json({ error: '화이트리스트 추가 중 오류 발생.' });
    }
});

// 화이트리스트 목록 조회 (GET 요청, 관리자 인증 없이 접근 가능)
router.get('/list-whitelisted-ips', async (req, res) => {
    try {
        const query = `SELECT * FROM whitelisted_ips ORDER BY created_at DESC;`;
        const [result] = await db.query(query);
        res.render('list-whitelisted-ips', { whitelistedIps: result });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `화이트리스트 조회 중 오류: ${error.message}`); // 빨간색 로그
        res.status(500).json({ error: '화이트리스트 조회 중 오류 발생.' });
    }
});

// IP 차단 해제 API (POST 요청, 관리자 인증 없이 접근 가능)
router.post('/unblock-ip', async (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'IP를 입력하세요.' });

    try {
        await unblockIpInDb(ip);
        await updateUnblockedIpInHistory(ip);
        unblockIpOnFirewall(ip); // 방화벽에서 해제
        console.log('\x1b[36m%s\x1b[0m', `IP ${ip}가 성공적으로 차단 해제되었습니다.`); // 하늘색 로그
        res.redirect('/list-blocked-ips');
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `IP 차단 해제 중 오류: ${error.message}`); // 빨간색 로그
        res.status(500).json({ error: 'IP 차단 해제 중 오류 발생.' });
    }
});

module.exports = router;
