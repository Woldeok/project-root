const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { getStockPrice } = require('../utils/stockUtils'); // 정확한 경로 확인

module.exports = {
    data: new SlashCommandBuilder()
        .setName('주식구매')
        .setDescription('주식을 구매합니다.')
        .addStringOption(option =>
            option.setName('종목')
                .setDescription('구매할 주식의 종목 코드')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('수량')
                .setDescription('구매할 주식의 수량')
                .setRequired(true)
        ),
    async execute(interaction) {
        const stockSymbol = interaction.options.getString('종목'); // 종목 코드
        const quantity = interaction.options.getInteger('수량'); // 구매 수량
        const userId = interaction.user.id; // 사용자 ID

        try {
            // 주식 가격 가져오기
            const stockPrice = await getStockPrice(stockSymbol); // 함수 호출
            const totalCost = stockPrice * quantity;

            // 데이터베이스 연결
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            const [userRows] = await connection.execute('SELECT balance FROM users WHERE id = ?', [userId]);
            if (userRows.length === 0) {
                await interaction.reply({
                    content: '가입되지 않은 사용자입니다. /가입 명령어를 사용하세요.',
                    ephemeral: true,
                });
                await connection.end();
                return;
            }

            const userBalance = userRows[0].balance;
            if (userBalance < totalCost) {
                await interaction.reply({
                    content: `잔액이 부족합니다! 현재 잔액: ${userBalance}원, 필요한 금액: ${totalCost}원`,
                    ephemeral: true,
                });
                await connection.end();
                return;
            }

            // 구매 처리
            await connection.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [totalCost, userId]);
            await connection.execute(
                'INSERT INTO stock_ownership (user_id, stock_symbol, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
                [userId, stockSymbol, quantity, quantity]
            );

            await connection.end();
            await interaction.reply({ content: `✅ ${stockSymbol} 주식 ${quantity}주 구매 완료! 총 비용: ${totalCost}원`, ephemeral: true });
        } catch (error) {
            console.error(`주식 구매 처리 중 오류 발생: ${error.message}`);
            await interaction.reply({ content: '주식 구매 처리 중 오류가 발생했습니다.', ephemeral: true });
        }
    },
};
