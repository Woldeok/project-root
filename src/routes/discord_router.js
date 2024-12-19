const express = require('express');
const router = express.Router();
const discordBot = require('../../discord_bot'); // 디스코드 봇 모듈
const jwt = require('jsonwebtoken');

// 환경 변수
const SECRET_KEY = process.env.SECRET_KEY;

// 디스코드 명령 처리 엔드포인트
router.post('/command', async (req, res) => {
  try {
    const { command, args } = req.body;

    // 디스코드 봇에서 명령 처리
    const result = await discordBot.handleCommand(command, args);

    res.status(200).json({ success: true, message: result });
  } catch (error) {
    console.error('Error processing Discord command:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// 디스코드와 웹 서버 간 상태 확인
router.get('/status', (req, res) => {
  const status = discordBot.isReady() ? 'Connected' : 'Disconnected';
  res.status(200).json({ discordStatus: status });
});

module.exports = router;
