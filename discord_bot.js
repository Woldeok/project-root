const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { startRealStockUpdate } = require('./utils/stockUpdate');

// .env 파일 로드
dotenv.config();

// ANSI 주황색 텍스트 설정
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

        // 전역 명령어 등록
        console.log(`${ORANGE}전역 슬래시 명령어 등록 중...${RESET}`);
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log(`${ORANGE}전역 슬래시 명령어가 성공적으로 등록되었습니다.${RESET}`);

        // 특정 서버 명령어 등록
        console.log(`${ORANGE}특정 서버에 슬래시 명령어 등록 중...${RESET}`);
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log(`${ORANGE}특정 서버에 슬래시 명령어가 성공적으로 등록되었습니다.${RESET}`);
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

// 명령어 및 자동완성 핸들러
client.on('interactionCreate', async interaction => {
    console.log(`${ORANGE}interactionCreate 이벤트 발생: ${interaction.commandName || '알 수 없음'}${RESET}`);

    if (interaction.isAutocomplete()) {
        // 자동완성 처리
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
        // 명령어 처리
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
    }
});

// 디스코드 봇 로그인
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error(`${ORANGE}디스코드 봇 로그인 중 오류 발생: ${error.message}${RESET}`);
    process.exit(1);
});
