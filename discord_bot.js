const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { handleInquiryCreation, handleInquiryDeletion } = require('./handlers/buttonHandlers');
const { startRealStockUpdate } = require('./utils/stockUpdate');

// .env 파일 로드
dotenv.config();

const ORANGE = '\x1b[33m';
const RESET = '\x1b[0m';

// 환경 변수 검증
const requiredEnv = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`${ORANGE}필수 환경 변수가 누락되었습니다: ${missingEnv.join(', ')}. .env 파일을 확인하세요.${RESET}`);
    process.exit(1);
}

// Discord 클라이언트 생성
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// 명령어 파일 로드
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (!command.data || (!command.execute && !command.autocomplete)) {
        console.error(`${ORANGE}명령어 파일 ${file}이 올바르지 않습니다.${RESET}`);
        continue;
    }
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// REST API를 통해 슬래시 명령어 등록
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`${ORANGE}슬래시 명령어 등록 시작...${RESET}`);
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log(`${ORANGE}슬래시 명령어가 성공적으로 등록되었습니다.${RESET}`);
    } catch (error) {
        console.error(`${ORANGE}슬래시 명령어 등록 중 오류 발생: ${error.message}${RESET}`);
    }
})();

// 봇 준비
client.once('ready', () => {
    console.log(`${ORANGE}${client.user.tag}로 로그인되었습니다.${RESET}`);
    console.log(`${ORANGE}실시간 주식 가격 업데이트 시작...${RESET}`);
    startRealStockUpdate(); // 실시간 주식 업데이트 시작
    
});

// 명령어 및 버튼 핸들러
client.on('interactionCreate', async interaction => {
    console.log(`${ORANGE}interactionCreate 이벤트 발생: ${interaction.commandName || interaction.customId || '알 수 없음'}${RESET}`);

    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command || !command.autocomplete) {
            console.error(`${ORANGE}자동완성을 지원하지 않는 명령어: ${interaction.commandName}${RESET}`);
            await interaction.respond([]);
            return;
        }
        try {
            console.log(`${ORANGE}자동완성 실행: ${interaction.commandName}${RESET}`);
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(`${ORANGE}자동완성 처리 중 오류 발생: ${error.message}${RESET}`);
            await interaction.respond([]);
        }
    } else if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`${ORANGE}명령어를 찾을 수 없습니다: ${interaction.commandName}${RESET}`);
            await interaction.reply({ content: `명령어를 찾을 수 없습니다: ${interaction.commandName}`, ephemeral: true });
            return;
        }
        try {
            console.log(`${ORANGE}명령어 실행: ${interaction.commandName}${RESET}`);
            await command.execute(interaction);
        } catch (error) {
            console.error(`${ORANGE}명령어 실행 중 오류 발생: ${interaction.commandName} - ${error.message}${RESET}`);
            await interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다.', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        console.log(`${ORANGE}버튼 클릭 이벤트 발생: ${interaction.customId}${RESET}`);
        try {
            if (interaction.customId === 'create_inquiry_button') {
                await handleInquiryCreation(interaction);
            } else if (interaction.customId.startsWith('delete_inquiry_')) {
                const channelId = interaction.customId.split('_')[2];
                await handleInquiryDeletion(interaction, channelId);
            } else {
                console.log(`${ORANGE}알 수 없는 버튼 ID: ${interaction.customId}${RESET}`);
            }
        } catch (error) {
            console.error(`${ORANGE}버튼 처리 중 오류 발생: ${interaction.customId} - ${error.message}${RESET}`);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '버튼 처리 중 오류가 발생했습니다.', ephemeral: true });
            }
        }
    }
});
async function loadInquirySettings(guildId) {
    try {
        console.log('[INFO] 데이터베이스에서 문의방 설정 로드 중...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        const [settings] = await connection.execute(
            'SELECT category_id, role_id, content FROM inquiry_settings WHERE guild_id = ?',
            [guildId]
        );

        await connection.end();

        if (settings.length > 0) {
            const { category_id, role_id, content } = settings[0];
            console.log(`[INFO] 문의방 설정 로드 완료: 카테고리 ID=${category_id}, 역할 ID=${role_id}, 내용="${content}"`);
            return settings[0]; // 설정 반환
        } else {
            console.warn('[WARNING] 저장된 문의방 설정 없음');
            return null;
        }
    } catch (error) {
        console.error(`[ERROR] 문의방 설정 로드 중 오류 발생: ${error.message}`);
        return null;
    }
}

// 디스코드 봇 로그인
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error(`${ORANGE}디스코드 봇 로그인 중 오류 발생: ${error.message}${RESET}`);
    process.exit(1);
});
