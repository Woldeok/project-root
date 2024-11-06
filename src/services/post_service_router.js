// Post and comment router implementation for Node.js and Express with real functionality

const express = require('express');
const winston = require('winston');
const geoip = require('geoip-lite');
const router = express.Router();
const db = require('../controllers/db'); // Assuming db is a module that handles database interactions

// Logger configuration
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat) })
  ],
});

// Centralized request logging middleware
router.use((req, res, next) => {
  const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
  const geo = geoip.lookup(ip) || {};
  const user = req.session && req.session.user ? req.session.user.user_id : 'Guest';
  const role = req.session && req.session.user && req.session.user.isAdmin ? 'Admin' : 'User';

  logger.info(`Accessed route: ${req.originalUrl}, Method: ${req.method}, IP: ${ip}, Country: ${geo.country || 'Unknown'}, Region: ${geo.region || 'Unknown'}, User: ${user}, Role: ${role}`);

  next();
});

// Middleware to check if the user is logged in
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).render('unauthorized', { title: 'Unauthorized', message: 'You need to be logged in to perform this action.' });
  }
}

// Post list route
router.get('/posts', async (req, res) => {
  try {
    const posts = await db.query('SELECT * FROM posts');
    res.render('posts', { title: 'Posts List', posts });
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).render('error', { title: 'Error', message: 'Error fetching posts' });
  }
});

// Post creation form route (only for logged-in users)
router.get('/posts/new', isLoggedIn, (req, res) => {
  res.render('newPost', { title: 'Create New Post' });
});

// Post creation submission route (only for logged-in users)
router.post('/posts', isLoggedIn, async (req, res) => {
  try {
    const { user_id, content, media_path } = req.body;
    const result = await db.query('INSERT INTO posts (user_id, content, media_path) VALUES (?, ?, ?)', [user_id, content, media_path]);
    logger.info(`New post created by user ${user_id}`);
    res.redirect(`/posts/${result.insertId}`);
  } catch (error) {
    logger.error('Error creating post:', error);
    res.status(500).render('error', { title: 'Error', message: 'Error creating post' });
  }
});

// Post detail route
router.get('/posts/:post_id', async (req, res) => {
  const { post_id } = req.params;
  try {
    const post = await db.query('SELECT * FROM posts WHERE post_id = ?', [post_id]);
    if (post.length === 0) {
      return res.status(404).render('notFound', { title: 'Not Found', message: 'Post not found' });
    }
    const comments = await db.query('SELECT * FROM comments WHERE post_id = ?', [post_id]);
    res.render('postDetail', { title: 'Post Detail', post: post[0], comments });
  } catch (error) {
    logger.error('Error fetching post details:', error);
    res.status(500).render('error', { title: 'Error', message: 'Error fetching post details' });
  }
});

// Comment submission route (only for logged-in users)
router.post('/posts/:post_id/comments', isLoggedIn, async (req, res) => {
  const { post_id } = req.params;
  const { user_id, content } = req.body;
  try {
    const result = await db.query('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [post_id, user_id, content]);
    logger.info(`New comment created on post ${post_id} by user ${user_id}`);
    res.redirect(`/posts/${post_id}`);
  } catch (error) {
    logger.error('Error adding comment:', error);
    res.status(500).render('error', { title: 'Error', message: 'Error adding comment' });
  }
});

module.exports = router;
