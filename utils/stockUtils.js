const mysql = require('mysql2/promise');

// 주식 가격 조회
async function getStockPrice(stockSymbol) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute('SELECT price FROM stocks WHERE stock_symbol = ?', [stockSymbol]);
    await connection.end();

    if (rows.length === 0) {
        throw new Error(`종목 코드 ${stockSymbol}에 대한 주식 가격을 찾을 수 없습니다.`);
    }
    return rows[0].price;
}

// 주식 가격 업데이트
async function updateStockPrice(stockSymbol, priceChange) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    await connection.execute('UPDATE stocks SET price = price + ? WHERE stock_symbol = ?', [priceChange, stockSymbol]);
    await connection.end();
}

module.exports = { getStockPrice, updateStockPrice };
