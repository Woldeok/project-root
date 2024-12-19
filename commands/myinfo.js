const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('내정보')
        .setDescription('현재 잔액 및 보유 중인 주식을 확인합니다.'),
    async execute(interaction) {
        const userId = interaction.user.id; // Discord 사용자 ID

        try {
            // 데이터베이스 연결
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            // 사용자 정보 확인
            const [userRows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
            if (userRows.length === 0) {
                await interaction.reply({
                    content: `가입되지 않은 사용자입니다, <@${userId}>. 먼저 /가입 명령어를 사용하세요.`,
                    ephemeral: true,
                });
                await connection.end();
                return;
            }

            const { balance, username, discriminator } = userRows[0];

            // 보유 주식 정보 가져오기
            const [stockRows] = await connection.execute(
                'SELECT stock_symbol, quantity FROM stock_ownership WHERE user_id = ?',
                [userId]
            );
            await connection.end();

            // 보유 주식 정보 포맷팅
            let stockInfo = '보유한 주식이 없습니다.';
            if (stockRows.length > 0) {
                stockInfo = stockRows
                    .map(stock => `- ${stock.stock_symbol}: ${stock.quantity}주 보유`)
                    .join('\n');
            }

            // 사용자 정보 응답
            const response = `**${username}#${discriminator}님의 정보**\n` +
                `- 현재 잔액: ${balance.toLocaleString('ko-KR')}원\n\n` +
                `**보유 주식 목록:**\n${stockInfo}`;

            await interaction.reply({
                content: response,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`내정보 조회 중 오류 발생:
            사용자 ID: ${userId}
            오류 메시지: ${error.message}`);

            await interaction.reply({
                content: `<@${userId}>, 정보 조회 중 오류가 발생했습니다. 나중에 다시 시도해주세요.`,
                ephemeral: true,
            });
        }
    },
};
