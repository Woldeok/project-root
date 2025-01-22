const { Client, GatewayIntentBits, REST, Routes, Collection } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { updateRealStockPrices, startRealStockUpdate } = require('./utils/stockUpdate');

dotenv.config();

const ORANGE = '\x1b[33m';
const RESET = '\x1b[0m';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.commands = new Collection();

// 명령어 파일 로드
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// REST API로 슬래시 명령어 등록
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`${ORANGE}전역 슬래시 명령어 등록 중...${RESET}`);
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log(`${ORANGE}전역 슬래시 명령어 등록 완료!${RESET}`);
    } catch (error) {
        console.error(`${ORANGE}전역 명령어 등록 중 오류 발생: ${error.message}${RESET}`);
    }

    if (process.env.GUILD_ID) {
        try {
            console.log(`${ORANGE}특정 서버 슬래시 명령어 등록 중...${RESET}`);
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands }
            );
            console.log(`${ORANGE}특정 서버 슬래시 명령어 등록 완료!${RESET}`);
        } catch (error) {
            console.error(`${ORANGE}특정 서버 명령어 등록 중 오류 발생: ${error.message}${RESET}`);
        }
    }
})();

// 데이터베이스 연결
let dbConnection;
(async () => {
    try {
        console.log(`${ORANGE}데이터베이스 연결 중...${RESET}`);
        dbConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        console.log(`${ORANGE}데이터베이스 연결 성공!${RESET}`);
    } catch (error) {
        console.error(`${ORANGE}데이터베이스 연결 중 오류 발생: ${error.message}${RESET}`);
        process.exit(1);
    }
})();

client.on('ready', () => {
    console.log(`${ORANGE}${client.user.tag}로 로그인되었습니다.${RESET}`);

    try {
        startRealStockUpdate();
        console.log(`${ORANGE}실시간 주식 업데이트가 시작되었습니다.${RESET}`);
    } catch (error) {
        console.error(`${ORANGE}실시간 주식 업데이트 시작 중 오류 발생: ${error.message}${RESET}`);
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            return interaction.reply({ content: '명령어를 찾을 수 없습니다.', ephemeral: true });
        }
        try {
            await command.execute(interaction, dbConnection);
        } catch (error) {
            console.error(`[오류] 명령어 실행 중 오류 발생: ${error.message}`);
            interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다.', ephemeral: true });
        }
    } else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`[오류] Autocomplete 처리 중 명령어를 찾을 수 없음: ${interaction.commandName}`);
            return interaction.respond([]);
        }
        try {
            console.log(`[Autocomplete] 처리 중: ${interaction.commandName}`);
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(`[오류] Autocomplete 실행 중 오류 발생: ${error.message}`);
            interaction.respond([]);
        }
    }
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', promise, 'reason:', reason);
});

client.login(process.env.DISCORD_TOKEN).catch((error) => {
    console.error(`${ORANGE}로그인 중 오류 발생: ${error.message}${RESET}`);
});
