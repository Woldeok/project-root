const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('가입')
        .setDescription('Discord 유저 정보를 저장합니다.'),
    async execute(interaction) {
        const userId = interaction.user.id; // Discord 사용자 ID
        const username = interaction.user.username; // Discord 사용자 이름
        const discriminator = interaction.user.discriminator; // Discord 사용자 태그

        try {
            // 콘솔에 사용자 정보 출력
            console.log(`가입 요청 - ID: ${userId}, 사용자명: ${username}#${discriminator}`);

            // 데이터베이스 연결
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            // 사용자 이미 가입 여부 확인
            const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
            if (rows.length > 0) {
                await interaction.reply({
                    content: `이미 가입되어 있습니다, <@${userId}>!`, // 사용자 태그
                    ephemeral: true,
                });
                await connection.end();
                return;
            }

            // 새 사용자 추가
            await connection.execute(
                'INSERT INTO users (id, username, discriminator, balance) VALUES (?, ?, ?, ?)',
                [userId, username, discriminator, 0] // 초기 잔액은 0으로 설정
            );
            await connection.end();

            // 사용자에게 성공 응답
            await interaction.reply({
                content: `환영합니다, <@${userId}>! 가입이 완료되었습니다. 🎉`, // 사용자 태그
                ephemeral: true,
            });
        } catch (error) {
            console.error(`가입 처리 중 오류 발생:
            사용자 ID: ${userId}
            사용자명: ${username}#${discriminator}
            오류 메시지: ${error.message}`);

            // 오류 발생 시 사용자에게 알림
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: `<@${userId}>, 가입 처리 중 오류가 발생했습니다. 나중에 다시 시도해주세요.`,
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: `<@${userId}>, 가입 처리 중 오류가 발생했습니다. 나중에 다시 시도해주세요.`,
                    ephemeral: true,
                });
            }
        }
    },
};
