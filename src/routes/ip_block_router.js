const express = require('express');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const { exec } = require('child_process');
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
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'MySQL Database connected successfully!'))
    .catch((err) => console.error('\x1b[31m%s\x1b[0m', 'MySQL connection error:', err));

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'jungchwimisaenghwal63@gmail.com',
        pass: 'dntt yvws cwls lqrt',
    },
});

// 이메일 전송 함수
const sendEmail = async (subject, message) => {
    const mailOptions = {
        from: 'jungchwimisaenghwal63@gmail.com',
        to: 'jungchwimisaenghwal63@gmail.com',
        subject,
        text: message,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('\x1b[32m%s\x1b[0m', `Email sent: ${subject}`);
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Email sending error:', error);
    }
};

// 클라이언트 IP 가져오기
const getClientIp = (req) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    if (ip && ip.includes(',')) ip = ip.split(',')[0];
    if (ip && ip.startsWith('::ffff:')) ip = ip.substring(7);
    return ip.trim();
};

// 방화벽 차단 함수
const blockIpOnFirewall = (ip) => {
    const command = `netsh advfirewall firewall add rule name="Block IP ${ip}" dir=in interface=any action=block remoteip=${ip}`;
    exec(command, (err) => {
        if (err) {
            console.error('\x1b[31m%s\x1b[0m', `Failed to block IP on firewall: ${err.message}`);
            return;
        }
        console.log('\x1b[32m%s\x1b[0m', `Blocked IP on firewall: ${ip}`);
    });
};

// 방화벽 차단 해제 함수
const unblockIpOnFirewall = (ip) => {
    const command = `netsh advfirewall firewall delete rule name="Block IP ${ip}"`;
    exec(command, (err) => {
        if (err) {
            console.error('\x1b[31m%s\x1b[0m', `Failed to unblock IP on firewall: ${err.message}`);
            return;
        }
        console.log('\x1b[32m%s\x1b[0m', `Unblocked IP on firewall: ${ip}`);
    });
};
// 차단 기록 추가 함수
const addBlockedIpToHistory = async (ip, unblockTime, reason = '과도한 요청') => {
    const query = `
        INSERT INTO blocked_ip_history (ip_address, blocked_until, reason)
        VALUES (?, ?, ?);
    `;
    const values = [ip, new Date(unblockTime), reason];
    await db.query(query, values);
    console.log('\x1b[32m%s\x1b[0m', `Added blocked IP to history: ${ip}`);
};

// 차단 해제 기록 업데이트 함수
const updateUnblockedIpInHistory = async (ip) => {
    const query = `
        UPDATE blocked_ip_history
        SET unblocked_at = CURRENT_TIMESTAMP
        WHERE ip_address = ? AND unblocked_at IS NULL;
    `;
    await db.query(query, [ip]);
    console.log('\x1b[32m%s\x1b[0m', `Updated unblock time for IP: ${ip}`);
};

// 차단 목록 DB 업데이트 함수
const blockIpInDb = async (ip, unblockTime, reason = '과도한 요청') => {
    const query = `
        INSERT INTO blocked_ips (ip_address, blocked_until, reason)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE blocked_until = ?, reason = ?, created_at = CURRENT_TIMESTAMP;
    `;
    const values = [ip, new Date(unblockTime), reason, new Date(unblockTime), reason];
    await db.query(query, values);
    console.log('\x1b[32m%s\x1b[0m', `IP blocked in DB: ${ip}`);
};

// 차단 해제 DB 업데이트 함수
const unblockIpInDb = async (ip) => {
    const query = `DELETE FROM blocked_ips WHERE ip_address = ?;`;
    await db.query(query, [ip]);
    console.log('\x1b[32m%s\x1b[0m', `IP unblocked in DB: ${ip}`);
};

