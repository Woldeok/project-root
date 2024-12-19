const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { getStockPrice } = require('../utils/stockUtils'); // 주식 가격 가져오는 유틸리티 함수

module.exports = {
    data: new SlashCommandBuilder()
        .setName('주식구매')
        .setDescription('주식을 구매합니다.')
        .addStringOption(option =>
            option.setName('종목')
                .setDescription('구매할 주식의 종목 코드')
                .setRequired(true)
                .setAutocomplete(true) // 자동완성 활성화
        )
        .addIntegerOption(option =>
            option.setName('수량')
                .setDescription('구매할 주식의 수량')
                .setRequired(true)
        ),

    // 자동완성 핸들러
    async autocomplete(interaction) {
        console.log('[INFO] 자동완성 핸들러 호출됨');
        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            console.log('[INFO] 데이터베이스 연결 성공. 주식 목록 가져오는 중...');
            const [stocks] = await connection.execute('SELECT stock_symbol FROM stocks');
            await connection.end();

            const choices = stocks.map(stock => ({
                name: stock.stock_symbol,
                value: stock.stock_symbol,
            }));

            console.log('[INFO] 자동완성 응답 준비 완료:', choices);
            await interaction.respond(choices.slice(0, 25)); // 최대 25개의 선택지만 반환
        } catch (error) {
            console.error(`[ERROR] 자동완성 처리 중 오류 발생: ${error.message}`);
            await interaction.respond([]);
        }
    },

    // 명령어 실행 핸들러
    async execute(interaction) {
        console.log('[INFO] 주식 구매 명령어 실행');
        const stockSymbol = interaction.options.getString('종목'); // 선택된 주식 코드
        const quantity = interaction.options.getInteger('수량'); // 구매 수량
        const userId = interaction.user.id; // 사용자 ID

        console.log(`[DEBUG] 사용자 입력 - 종목: ${stockSymbol}, 수량: ${quantity}`);

        let connection;

        try {
            const stockPrice = await getStockPrice(stockSymbol); // 주식 가격 가져오기
            console.log(`[INFO] 주식 가격 가져오기 성공 - ${stockSymbol}: ${stockPrice}`);

            const totalCost = stockPrice * quantity;
            console.log(`[INFO] 총 비용 계산 완료 - ${totalCost}`);

            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            const [userRows] = await connection.execute('SELECT balance FROM users WHERE id = ?', [userId]);
            if (userRows.length === 0) {
                console.log('[WARNING] 사용자 정보 없음');
                await interaction.reply({ content: '❌ 가입되지 않은 사용자입니다. /가입 명령어를 사용하세요.', ephemeral: true });
                return;
            }

            const userBalance = userRows[0].balance;
            if (userBalance < totalCost) {
                console.log('[WARNING] 잔액 부족');
                await interaction.reply({ content: `❌ 잔액이 부족합니다! 현재 잔액: ${userBalance.toLocaleString()}원, 필요한 금액: ${totalCost.toLocaleString()}원`, ephemeral: true });
                return;
            }

            console.log('[INFO] 잔액 업데이트 중...');
            await connection.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [totalCost, userId]);

            console.log('[INFO] 주식 보유 정보 업데이트 중...');
            await connection.execute(
                `INSERT INTO stock_ownership (user_id, stock_symbol, quantity, purchase_price)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    quantity = quantity + VALUES(quantity),
                    purchase_price = (purchase_price * quantity + VALUES(purchase_price) * VALUES(quantity)) / (quantity + VALUES(quantity))`,
                [userId, stockSymbol, quantity, stockPrice]
            );

            console.log(`[INFO] 주식 구매 완료: ${stockSymbol}, 수량=${quantity}, 구매가=${stockPrice}`);
            await interaction.reply({
                content: `✅ ${stockSymbol} 주식 ${quantity}주를 구매했습니다.\n- **총 비용:** ${totalCost.toLocaleString()}원\n- **구매가:** ${stockPrice.toLocaleString()}원`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`[ERROR] 주식 구매 처리 중 오류 발생: ${error.message}`);
            await interaction.reply({ content: '❌ 주식 구매 처리 중 오류가 발생했습니다.', ephemeral: true });
        } finally {
            if (connection) {
                console.log('[INFO] 데이터베이스 연결 종료 중...');
                await connection.end();
                console.log('[INFO] 데이터베이스 연결 종료 완료');
            }
        }
    },
};
