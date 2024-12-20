const { Client, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const musicQueue = new Map();

client.commands = new Collection();

// 음악 명령어
const musicCommand = {
    data: {
        name: '음악',
        description: '음악 관련 명령어',
        options: [
            {
                type: 1, // SUB_COMMAND
                name: '재생',
                description: '음악을 재생합니다.',
                options: [
                    {
                        type: 3, // STRING
                        name: '검색어',
                        description: '유튜브 URL 또는 검색어',
                        required: true,
                    },
                ],
            },
            {
                type: 1,
                name: '건너뛰기',
                description: '현재 재생 중인 음악을 건너뜁니다.',
            },
            {
                type: 1,
                name: '정지',
                description: '음악 재생을 중단합니다.',
            },
        ],
    },
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const query = interaction.options.getString('검색어');
        const serverQueue = musicQueue.get(interaction.guild.id);

        if (subcommand === '재생') {
            await playMusic(interaction, query, serverQueue);
        } else if (subcommand === '건너뛰기') {
            skipMusic(interaction, serverQueue);
        } else if (subcommand === '정지') {
            stopMusic(interaction, serverQueue);
        }
    },
};

client.commands.set(musicCommand.data.name, musicCommand);

// 슬래시 명령어 등록
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        console.log('전역 및 특정 서버 슬래시 명령어를 등록하는 중...');
        const commands = Array.from(client.commands.values()).map(cmd => cmd.data);

        // 전역 명령어 등록
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('전역 슬래시 명령어 등록 완료.');

        // 특정 서버 명령어 등록
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log('특정 서버 슬래시 명령어 등록 완료.');
    } catch (error) {
        console.error('슬래시 명령어 등록 중 오류 발생:', error);
    }
})();

client.once('ready', () => {
    console.log(`${client.user.tag} 봇이 준비되었습니다.`);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, musicQueue);
        } catch (error) {
            console.error('명령어 실행 중 오류:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다.', ephemeral: true });
            }
        }
    } else if (interaction.isButton()) {
        handleButtonInteraction(interaction, musicQueue);
    }
});

// 음악 재생 함수
async function playMusic(interaction, query, serverQueue) {
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
        return interaction.reply({ content: '음성 채널에 들어가 주세요!', ephemeral: true });
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
        return interaction.reply({ content: '음성 채널에서 말할 권한이 필요합니다!', ephemeral: true });
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
        return interaction.reply({ content: '음악을 검색하는 중 오류가 발생했습니다.', ephemeral: true });
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

            await interaction.reply({
                content: `🎶 **음악 재생 중입니다:** [${song.title}](${song.url})`,
                components: [createControlButtons()],
            });
            playSong(interaction.guild.id, queueContruct.songs[0]);
        } catch (error) {
            console.error('음성 채널 연결 중 오류 발생:', error.message);
            musicQueue.delete(interaction.guild.id);
            return interaction.reply({ content: '음악을 재생하는 데 실패했습니다.', ephemeral: true });
        }
    } else {
        serverQueue.songs.push(song);
        return interaction.reply({ content: `🎵 **${song.title}**이(가) 대기열에 추가되었습니다!` });
    }
}

function playSong(guildId, song) {
    const serverQueue = musicQueue.get(guildId);

    if (!song) {
        serverQueue.connection.destroy();
        musicQueue.delete(guildId);
        return;
    }

    const resource = createAudioResource(song.url, { inlineVolume: true });
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

function skipMusic(interaction, serverQueue) {
    if (!serverQueue) return interaction.reply({ content: '건너뛸 음악이 없습니다!', ephemeral: true });
    serverQueue.player.stop();
    interaction.reply('현재 음악을 건너뜁니다!');
}

function stopMusic(interaction, serverQueue) {
    if (!serverQueue) return interaction.reply({ content: '정지할 음악이 없습니다!', ephemeral: true });
    serverQueue.songs = [];
    serverQueue.player.stop();
    serverQueue.connection.destroy();
    musicQueue.delete(interaction.guild.id);
    interaction.reply('음악 재생을 중단했습니다.');
}

function handleButtonInteraction(interaction, musicQueue) {
    const serverQueue = musicQueue.get(interaction.guild.id);
    if (!serverQueue) {
        return interaction.reply({ content: '현재 재생 중인 음악이 없습니다.', ephemeral: true });
    }

    if (interaction.customId === 'pause_button') {
        if (serverQueue.player.state.status === AudioPlayerStatus.Playing) {
            serverQueue.player.pause();
            interaction.update({
                content: '음악이 일시 정지되었습니다.',
                components: [createResumeStopButtons()],
            });
        } else {
            interaction.reply({ content: '음악이 이미 일시 정지 상태입니다.', ephemeral: true });
        }
    } else if (interaction.customId === 'resume_button') {
        if (serverQueue.player.state.status === AudioPlayerStatus.Paused) {
            serverQueue.player.unpause();
            interaction.update({
                content: '음악 재생을 다시 시작합니다.',
                components: [createControlButtons()],
            });
        } else {
            interaction.reply({ content: '음악이 이미 재생 중입니다.', ephemeral: true });
        }
    } else if (interaction.customId === 'stop_button') {
        stopMusic(interaction, serverQueue);
    }
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

client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('디스코드 봇 로그인 중 오류 발생:', error);
    process.exit(1);
});
