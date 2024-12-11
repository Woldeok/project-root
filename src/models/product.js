// src/models/product.js
const sequelize = require('../controllers/connection'); // 연결된 sequelize 객체 가져오기
const { DataTypes } = require('sequelize');    // Sequelize의 DataTypes 가져오기

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'products', // 테이블 이름
    timestamps: true,     // createdAt, updatedAt 사용
});

module.exports = Product;
