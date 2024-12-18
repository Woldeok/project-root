const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('내정보')
        .setDescription('현재 잔액 및 정보를 확인합니다.'),
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
            const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId]);
            if (rows.length === 0) {
                await interaction.reply({
                    content: `가입되지 않은 사용자입니다, <@${userId}>. 먼저 /가입 명령어를 사용하세요.`,
                    ephemeral: true,
                });
                await connection.end();
                return;
            }

            const { balance, username, discriminator } = rows[0];
            await connection.end();

            // 사용자 정보 응답
            await interaction.reply({
                content: `<@${userId}>님, 현재 잔액은 ${balance}원입니다. (유저명: ${username}#${discriminator})`,
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
