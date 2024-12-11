const express = require('express');
const router = express.Router();
const postsDb = require('../controllers/postsDb');
const pagesDb = require('../controllers/pagesDb');
const { convertToRSS } = require('../utils/rssGenerator');

// RSS 라우터
router.get('/rss', async (req, res) => {
  try {
    const posts = await postsDb.getRecentPosts();
    const pages = await pagesDb.getAllPages();

    const items = [
      ...posts.map(post => ({
        title: post.title,
        description: post.content,
        link: `${req.protocol}://${req.get('host')}/board/${post.post_id}`,
        pubDate: new Date(post.created_at).toUTCString(),
      })),
      ...pages.map(page => ({
        title: page.title,
        description: page.content,
        link: `${req.protocol}://${req.get('host')}/page/${page.page_id}`,
        pubDate: new Date(page.updated_at).toUTCString(),
      }))
    ];

    const rssFeed = convertToRSS(items, {
      title: 'My Website RSS Feed',
      description: '최신 게시물 및 페이지 RSS 피드',
      link: `${req.protocol}://${req.get('host')}/rss`
    });

    res.set('Content-Type', 'application/rss+xml');
    res.send(rssFeed);
  } catch (error) {
    console.error('RSS 피드 생성 실패:', error);
    res.status(500).send('RSS 피드를 생성할 수 없습니다.');
  }
});

module.exports = router;
