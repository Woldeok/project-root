// src/db/connection.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log, // 쿼리 로그를 보고 싶다면 활성화
});

sequelize.authenticate()
    .then(() => console.log('Database connection successful!'))
    .catch((err) => console.error('Database connection error:', err));

module.exports = sequelize;
