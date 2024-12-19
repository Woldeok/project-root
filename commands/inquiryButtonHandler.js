const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId.startsWith('create_inquiry_')) {
            const userId = interaction.user.id;
            const guild = interaction.guild;
            const guildId = guild.id;

            try {
                // 데이터베이스 연결
                const connection = await mysql.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_NAME,
                });

                // 문의 설정 가져오기
                const [settings] = await connection.execute(
                    'SELECT category_id, role_id, content FROM inquiry_settings WHERE guild_id = ?',
                    [guildId]
                );

                if (settings.length === 0) {
                    await interaction.reply({
                        content: '❌ 문의방 설정이 없습니다. 관리자가 `/문의방설정` 명령어를 먼저 실행하세요.',
                        ephemeral: true,
                    });
                    return;
                }

                const { category_id: categoryId, role_id: roleId, content } = settings[0];

                // 문의방 생성
                const categoryChannel = guild.channels.cache.get(categoryId);
                if (!categoryChannel) {
                    await interaction.reply({
                        content: '❌ 카테고리를 찾을 수 없습니다. 관리자가 설정을 확인해주세요.',
                        ephemeral: true,
                    });
                    return;
                }

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

                // 버튼 생성 (문의방 삭제 버튼)
                const deleteButton = new ButtonBuilder()
                    .setCustomId(`delete_inquiry_${inquiryChannel.id}`)
                    .setLabel('문의방 삭제')
                    .setStyle(ButtonStyle.Danger);

                const actionRow = new ActionRowBuilder().addComponents(deleteButton);

                await inquiryChannel.send({
                    content: `${content}\n문의 담당자: <@&${roleId}>`,
                    components: [actionRow],
                });

                await interaction.reply({
                    content: `✅ 문의방이 생성되었습니다. <#${inquiryChannel.id}>`,
                    ephemeral: true,
                });

                await connection.end();
            } catch (error) {
                console.error(`문의방 생성 중 오류 발생: ${error.message}`);
                await interaction.reply({
                    content: '❌ 문의방 생성 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
                    ephemeral: true,
                });
            }
        }
    },
};
