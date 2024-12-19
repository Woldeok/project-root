const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('돈받기') // 슬래시 명령어 이름
        .setDescription('10분마다 랜덤 금액을 획득합니다.'), // 명령어 설명
    async execute(interaction) {
        const userId = interaction.user.id; // Discord 사용자 ID
        const username = interaction.user.username; // Discord 사용자 이름
        const discriminator = interaction.user.discriminator; // Discord 사용자 태그
        const minAmount = 5000; // 최소 금액
        const maxAmount = 50000; // 최대 금액
        const earnedAmount = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount; // 랜덤 금액
        const cooldownMinutes = 10; // 쿨타임(분 단위)

        try {
            console.log(`돈받기 요청 - ID: ${userId}, 사용자명: ${username}#${discriminator}, 금액: ${earnedAmount}`);

            // 데이터베이스 연결
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            // 사용자 존재 여부 확인
            const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
            if (rows.length === 0) {
                await interaction.reply({
                    content: `가입되지 않은 사용자입니다, <@${userId}>. 먼저 /가입 명령어를 사용하세요.`,
                    ephemeral: true,
                });
                await connection.end();
                return;
            }

            // 쿨타임 확인
            const lastClaimTime = rows[0].last_claim || null; // 사용자의 마지막 돈받기 시간
            const now = new Date();

            if (lastClaimTime) {
                const lastClaimDate = new Date(lastClaimTime);
                const diffMinutes = Math.floor((now - lastClaimDate) / (1000 * 60)); // 분 단위로 차이 계산

                if (diffMinutes < cooldownMinutes) {
                    await interaction.reply({
                        content: `<@${userId}>님, 돈받기를 다시 사용하려면 ${cooldownMinutes - diffMinutes}분 더 기다려야 합니다.`,
                        ephemeral: true,
                    });
                    await connection.end();
                    return;
                }
            }

            // 사용자 잔액 업데이트 및 마지막 요청 시간 기록
            await connection.execute(
                'UPDATE users SET balance = balance + ?, last_claim = ? WHERE id = ?',
                [earnedAmount, now, userId]
            );
            await connection.end();

            // 사용자에게 성공 응답
            await interaction.reply({
                content: `<@${userId}>님, 축하합니다! ${earnedAmount}원을 획득하셨습니다. 🎉`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`돈받기 처리 중 오류 발생:
            사용자 ID: ${userId}
            사용자명: ${username}#${discriminator}
            오류 메시지: ${error.message}`);

            // 오류 발생 시 사용자에게 알림
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: `<@${userId}>, 처리 중 오류가 발생했습니다. 나중에 다시 시도해주세요.`,
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: `<@${userId}>, 처리 중 오류가 발생했습니다. 나중에 다시 시도해주세요.`,
                    ephemeral: true,
                });
            }
        }
    },
};
