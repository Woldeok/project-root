const express = require('express');
const router = express.Router();

// 차단된 IP 목록 저장 (예제)
const blockedIPs = new Map();
const isAdmin = (req, res, next) => {
  const user = req.session?.user;
  if (user?.role === 'admin') {
    return next();
  }
  res.status(403).send('관리자만 접근 가능합니다.');
};
router.get('/admin/unblock-ip', isAdmin, (req, res) => {
    const blockedList = Array.from(blockedIPs.entries()).map(([ip, unblockTime]) => ({
      ip,
      unblockTime: unblockTime > Date.now() ? new Date(unblockTime).toLocaleString() : '만료됨',
    }));
  
    res.render('unblock-ip', { blockedIPs: blockedList });
  });
  
  

// 특정 IP 차단 해제
router.get('/unblock-ip/:ip', isAdmin, (req, res) => {
  const ip = req.params.ip;

  if (!ip) {
    return res.status(400).send('IP를 입력하세요.');
  }

  if (blockedIPs.has(ip)) {
    blockedIPs.delete(ip);
    console.log(`IP ${ip}의 차단이 해제되었습니다.`);
    return res.redirect('/admin/unblock-ip');
  } else {
    return res.status(404).send('차단된 IP가 아닙니다.');
  }
});

module.exports = router;
