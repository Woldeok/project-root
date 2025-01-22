const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('도박')
        .setDescription('도박을 통해 돈을 걸고 승리하거나 잃습니다.')
        .addIntegerOption(option =>
            option.setName('금액')
                .setDescription('도박에 사용할 금액')
                .setRequired(true)
        ),
    async execute(interaction) {
        const userId = interaction.user.id; // Discord 사용자 ID
        const username = interaction.user.username; // Discord 사용자 이름
        const betAmount = interaction.options.getInteger('금액'); // 도박 금액

        try {
            // 데이터베이스 연결
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            // 사용자 정보 확인
            const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
            if (rows.length === 0) {
                await interaction.reply({
                    content: `가입되지 않은 사용자입니다, <@${userId}>. 먼저 /가입 명령어를 사용하세요.`,
                    ephemeral: true,
                });
                await connection.end();
                return;
            }

            const currentBalance = rows[0].balance;

            // 잔액 확인
            if (currentBalance < betAmount) {
                await interaction.reply({
                    content: `<@${userId}>님, 잔액이 부족합니다! 현재 잔액: ${currentBalance}원`,
                    ephemeral: true,
                });
                await connection.end();
                return;
            }

            // 도박 결과 처리 (50% 확률)
            const gambleResult = Math.random() < 0.5;
            let resultMessage;

            if (gambleResult) {
                // 성공: 배팅 금액 2배 획득
                const winAmount = betAmount * 2;
                await connection.execute(
                    'UPDATE users SET balance = balance + ? WHERE id = ?',
                    [winAmount - betAmount, userId]
                );
                resultMessage = `<@${userId}>님, 축하합니다! 도박에 성공하여 ${winAmount}원을 얻으셨습니다. 🎉`;
            } else {
                // 실패: 배팅 금액 잃음
                await connection.execute(
                    'UPDATE users SET balance = balance - ? WHERE id = ?',
                    [betAmount, userId]
                );
                resultMessage = `<@${userId}>님, 도박에 실패하여 ${betAmount}원을 잃으셨습니다. 😢`;
            }

            await connection.end();

            // 결과 응답
            await interaction.reply({
                content: resultMessage,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`도박 처리 중 오류 발생:
            사용자 ID: ${userId}
            사용자명: ${username}
            오류 메시지: ${error.message}`);

            await interaction.reply({
                content: `<@${userId}>, 처리 중 오류가 발생했습니다. 나중에 다시 시도해주세요.`,
                ephemeral: true,
            });
        }
    },
};
