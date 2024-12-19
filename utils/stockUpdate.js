const mysql = require('mysql2/promise');
const yahooFinance = require('yahoo-finance2').default;

// 주식 가격 업데이트 (실제 데이터 사용)
async function updateRealStockPrices() {
    const MIN_PRICE = 10000; // 최저 가격 1만 원
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('실시간 주식 가격 업데이트 시작...');

        // 데이터베이스에서 모든 주식 종목 조회
        const [stocks] = await connection.execute('SELECT stock_symbol FROM stocks');

        if (stocks.length === 0) {
            console.log('주식 데이터가 없습니다. 업데이트 작업을 건너뜁니다.');
            await connection.end();
            return;
        }

        for (const stock of stocks) {
            const stockSymbol = stock.stock_symbol;

            try {
                // Yahoo Finance에서 실시간 주식 가격 가져오기
                const quote = await yahooFinance.quote(stockSymbol);
                let currentPrice = Math.round(quote.regularMarketPrice); // 현재 시장 가격 (반올림)

                // 최저 가격 적용
                if (currentPrice < MIN_PRICE) {
                    currentPrice = MIN_PRICE;
                }

                // 주식 가격 업데이트
                await connection.execute('UPDATE stocks SET price = ? WHERE stock_symbol = ?', [
                    currentPrice,
                    stockSymbol,
                ]);

                console.log(`종목: ${stockSymbol}, 업데이트된 가격: ${currentPrice}원`);
            } catch (apiError) {
                console.error(`종목 ${stockSymbol} 업데이트 중 API 오류 발생: ${apiError.message}`);
            }
        }

        console.log('실시간 주식 가격 업데이트 완료.');
    } catch (error) {
        console.error(`실시간 주식 가격 업데이트 중 오류 발생: ${error.message}`);
    } finally {
        await connection.end();
    }
}

// 주식 가격 자동 업데이트 시작 (10분 간격)
function startRealStockUpdate(interval = 10) {
    console.log('실시간 주식 가격 업데이트 스케줄러 시작...');
    setInterval(async () => {
        console.log(`[${new Date().toLocaleTimeString()}] 실시간 주식 가격 업데이트 작업 실행`);
        await updateRealStockPrices();
    }, interval * 60 * 1000); // interval (분) 단위로 실행
}

module.exports = { startRealStockUpdate };
