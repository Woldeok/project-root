const express = require('express');
const router = express.Router();
const { addLog, searchLogs } = require('../controllers/logsController');

// GET /logs - 로그 검색
router.get('/', (req, res) => {
  const { startTime, endTime, keyword, level } = req.query;

  try {
    const logs = searchLogs(startTime, endTime, keyword, level);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).send('Error fetching logs');
  }
});

// POST /logs - 새 로그 추가
router.post('/', (req, res) => {
  const { level, message } = req.body;

  try {
    addLog(level, message);
    res.status(201).send('Log added');
  } catch (error) {
    console.error('Error adding log:', error);
    res.status(500).send('Error adding log');
  }
});

module.exports = router;
