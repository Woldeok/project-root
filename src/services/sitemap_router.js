const express = require('express');
const router = express.Router();
const postsDb = require('../controllers/postsDb');
const pagesDb = require('../controllers/pagesDb');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const hostname = `${req.protocol}://${req.get('host')}`;
    
    // 게시물 가져오기
    const posts = await postsDb.getPosts();
    
    // 페이지 가져오기
    const pages = await pagesDb.getAllPages();

    // Sitemap 시작
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // 홈페이지 추가
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${hostname}/</loc>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += `  </url>\n`;

    // 게시물 추가
    posts.forEach(post => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${hostname}/board/${post.post_id}</loc>\n`;
      sitemap += `    <lastmod>${new Date(post.created_at).toISOString()}</lastmod>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // 페이지 추가
    pages.forEach(page => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>${hostname}/pages/${page.page_id}</loc>\n`;
      sitemap += `    <lastmod>${new Date(page.updated_at).toISOString()}</lastmod>\n`;
      sitemap += `    <priority>0.7</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Sitemap 종료
    sitemap += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap 생성 실패:', error);
    res.status(500).send('Sitemap을 생성할 수 없습니다.');
  }
});

module.exports = router;
