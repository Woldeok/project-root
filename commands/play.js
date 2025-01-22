const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');
const fs = require('fs');
const musicQueue = require('../musicQueue');

let inactivityTimers = new Map(); // 서버별 타이머 관리

// 쿠키 설정 (reCAPTCHA 우회)
play.setToken({
    youtube: {
        cookie: fs.readFileSync('./cookies.txt', 'utf-8'), // 프로젝트 루트의 cookies.txt
    },
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('유튜브에서 음악을 검색하고 재생합니다.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('재생할 음악 제목 또는 URL')
                .setRequired(true)
        ),
    async execute(interaction) {
        console.log(`[디버그] /play 명령어 실행: ${interaction.user.tag}`);
        const query = interaction.options.getString('query');
        console.log(`[디버그] 입력받은 검색어: ${query}`);

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            console.log('[디버그] 사용자가 음성 채널에 없습니다.');
            return interaction.reply({ content: '먼저 음성 채널에 들어가 주세요!', ephemeral: true });
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions) {
            console.log('[오류] 봇에게 음성 채널에 대한 권한이 없습니다.');
            return interaction.reply({ content: '봇에게 음성 채널에 대한 권한이 없습니다!', ephemeral: true });
        }
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            console.log('[오류] 봇이 음성 채널에 연결하거나 음성을 전송할 권한이 없습니다.');
            return interaction.reply({ content: '봇이 음성 채널에 연결하거나 음성을 전송할 권한이 없습니다!', ephemeral: true });
        }

        let serverQueue = musicQueue.get(interaction.guild.id);

        if (!serverQueue) {
            console.log('[디버그] 서버 대기열 생성 중...');
            const queueContruct = {
                textChannel: interaction.channel,
                voiceChannel,
                connection: null,
                songs: [],
                player: createAudioPlayer(),
            };

            musicQueue.set(interaction.guild.id, queueContruct);
            serverQueue = queueContruct;

            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                serverQueue.connection = connection;

                connection.on('stateChange', (oldState, newState) => {
                    console.log(`[디버그] 음성 연결 상태 변경: ${oldState.status} -> ${newState.status}`);
                    if (newState.status === 'disconnected') {
                        console.log('[디버그] 연결 끊김. 대기열 삭제.');
                        musicQueue.delete(interaction.guild.id);
                    }
                });

                console.log('[디버그] 음성 연결 완료.');
                await changeRegion(voiceChannel); // 리전 변경 시도
                await playMusic(interaction, query, serverQueue);
            } catch (err) {
                console.error('[오류] 음성 채널 연결 중 오류 발생:', err);
                musicQueue.delete(interaction.guild.id);
                return interaction.reply({ content: '음성 채널에 연결할 수 없습니다.', ephemeral: true });
            }
        } else {
            console.log('[디버그] 기존 대기열에 추가 중...');
            await playMusic(interaction, query, serverQueue);
        }
    },
};

async function playMusic(interaction, query, serverQueue) {
    try {
        console.log(`[디버그] 음악 검색 시작: ${query}`);

        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
            console.log('[디버그] Interaction 지연 처리 완료.');
        }

        let songInfo;
        if (play.yt_validate(query) === 'video') {
            console.log('[디버그] 입력값이 유튜브 동영상 URL입니다.');
            songInfo = await play.video_info(query);
        } else {
            console.log('[디버깅] 검색어를 유튜브에서 검색 중...');
            const searchResult = await play.search(query, { limit: 1 });
            if (!searchResult.length) throw new Error('검색 결과를 찾을 수 없습니다.');
            songInfo = await play.video_info(searchResult[0].url);
        }

        const song = {
            title: songInfo.video_details.title,
            url: songInfo.video_details.url,
        };

        serverQueue.songs.push(song);
        console.log(`[디버그] 대기열에 추가된 음악: ${song.title}`);
        console.log(`[디버그] 현재 대기열 길이: ${serverQueue.songs.length}`);

        if (serverQueue.songs.length === 1) {
            await attemptPlay(serverQueue, interaction, song);

            const buttons = createMusicButtons('pause', 'stop');
            if (!interaction.replied) {
                await interaction.editReply({
                    content: `🎶 재생 중: **${song.title}**\n[링크](${song.url})`,
                    components: [buttons],
                });
                console.log('[디버그] Interaction 응답 완료.');
            }
        } else {
            if (!interaction.replied) {
                await interaction.editReply({
                    content: `🎵 대기열에 추가됨: **${song.title}**`,
                });
                console.log('[디버그] 대기열 추가 응답 완료.');
            }
        }
    } catch (err) {
        console.error('[오류] 음악 검색 또는 재생 중 오류 발생:', err);

        if (!interaction.replied) {
            await interaction.editReply({
                content: '음악을 검색하거나 재생할 수 없습니다.',
            });
            console.log('[디버그] 오류 응답 완료.');
        }
    }
}

async function attemptPlay(serverQueue, interaction, song, maxAttempts = 5) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`[디버그] ${song.title} 재생 시도 중... (시도 ${attempt}/${maxAttempts})`);
        try {
            const stream = await play.stream(song.url);
            console.log(`[디버그] 스트림 성공: ${song.title}`);

            const resource = createAudioResource(stream.stream, { inputType: stream.type });
            console.log(`[디버그] 오디오 리소스 상태: ${JSON.stringify(resource)}`);

            serverQueue.player.play(resource);
            serverQueue.connection.subscribe(serverQueue.player);

            console.log(`[디버그] 플레이어 실행 성공: ${song.title}`);
            return; // 재생 성공 시 종료
        } catch (err) {
            console.error(`[오류] 재생 시도 실패: ${err.message}`);
            if (attempt === maxAttempts) {
                console.error('[오류] 재생이 여러 번 실패했습니다. 대기열에서 곡을 제거합니다.');
                serverQueue.songs.shift();
                break;
            }
        }
    }

    if (!interaction.replied) {
        await interaction.editReply({
            content: '재생할 수 없는 곡입니다. 다른 곡을 추가해주세요.',
        });
    }
}

async function changeRegion(voiceChannel) {
    try {
        const validRegions = [
            'brazil', 'hongkong', 'india', 'japan', 'rotterdam', 'russia', 'singapore',
            'south-korea', 'southafrica', 'sydney', 'us-central', 'us-east', 'us-south', 'us-west',
        ];

        for (const region of validRegions) {
            console.log(`[디버그] 지역 변경 시도: ${region}`);
            await voiceChannel.edit({ rtcRegion: region });
            await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기
        }
    } catch (error) {
        console.error('[오류] 음성 채널 지역 변경 중 오류 발생:', error.message);
    }
}

function createMusicButtons(...types) {
    const row = new ActionRowBuilder();
    types.forEach(type => {
        if (type === 'pause') {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('pause')
                    .setLabel('⏸️ 일시 정지')
                    .setStyle(ButtonStyle.Primary)
            );
        } else if (type === 'play') {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('play')
                    .setLabel('▶️ 재생')
                    .setStyle(ButtonStyle.Success)
            );
        } else if (type === 'stop') {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('stop')
                    .setLabel('⏹️ 정지')
                    .setStyle(ButtonStyle.Danger)
            );
        }
    });
    return row;
}
