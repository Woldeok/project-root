const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { getStockPrice } = require('../utils/stockUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('주식판매')
        .setDescription('보유한 주식을 판매합니다.')
        .addStringOption(option =>
            option.setName('종목')
                .setDescription('판매할 주식의 종목 코드')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('수량')
                .setDescription('판매할 주식의 수량')
                .setRequired(true)
        ),
    async execute(interaction) {
        const stockSymbol = interaction.options.getString('종목'); // 주식 종목 코드
        const quantity = interaction.options.getInteger('수량'); // 판매 수량
        const userId = interaction.user.id; // 사용자 ID

        try {
            // 현재 주식 가격 조회
            const stockPrice = await getStockPrice(stockSymbol);
            const totalValue = stockPrice * quantity; // 총 판매 금액

            // 데이터베이스 연결
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            // 보유 주식 확인
            const [stockRows] = await connection.execute(
                'SELECT quantity FROM stock_ownership WHERE user_id = ? AND stock_symbol = ?',
                [userId, stockSymbol]
            );

            if (stockRows.length === 0 || stockRows[0].quantity < quantity) {
                await interaction.reply({
                    content: `보유한 ${stockSymbol} 주식 수량이 부족합니다. 현재 보유 수량: ${stockRows[0]?.quantity || 0}주`,
                    ephemeral: true,
                });
                await connection.end();
                return;
            }

            // 주식 판매 처리
            await connection.execute(
                'UPDATE stock_ownership SET quantity = quantity - ? WHERE user_id = ? AND stock_symbol = ?',
                [quantity, userId, stockSymbol]
            );
            await connection.execute(
                'UPDATE users SET balance = balance + ? WHERE id = ?',
                [totalValue, userId]
            );

            // 보유 주식 수량이 0이 되면 삭제
            const [updatedRows] = await connection.execute(
                'SELECT quantity FROM stock_ownership WHERE user_id = ? AND stock_symbol = ?',
                [userId, stockSymbol]
            );

            if (updatedRows[0]?.quantity === 0) {
                await connection.execute(
                    'DELETE FROM stock_ownership WHERE user_id = ? AND stock_symbol = ?',
                    [userId, stockSymbol]
                );
            }

            await connection.end();

            // 성공 응답
            await interaction.reply({
                content: `✅ ${stockSymbol} 주식 ${quantity}주를 판매하셨습니다. 총 판매 금액: ${totalValue.toFixed(2)}원`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`주식 판매 처리 중 오류 발생: ${error.message}`);
            await interaction.reply({
                content: '주식 판매 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
                ephemeral: true,
            });
        }
    },
};
