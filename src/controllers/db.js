// controllers/db.js
require('dotenv').config();
const mysql = require('mysql');

// Create a connection pool to the new MySQL database
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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

// Function to query the posts table
const queryPosts = (callback) => {
  getConnection((err, connection) => {
    if (err) {
      callback(err, null);
    } else {
      connection.query('SELECT * FROM posts', (err, results) => {
        connection.release();
        if (err) {
          console.error('Error fetching posts:', err);
          callback(err, null);
        } else {
          callback(null, results);
        }
      });
    }
  });
};

// General function to execute any query
const query = (sql, params, callback) => {
  getConnection((err, connection) => {
    if (err) {
      callback(err, null);
    } else {
      connection.query(sql, params, (err, results) => {
        connection.release();
        if (err) {
          console.error('Database query error:', err);
          callback(err, null);
        } else {
          callback(null, results);
        }
      });
    }
  });
};

// Attempt to connect to the database when the server starts
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Initial database connection error:', err);
  } else {
    console.log('Successfully connected to the new database');
    connection.release();
  }
});

module.exports = { getConnection, queryPosts, query };
