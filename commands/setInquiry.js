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

        let connection;

        try {
            // 선택한 카테고리 유효성 검사
            if (!interaction.guild.channels.cache.get(categoryChannel.id)) {
                console.error(`[ERROR] 선택한 카테고리가 유효하지 않음. ID: ${categoryChannel.id}`);
                await interaction.reply({
                    content: '❌ 선택한 카테고리가 유효하지 않습니다. 올바른 카테고리를 선택해주세요.',
                    ephemeral: true,
                });
                return;
            }

            console.log('[INFO] 데이터베이스 연결 중...');
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });
            console.log('[INFO] 데이터베이스 연결 성공');

            console.log('[INFO] 기존 설정 삭제 중...');
            await connection.execute('DELETE FROM inquiry_settings WHERE guild_id = ?', [guildId]);

            console.log('[INFO] 새로운 설정 삽입 중...');
            await connection.execute(
                'INSERT INTO inquiry_settings (guild_id, category_id, role_id, content) VALUES (?, ?, ?, ?)',
                [guildId, categoryChannel.id, inquiryRole.id, inquiryContent]
            );

            console.log('[INFO] 테스트용 문의방 생성 시도...');
            const testChannelName = `문의-테스트`;
            const testChannel = await interaction.guild.channels.create({
                name: testChannelName,
                type: ChannelType.GuildText,
                parent: categoryChannel.id, // 카테고리 설정
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone.id, // 기본적으로 모두 접근 금지
                        deny: ['ViewChannel'],
                    },
                    {
                        id: inquiryRole.id, // 문의 관리자 역할
                        allow: ['ViewChannel', 'SendMessages'],
                    },
                ],
            });

            console.log(`[INFO] 테스트 문의방 생성 완료: ${testChannel.name} (ID: ${testChannel.id})`);

            // 버튼 생성
            const createInquiryButton = new ButtonBuilder()
                .setCustomId('create_inquiry_button')
                .setLabel('문의 생성하기')
                .setStyle(ButtonStyle.Primary);

            const actionRow = new ActionRowBuilder().addComponents(createInquiryButton);

            console.log('[INFO] 설정 완료 메시지 전송 중...');
            await interaction.reply({
                content: `✅ 문의방 설정이 완료되었습니다.\n**카테고리:** ${categoryChannel.name}\n**관리 역할:** ${inquiryRole.name}\n**내용:** ${inquiryContent}\n\n테스트 채널: <#${testChannel.id}>\n\n아래 버튼을 클릭하여 문의를 생성하세요.`,
                components: [actionRow],
                ephemeral: true,
            });

            console.log('[INFO] 문의방 설정이 성공적으로 완료되었습니다');
        } catch (error) {
            console.error(`[ERROR] 문의방 설정 중 오류 발생: ${error.message}`);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ 문의방 설정 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
                    ephemeral: true,
                });
            }
        } finally {
            if (connection) {
                console.log('[INFO] 데이터베이스 연결 종료 중...');
                await connection.end();
                console.log('[INFO] 데이터베이스 연결 종료 완료');
            }
        }
    },
};
