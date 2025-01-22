const { ChannelType, PermissionsBitField } = require('discord.js');
const mysql = require('mysql2/promise');

async function handleInquiryCreation(interaction) {
    const userId = interaction.user.id; // 버튼을 클릭한 사용자 ID
    const guild = interaction.guild; // 서버 정보
    let connection;

    try {
        console.log('[INFO] 버튼 클릭 이벤트 시작');
        console.log(`[DEBUG] 사용자 ID: ${userId}`);
        console.log(`[DEBUG] 서버 ID: ${guild.id}, 서버 이름: ${guild.name}`);

        if (!interaction.deferred && !interaction.replied) {
            console.log('[INFO] Interaction 응답 준비 중...');
            await interaction.deferReply({ ephemeral: true });
        }

        console.log('[INFO] 데이터베이스 연결 시도...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        console.log('[INFO] 데이터베이스 연결 성공');

        console.log('[INFO] 문의 설정 데이터 조회...');
        const [settings] = await connection.execute(
            'SELECT category_id, role_id, content FROM inquiry_settings WHERE guild_id = ?',
            [guild.id]
        );

        if (settings.length === 0) {
            console.warn('[WARNING] 문의 설정 데이터 없음');
            await interaction.followUp({
                content: '❌ 문의방 설정이 없습니다. `/문의방설정` 명령어를 사용해 설정해주세요.',
                ephemeral: true,
            });
            return;
        }

        const { category_id: categoryId, role_id: roleId, content } = settings[0];
        console.log(`[INFO] 설정된 카테고리 ID: ${categoryId}, 역할 ID: ${roleId}, 내용: ${content}`);

        // 카테고리 채널 확인
        console.log('[INFO] 카테고리 채널 확인...');
        let categoryChannel;
        try {
            categoryChannel = guild.channels.cache.get(categoryId);
            if (!categoryChannel) {
                console.warn('[WARNING] 카테고리 캐시에 없음. Fetch 시도...');
                categoryChannel = await guild.channels.fetch(categoryId).catch(() => null);
            }
        } catch (error) {
            console.error(`[ERROR] 카테고리 Fetch 실패: ${error.message}`);
        }

        if (!categoryChannel || categoryChannel.type !== ChannelType.GuildCategory) {
            console.error('[ERROR] 유효하지 않은 카테고리 채널');
            console.log('[ACTION] 잘못된 카테고리 설정 초기화 시도...');
            await connection.execute('DELETE FROM inquiry_settings WHERE guild_id = ?', [guild.id]);
            await interaction.followUp({
                content: '❌ 설정된 카테고리가 삭제되었거나 접근할 수 없습니다. `/문의방설정` 명령어로 다시 설정해주세요.',
                ephemeral: true,
            });
            return;
        }

        console.log(`[INFO] 유효한 카테고리 확인: ${categoryChannel.name} (ID: ${categoryChannel.id})`);

        // 봇 권한 확인
        console.log('[INFO] 봇 권한 확인...');
        const botMember = guild.members.cache.get(interaction.client.user.id);
        const permissions = categoryChannel.permissionsFor(botMember);

        if (!permissions.has(PermissionsBitField.Flags.ViewChannel) || !permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            console.error('[ERROR] 봇 권한 부족');
            await interaction.followUp({
                content: '❌ 봇이 카테고리에 접근하거나 채널을 생성할 권한이 없습니다. 관리자가 봇 권한을 확인해주세요.',
                ephemeral: true,
            });
            return;
        }

        console.log('[INFO] 필요한 봇 권한 확인 완료');

        // 문의방 생성
        console.log('[INFO] 문의방 생성 시도...');
        const inquiryChannel = await guild.channels.create({
            name: `문의-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: categoryChannel.id,
            topic: `문의 내용: ${content}`,
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

        console.log(`[INFO] 문의방 생성 완료: ${inquiryChannel.name} (ID: ${inquiryChannel.id})`);
        await inquiryChannel.send({
            content: `${content}\n문의 관리자: <@&${roleId}>`,
        });

        // Interaction 응답
        console.log('[INFO] Interaction Follow-Up...');
        await interaction.followUp({
            content: `✅ 문의방이 생성되었습니다. <#${inquiryChannel.id}>`,
            ephemeral: true,
        });
        console.log('[INFO] Interaction Follow-Up 완료');
    } catch (error) {
        console.error(`[ERROR] 문의방 생성 중 오류 발생: ${error.message}`);
        await interaction.followUp({
            content: '❌ 문의방 생성 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
            ephemeral: true,
        });
    } finally {
        if (connection) {
            console.log('[INFO] 데이터베이스 연결 종료 중...');
            await connection.end();
            console.log('[INFO] 데이터베이스 연결 종료 완료');
        }
    }
}

module.exports = { handleInquiryCreation };
