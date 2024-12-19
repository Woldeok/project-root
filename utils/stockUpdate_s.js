const mysql = require('mysql2/promise');

// 주식 가격 업데이트
async function updateStockPrice(stockSymbol, priceChange) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        // 주식 가격 업데이트 쿼리
        const [result] = await connection.execute(
            'UPDATE stocks SET price = price + ? WHERE stock_symbol = ?',
            [priceChange, stockSymbol]
        );

        if (result.affectedRows === 0) {
            throw new Error(`종목 코드 ${stockSymbol}을(를) 찾을 수 없습니다.`);
        }

        console.log(`주식 가격 업데이트 성공: 종목 - ${stockSymbol}, 변동 - ${priceChange}`);
    } catch (error) {
        console.error(`주식 가격 업데이트 중 오류 발생: ${error.message}`);
        throw error;
    } finally {
        await connection.end();
    }
}

module.exports = { updateStockPrice };
