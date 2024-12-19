const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('주식목록')
        .setDescription('현재 거래 가능한 모든 주식 목록을 조회합니다.'),
    async execute(interaction) {
        try {
            // 데이터베이스 연결
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            // 주식 목록 조회
            const [stocks] = await connection.execute('SELECT stock_symbol, price FROM stocks');
            await connection.end();

            if (stocks.length === 0) {
                await interaction.reply({
                    content: '현재 등록된 주식이 없습니다.',
                    ephemeral: true,
                });
                return;
            }

            // 주식 목록 포맷팅
            const stockList = stocks
                .map((stock, index) => `${index + 1}. **${stock.stock_symbol}**: ${stock.price.toLocaleString()}원`)
                .join('\n');

            // 사용자에게 응답
            await interaction.reply({
                content: `📋 현재 거래 가능한 주식 목록:\n${stockList}`,
                ephemeral: false, // 모든 사용자에게 보이도록 설정
            });
        } catch (error) {
            console.error(`주식 목록 조회 중 오류 발생: ${error.message}`);
            await interaction.reply({
                content: '주식 목록을 조회하는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
                ephemeral: true,
            });
        }
    },
};
