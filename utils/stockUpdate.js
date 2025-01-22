const mysql = require('mysql2/promise');
const yahooFinance = require('yahoo-finance2').default;

// 이전 변동 폭 저장
let previousChange = 0;

async function updateRealStockPrices() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
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
                // Yahoo Finance에서 실시간 주식 가격 가져오기
                const quote = await yahooFinance.quote(stockSymbol);
                const marketPrice = quote?.regularMarketPrice
                    ? Math.round(quote.regularMarketPrice)
                    : currentPrice;

                // 변동 폭 계산 (이전 변동 기반)
                const maxChange = 1000000; // 최대 변동 폭 100만 원
                const minChange = Math.floor(maxChange / 10); // 최소 변동 폭 10만 원
                const adjustFactor = Math.random() > 0.5 ? 1 : -1; // 상승/하락 랜덤 결정
                let change = Math.floor(Math.random() * (maxChange - minChange + 1) + minChange) * adjustFactor;

                // 이전 변동 크기 고려
                if (Math.abs(previousChange) > maxChange / 2) {
                    change = Math.floor(change / 2); // 이전 변동이 크면 현재 변동 감소
                }

                // 새로운 가격 계산
                const newPrice = Math.max(1000, marketPrice + change); // 최소 가격 1만 원

                // 이전 변동 갱신
                previousChange = change;

                // 주식 가격 업데이트
                await connection.execute(
                    'UPDATE stocks SET price = ? WHERE stock_symbol = ?',
                    [newPrice, stockSymbol]
                );
            } catch (apiError) {
                console.error(`[ERROR] ${stockSymbol} 업데이트 중 API 오류 발생: ${apiError.message}`);
            }
        }
    } catch (error) {
        console.error(`[ERROR] 실시간 주식 가격 업데이트 중 오류 발생: ${error.message}`);
    } finally {
        await connection.end();
    }
}

// 주식 가격 자동 업데이트 시작
function startRealStockUpdate(interval = 1) {
    console.log('[INFO] 실시간 주식 가격 업데이트 스케줄러 시작...');
    setInterval(async () => {
        await updateRealStockPrices();
    }, interval * 60 * 1000); // interval (분) 단위로 실행
}

module.exports = { startRealStockUpdate };
