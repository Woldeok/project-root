// controllers/db.js
const mysql = require('mysql');

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
  connectionLimit: 10,
  host: '172.17.0.1',
  user: 'practice_user',
  password: 'securePassword123',
  database: 'practice_site_project',
  charset: 'utf8mb4'
});

// Function to get a database connection from the pool
const getConnection = (callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Database connection error:', err);
      callback(err, null);
    } else {
      callback(null, connection);
    }
  });
};

// Attempt to connect to the database when the server starts
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Initial database connection error:', err);
  } else {
    console.log('Successfully connected to the database');
    connection.release();
  }
});

module.exports = { getConnection };
