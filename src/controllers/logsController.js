const fs = require('fs');
const path = require('path');

// 로그 파일 경로 생성
const getLogFilePath = (date) => {
  const folderPath = path.join(__dirname, '../logs');
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
  return path.join(folderPath, `${date}.log`);
};

// 로그 추가
const addLog = (level, message) => {
  const timestamp = new Date().toISOString();
  const hour = timestamp.substring(0, 13).replace('T', '_'); // "YYYY-MM-DD_HH"
  const logFile = getLogFilePath(hour);

  const logEntry = { timestamp, level, message };
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
};

// 로그 검색
const searchLogs = (startTime, endTime, keyword = '', level = '') => {
  const logs = [];
  const startHour = new Date(startTime).getHours();
  const endHour = new Date(endTime).getHours();

  for (let hour = startHour; hour <= endHour; hour++) {
    const hourFile = getLogFilePath(hour);
    if (fs.existsSync(hourFile)) {
      const fileLogs = fs.readFileSync(hourFile, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line));

      logs.push(
        ...fileLogs.filter(log => 
          (!level || log.level === level) &&
          (!keyword || log.message.includes(keyword)) &&
          new Date(log.timestamp) >= new Date(startTime) &&
          new Date(log.timestamp) <= new Date(endTime)
        )
      );
    }
  }
  return logs;
};

module.exports = { addLog, searchLogs };
