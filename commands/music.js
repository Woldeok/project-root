const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');

const musicQueue = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('음악')
        .setDescription('음악 관련 명령어')
        .addSubcommand(subcommand =>
            subcommand
                .setName('재생')
                .setDescription('음악을 재생합니다.')
                .addStringOption(option =>
                    option.setName('검색어')
                        .setDescription('유튜브 URL 또는 검색어')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('건너뛰기')
                .setDescription('현재 재생 중인 음악을 건너뜁니다.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('정지')
                .setDescription('음악 재생을 중단합니다.')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const query = interaction.options.getString('검색어');
        const serverQueue = musicQueue.get(interaction.guild.id);

        console.log(`[INFO] 명령어 실행: ${subcommand}`);

        if (subcommand === '재생') {
            await playMusic(interaction, query, serverQueue);
        } else if (subcommand === '건너뛰기') {
            skipMusic(interaction, serverQueue);
        } else if (subcommand === '정지') {
            stopMusic(interaction, serverQueue);
        }
    },
};

async function playMusic(interaction, query, serverQueue) {
    console.log(`[INFO] 재생 명령어 실행, 검색어: ${query}`);
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
        console.log('[INFO] 음악 검색 시작');
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
        console.log(`[INFO] 음악 검색 완료: ${song.title}, URL: ${song.url}`);
    } catch (error) {
        console.error('[ERROR] 음악 검색 중 오류:', error.message);
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

            connection.on('stateChange', (oldState, newState) => {
                console.log(`[INFO] 연결 상태 변경: ${oldState.status} -> ${newState.status}`);
            });

            await interaction.reply({
                content: `🎶 **음악 재생 중입니다:** [${song.title}](${song.url})`,
                components: [createControlButtons()],
            });
            playSong(interaction.guild.id, queueContruct.songs[0]);
        } catch (error) {
            console.error('[ERROR] 음성 채널 연결 중 오류:', error.message);
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
        console.log('[INFO] 대기열 비어있음, 연결 종료');
        serverQueue.connection.destroy();
        musicQueue.delete(guildId);
        return;
    }

    console.log(`[INFO] 재생 중: ${song.title}`);
    play.stream(song.url).then(stream => {
        const resource = createAudioResource(stream.stream, { inputType: stream.type });
        serverQueue.player.play(resource);
        serverQueue.connection.subscribe(serverQueue.player);

        serverQueue.player.on('stateChange', (oldState, newState) => {
            console.log(`[INFO] 플레이어 상태 변경: ${oldState.status} -> ${newState.status}`);
            if (newState.status === AudioPlayerStatus.Idle) {
                serverQueue.songs.shift();
                playSong(guildId, serverQueue.songs[0]);
            }
        });

        serverQueue.player.on('error', error => {
            console.error('[ERROR] 플레이어 오류:', error.message);
            serverQueue.connection.destroy();
            musicQueue.delete(guildId);
        });
    }).catch(error => {
        console.error('[ERROR] 스트림 생성 중 오류:', error.message);
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