// 화이트리스트 확인 함수
const isIpWhitelisted = async (ip) => {
    const query = `SELECT 1 FROM whitelisted_ips WHERE ip_address = ? LIMIT 1;`;
    const [rows] = await db.query(query, [ip]);
    return rows.length > 0;
};

// 요청 필터링 및 DDoS 방어 미들웨어
router.use(async (req, res, next) => {
    const ip = getClientIp(req);
    const currentTime = Date.now();

    console.log('\x1b[35m%s\x1b[0m', `[Access Log] IP: ${ip}, Path: ${req.originalUrl}, Method: ${req.method}, Time: ${new Date(currentTime).toLocaleString()}`);

    // 화이트리스트 확인
    if (await isIpWhitelisted(ip)) {
        console.log('\x1b[32m%s\x1b[0m', `IP ${ip} is whitelisted.`);
        return next();
    }

    // DB에서 차단 상태 확인
    try {
        const query = `SELECT blocked_until FROM blocked_ips WHERE ip_address = ? AND blocked_until > CURRENT_TIMESTAMP;`;
        const [rows] = await db.query(query, [ip]);

        if (rows.length > 0) {
            const unblockTime = rows[0].blocked_until;
            console.log('\x1b[31m%s\x1b[0m', `Blocked IP: ${ip}, Unblock time: ${new Date(unblockTime).toLocaleString()}`);
            blockIpOnFirewall(ip);
            return res.status(403).send('Access denied. Your IP is temporarily blocked.');
        }
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error checking blocked IP in DB: ${error.message}`);
        return res.status(500).send('Internal server error.');
    }

    // 요청 기록 관리
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }
    const timestamps = requestCounts.get(ip);
    timestamps.push(currentTime);

    requestCounts.set(ip, timestamps.filter((timestamp) => currentTime - timestamp <= REQUEST_WINDOW));

    console.log('\x1b[36m%s\x1b[0m', `[Request Log] IP: ${ip}, Requests in the past minute: ${timestamps.length}`);

    // 요청 초과 차단
    if (timestamps.length > MAX_REQUESTS_PER_MINUTE) {
        const unblockTime = currentTime + BLOCK_TIME;
        await blockIpInDb(ip, unblockTime);
        await addBlockedIpToHistory(ip, unblockTime);
        blockIpOnFirewall(ip);
        sendEmail('DDoS Alert', `IP ${ip} has been blocked due to excessive requests.`);
        console.log('\x1b[31m%s\x1b[0m', `IP ${ip} has been blocked due to exceeding request limits.`);
        return res.status(403).send('Your IP has been blocked due to excessive requests.');
    }

    next();
});
// IP 차단 API (관리자 인증 필요)
router.post('/block-ip', async (req, res) => {
    const { ip, reason } = req.body;

    if (!ip || !reason) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: IP and reason are required to block an IP.');
        return res.status(400).send('IP and reason are required.');
    }

    try {
        const unblockTime = Date.now() + BLOCK_TIME;
        await blockIpInDb(ip, unblockTime, reason);
        await addBlockedIpToHistory(ip, unblockTime, reason);
        blockIpOnFirewall(ip);

        sendEmail('IP Blocked', `IP ${ip} has been blocked for the following reason: ${reason}`);
        console.log('\x1b[31m%s\x1b[0m', `IP ${ip} blocked successfully.`);
        res.status(200).send(`IP ${ip} has been successfully blocked.`);
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error blocking IP ${ip}: ${error.message}`);
        res.status(500).send('Error occurred while blocking the IP.');
    }
});

