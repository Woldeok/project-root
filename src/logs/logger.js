const winston = require('winston');
const path = require('path');

// 로그 포맷 정의
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// winston 설정
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, 'app.log'), // 로그 파일 저장
    }),
    new winston.transports.Console(), // 콘솔 출력
  ],
});

module.exports = logger;
