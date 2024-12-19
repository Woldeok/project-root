const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('문의방설정')
        .setDescription('문의방 설정을 진행합니다.')
        .addChannelOption(option =>
            option.setName('카테고리')
                .setDescription('문의방이 생성될 카테고리')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('문의관리자')
                .setDescription('문의 관리를 담당할 역할을 선택하세요.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('내용')
                .setDescription('문의의 기본 내용을 입력하세요.')
                .setRequired(true)
        ),
    async execute(interaction) {
        const categoryChannel = interaction.options.getChannel('카테고리');
        const inquiryRole = interaction.options.getRole('문의관리자');
        const inquiryContent = interaction.options.getString('내용');
        const guildId = interaction.guild.id;

        try {
            // 데이터베이스 연결
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            // 기존 설정 삭제 및 새로운 설정 삽입
            await connection.execute(
                'DELETE FROM inquiry_settings WHERE guild_id = ?',
                [guildId]
            );
            await connection.execute(
                'INSERT INTO inquiry_settings (guild_id, category_id, role_id, content) VALUES (?, ?, ?, ?)',
                [guildId, categoryChannel.id, inquiryRole.id, inquiryContent]
            );

            await connection.end();

            // 버튼 생성
            const createInquiryButton = new ButtonBuilder()
                .setCustomId('create_inquiry_button')
                .setLabel('문의 생성하기')
                .setStyle(ButtonStyle.Primary);

            const actionRow = new ActionRowBuilder().addComponents(createInquiryButton);

            // 설정 완료 메시지와 버튼 전송
            await interaction.reply({
                content: `✅ 문의방 설정이 완료되었습니다.\n**카테고리:** ${categoryChannel.name}\n**관리 역할:** ${inquiryRole.name}\n**내용:** ${inquiryContent}\n\n아래 버튼을 클릭하여 문의를 생성하세요.`,
                components: [actionRow],
                ephemeral: true,
            });
        } catch (error) {
            console.error(`문의방 설정 중 오류 발생: ${error.message}`);
            await interaction.reply({
                content: '❌ 문의방 설정 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
                ephemeral: true,
            });
        }
    },
};
