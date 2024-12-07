const fs = require('fs');
const path = require('path');

// 로그 파일 경로 생성
const getLogFilePath = (date) => {
  const folderPath = path.join(__dirname, '../logs'); // 로그 디렉토리
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true }); // 디렉토리 없으면 생성
  return path.join(folderPath, `${date}.log`); // 로그 파일 이름: YYYY-MM-DD.log
};

// 로그 추가
const addLog = (level, message) => {
  const timestamp = new Date().toISOString(); // ISO 형식의 타임스탬프
  const date = timestamp.substring(0, 10); // YYYY-MM-DD
  const logFilePath = getLogFilePath(date);

  const logEntry = {
    timestamp,
    level,
    message,
  };

  // 로그를 파일에 추가
  fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n', 'utf8');
};

// 로그 검색
const searchLogs = ({ startTime, endTime, keyword = '', level = '' }) => {
  const logs = [];
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().substring(0, 10); // YYYY-MM-DD
    const logFilePath = getLogFilePath(dateStr);

    if (fs.existsSync(logFilePath)) {
      const fileLogs = fs.readFileSync(logFilePath, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line)); // JSON 파싱

      logs.push(
        ...fileLogs.filter(
          (log) =>
            (!level || log.level === level) &&
            (!keyword || log.message.includes(keyword)) &&
            new Date(log.timestamp) >= startDate &&
            new Date(log.timestamp) <= endDate
        )
      );
    }

    // 다음 날짜로 이동
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return logs;
};

module.exports = {
  addLog,
  searchLogs,
};
