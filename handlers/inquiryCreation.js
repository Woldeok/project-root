const { ChannelType, PermissionsBitField } = require('discord.js');
const mysql = require('mysql2/promise');

async function handleInquiryCreation(interaction) {
    const userId = interaction.user.id;
    const guild = interaction.guild;

    let connection;

    try {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        console.log('데이터베이스 연결 중...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('문의 설정 가져오는 중...');
        const [settings] = await connection.execute(
            'SELECT category_id, role_id, content FROM inquiry_settings WHERE guild_id = ?',
            [guild.id]
        );

        if (settings.length === 0) {
            console.log('문의방 설정이 존재하지 않습니다.');
            await interaction.followUp({
                content: '❌ 문의방 설정이 없습니다. 관리자가 `/문의방설정` 명령어를 먼저 실행하세요.',
                ephemeral: true,
            });
            return;
        }

        const { category_id: categoryId, role_id: roleId, content } = settings[0];
        console.log(`설정된 카테고리 ID: ${categoryId}`);

        const categoryChannel = guild.channels.cache.get(categoryId) || await guild.channels.fetch(categoryId).catch(() => null);

        if (!categoryChannel) {
            console.error(`카테고리 ID: ${categoryId}, Guild ID: ${guild.id}`);
            console.log('봇이 이 카테고리에 접근할 수 없습니다. 권한 또는 채널 삭제 여부를 확인하세요.');
            await interaction.followUp({
                content: `❌ 설정된 카테고리(채널 ID: ${categoryId})에 접근할 수 없습니다. 권한 또는 설정을 확인해주세요.`,
                ephemeral: true,
            });
            return;
        }

        console.log('문의방 생성 중...');
        const inquiryChannel = await guild.channels.create({
            name: `문의-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: categoryChannel.id,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: roleId,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    id: userId,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
            ],
        });

        console.log('문의방 생성 완료.');
        await inquiryChannel.send({
            content: `${content}\n문의 관리자: <@&${roleId}>`,
        });

        await interaction.followUp({
            content: `✅ 문의방이 생성되었습니다. <#${inquiryChannel.id}>`,
            ephemeral: true,
        });
    } catch (error) {
        console.error(`문의방 생성 중 오류 발생: ${error.message}`);
        await interaction.followUp({
            content: '❌ 문의방 생성 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
            ephemeral: true,
        });
    } finally {
        if (connection) {
            console.log('데이터베이스 연결 종료 중...');
            await connection.end();
        }
    }
}

module.exports = { handleInquiryCreation };
