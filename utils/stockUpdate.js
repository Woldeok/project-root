const mysql = require('mysql2/promise');
const yahooFinance = require('yahoo-finance2').default;

async function updateRealStockPrices() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('[INFO] 실시간 주식 가격 업데이트 시작...');

        // 데이터베이스에서 모든 주식 종목 조회
        const [stocks] = await connection.execute('SELECT stock_symbol, price FROM stocks');

        if (stocks.length === 0) {
            console.log('[WARNING] 주식 데이터가 없습니다. 업데이트 작업을 건너뜁니다.');
            return;
        }

        for (const stock of stocks) {
            const stockSymbol = stock.stock_symbol;
            let currentPrice = stock.price; // 기존 가격 가져오기

            try {
                // Yahoo Finance에서 실시간 주식 가격 가져오기 (옵션)
                const quote = await yahooFinance.quote(stockSymbol);
                const marketPrice = quote?.regularMarketPrice
                    ? Math.round(quote.regularMarketPrice)
                    : currentPrice;

                // 랜덤 가격 변동 추가
                const priceChange = Math.floor(Math.random() * 2000001) - 1000000; // -1,000,000 ~ +1,000,000
                const newPrice = Math.max(10000, marketPrice + priceChange); // 최소 가격 10,000원 보장

                console.log(`[INFO] ${stockSymbol}: 현재 가격=${currentPrice}, 변동=${priceChange}, 새로운 가격=${newPrice}`);

                // 주식 가격 업데이트
                await connection.execute(
                    'UPDATE stocks SET price = ? WHERE stock_symbol = ?',
                    [newPrice, stockSymbol]
                );
            } catch (apiError) {
                console.error(`[ERROR] ${stockSymbol} 업데이트 중 API 오류 발생: ${apiError.message}`);
            }
        }

        console.log('[INFO] 실시간 주식 가격 업데이트 완료.');
    } catch (error) {
        console.error(`[ERROR] 실시간 주식 가격 업데이트 중 오류 발생: ${error.message}`);
    } finally {
        await connection.end();
    }
}

// 주식 가격 자동 업데이트 시작 (1분 간격)
function startRealStockUpdate(interval = 9) {
    console.log('[INFO] 실시간 주식 가격 업데이트 스케줄러 시작...');
    setInterval(async () => {
        console.log(`[INFO] [${new Date().toLocaleTimeString()}] 실시간 주식 가격 업데이트 실행`);
        await updateRealStockPrices();
    }, interval * 60 * 35); // interval (분) 단위로 실행
}

module.exports = { startRealStockUpdate };
