const { Client, GatewayIntentBits, REST, Routes, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');
const { startRealStockUpdate } = require('./utils/stockUpdate');
// .env 파일 로드
dotenv.config();

const ORANGE = '\x1b[33m';
const RESET = '\x1b[0m';

// 환경 변수 검증
const requiredEnv = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`${ORANGE}필수 환경 변수가 누락되었습니다: ${missingEnv.join(', ')}. .env 파일을 확인하세요.${RESET}`);
    process.exit(1);
}

// Discord 클라이언트 생성
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // 기본 서버 관련 인텐트
        GatewayIntentBits.GuildVoiceStates // 음성 상태 관련 인텐트 추가
    ],
});
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
        console.log(`${ORANGE}전역 슬래시 명령어 등록 시작...${RESET}`);
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log(`${ORANGE}전역 슬래시 명령어가 성공적으로 등록되었습니다.${RESET}`);

        console.log(`${ORANGE}특정 서버 슬래시 명령어 등록 시작...${RESET}`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }  
        );
        console.log(`${ORANGE}특정 서버 슬래시 명령어가 성공적으로 등록되었습니다.${RESET}`);
    } catch (error) {
        console.error(`${ORANGE}슬래시 명령어 등록 중 오류 발생: ${error.message}${RESET}`);
    }
})();

// 봇 준비
client.once('ready', () => {
    console.log(`${ORANGE}${client.user.tag}로 로그인되었습니다.${RESET}`);
    console.log(`${ORANGE}실시간 주식 가격 업데이트 시작...${RESET}`);
    startRealStockUpdate();
});

// 음악 관련 상태 및 대기열
const musicQueue = new Map();

// interaction 처리
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`${ORANGE}명령어를 찾을 수 없습니다: ${interaction.commandName}${RESET}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`${ORANGE}명령어 실행 중 오류 발생: ${error.message}${RESET}`);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다.', ephemeral: true });
            }
        }
    } else if (interaction.isButton()) {
        const serverQueue = musicQueue.get(interaction.guild.id);
        if (!serverQueue) {
            return interaction.reply('현재 재생 중인 음악이 없습니다.', { ephemeral: true });
        }

        if (interaction.customId === 'pause_button') {
            if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
                serverQueue.player.pause();
                await interaction.update({
                    content: '음악이 일시 정지되었습니다.',
                    components: [createResumeStopButtons()],
                });
            } else {
                interaction.reply('음악이 이미 일시 정지 상태입니다.', { ephemeral: true });
            }
        } else if (interaction.customId === 'resume_button') {
            if (serverQueue.player.state.status === AudioPlayerStatus.Paused) {
                serverQueue.player.unpause();
                await interaction.update({
                    content: '음악 재생을 다시 시작합니다.',
                    components: [createControlButtons()],
                });
            } else {
                interaction.reply('음악이 이미 재생 중입니다.', { ephemeral: true });
            }
        } else if (interaction.customId === 'stop_button') {
            stopMusic(interaction, serverQueue);
        }
    }
});

async function playMusic(interaction, query, serverQueue) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({ content: '음성 채널에 먼저 들어가 주세요!', ephemeral: true });
        }
        return; // 이미 응답이 처리된 경우
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({ content: '음성 채널에서 말할 권한이 필요합니다!', ephemeral: true });
        }
        return;
    }

    let song;
    try {
        if (query.startsWith('https://www.youtube.com')) {
            const songInfo = await play.video_info(query);
            song = {
                title: songInfo.video_details.title,
                url: songInfo.video_details.url,
            };
        } else {
            const results = await play.search(query, { limit: 1 });
            if (!results || results.length === 0) throw new Error('검색 결과를 찾을 수 없습니다.');
            song = {
                title: results[0].title,
                url: results[0].url,
            };
        }
    } catch (error) {
        console.error('음악 검색 중 오류 발생:', error.message);
        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({ content: '음악을 검색하는 중 오류가 발생했습니다.', ephemeral: true });
        }
        return;
    }

    if (!serverQueue) {
        const queueContruct = {
            textChannel: interaction.channel,
            voiceChannel,
            connection: null,
            songs: [],
            player: createAudioPlayer(),
        };

        musicQueue.set(interaction.guild.id, queueContruct);
        queueContruct.songs.push(song);

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            queueContruct.connection = connection;

            connection.on(VoiceConnectionStatus.Disconnected, () => {
                musicQueue.delete(interaction.guild.id);
                connection.destroy();
            });

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: `🎶 **음악 재생 중입니다:** [${song.title}](${song.url})`, components: [createControlButtons()] });
            } else {
                await interaction.followUp({ content: `🎶 **음악 재생 중입니다:** [${song.title}](${song.url})`, components: [createControlButtons()] });
            }

            playSong(interaction.guild.id, queueContruct.songs[0]);
        } catch (error) {
            console.error('음성 채널 연결 중 오류 발생:', error.message);
            musicQueue.delete(interaction.guild.id);

            if (!interaction.replied && !interaction.deferred) {
                return interaction.reply({ content: '음악을 재생하는 데 실패했습니다.', ephemeral: true });
            }
            return;
        }
    } else {
        serverQueue.songs.push(song);

        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({ content: `🎵 **${song.title}**이(가) 대기열에 추가되었습니다!` });
        } else {
            return interaction.followUp({ content: `🎵 **${song.title}**이(가) 대기열에 추가되었습니다!` });
        }
    }
}

function playSong(guildId, song) {
    const serverQueue = musicQueue.get(guildId);

    if (!song) {
        console.log('대기열이 비어있습니다. 연결을 종료합니다.');
        serverQueue.connection.destroy();
        musicQueue.delete(guildId);
        return;
    }

    const resource = createAudioResource(song.url);
    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);

    serverQueue.player.on('stateChange', (oldState, newState) => {
        if (newState.status === AudioPlayerStatus.Idle) {
            serverQueue.songs.shift();
            playSong(guildId, serverQueue.songs[0]);
        }
    });

    serverQueue.player.on('error', error => {
        console.error('플레이어 오류 발생:', error.message);
        serverQueue.connection.destroy();
        musicQueue.delete(guildId);
    });
}

function createControlButtons() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('pause_button')
                .setLabel('⏸ 일시 정지')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('stop_button')
                .setLabel('⏹ 정지')
                .setStyle(ButtonStyle.Danger)
        );
}

function createResumeStopButtons() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('resume_button')
                .setLabel('▶️ 재생')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('stop_button')
                .setLabel('⏹ 정지')
                .setStyle(ButtonStyle.Danger)
        );
}

// 디스코드 봇 로그인
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error(`${ORANGE}디스코드 봇 로그인 중 오류 발생: ${error.message}${RESET}`);
    process.exit(1);
});