// IP 차단 해제 API
router.post('/unblock-ip', async (req, res) => {
    const { ip } = req.body;

    if (!ip) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: IP is required to unblock.');
        return res.status(400).send('IP is required.');
    }

    try {
        await unblockIpInDb(ip);
        await updateUnblockedIpInHistory(ip);
        unblockIpOnFirewall(ip);

        sendEmail('IP Unblocked', `IP ${ip} has been unblocked.`);
        console.log('\x1b[32m%s\x1b[0m', `IP ${ip} unblocked successfully.`);
        res.status(200).send(`IP ${ip} has been successfully unblocked.`);
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error unblocking IP ${ip}: ${error.message}`);
        res.status(500).send('Error occurred while unblocking the IP.');
    }
});

// 화이트리스트에 IP 추가
router.post('/whitelist-ip', async (req, res) => {
    const { ip } = req.body;

    if (!ip) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: IP is required to whitelist.');
        return res.status(400).send('IP is required.');
    }

    try {
        const query = `
            INSERT INTO whitelisted_ips (ip_address) VALUES (?) 
            ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;
        `;
        await db.query(query, [ip]);

        sendEmail('IP Whitelisted', `IP ${ip} has been added to the whitelist.`);
        console.log('\x1b[32m%s\x1b[0m', `IP ${ip} added to whitelist.`);
        res.status(200).send(`IP ${ip} has been added to the whitelist.`);
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error adding IP ${ip} to whitelist: ${error.message}`);
        res.status(500).send('Error occurred while adding IP to the whitelist.');
    }
});

// 화이트리스트에서 IP 제거
router.post('/remove-whitelist-ip', async (req, res) => {
    const { ip } = req.body;

    if (!ip) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: IP is required to remove from whitelist.');
        return res.status(400).send('IP is required.');
    }

    try {
        const query = `DELETE FROM whitelisted_ips WHERE ip_address = ?;`;
        await db.query(query, [ip]);

        sendEmail('IP Removed from Whitelist', `IP ${ip} has been removed from the whitelist.`);
        console.log('\x1b[32m%s\x1b[0m', `IP ${ip} removed from whitelist.`);
        res.status(200).send(`IP ${ip} has been removed from the whitelist.`);
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error removing IP ${ip} from whitelist: ${error.message}`);
        res.status(500).send('Error occurred while removing IP from the whitelist.');
    }
});
// 차단된 IP 목록 조회
router.get('/list-blocked-ips', async (req, res) => {
    try {
        const query = `SELECT * FROM blocked_ips ORDER BY created_at DESC;`;
        const [result] = await db.query(query);

        console.log('\x1b[32m%s\x1b[0m', `Blocked IP list retrieved successfully.`);
        res.status(200).json({ blockedIps: result });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error fetching blocked IP list: ${error.message}`);
        res.status(500).send('Error occurred while fetching the blocked IP list.');
    }
});

// 차단 기록 조회
router.get('/history', async (req, res) => {
    try {
        const query = `SELECT * FROM blocked_ip_history ORDER BY created_at DESC;`;
        const [result] = await db.query(query);

        console.log('\x1b[32m%s\x1b[0m', `Blocked IP history retrieved successfully.`);
        res.status(200).json({ history: result });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error fetching blocked IP history: ${error.message}`);
        res.status(500).send('Error occurred while fetching the blocked IP history.');
    }
});

// 화이트리스트 조회
router.get('/list-whitelisted-ips', async (req, res) => {
    try {
        const query = `SELECT * FROM whitelisted_ips ORDER BY created_at DESC;`;
        const [result] = await db.query(query);

        console.log('\x1b[32m%s\x1b[0m', `Whitelisted IPs retrieved successfully.`);
        res.status(200).json({ whitelistedIps: result });
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', `Error fetching whitelisted IPs: ${error.message}`);
        res.status(500).send('Error occurred while fetching the whitelist.');
    }
});

// 메인 라우터 설정 완료
module.exports = router;

// 모든 요청 로깅 미들웨어
router.use((req, res, next) => {
    const logMessage = `Request Type: ${req.method}, Path: ${req.originalUrl}, IP: ${getClientIp(req)}, Time: ${new Date().toLocaleString()}`;
    console.log('\x1b[35m%s\x1b[0m', logMessage); // 핑크색 로그
    next();
});
