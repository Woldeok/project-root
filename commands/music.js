const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');
const { google } = require('googleapis');
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY, // YouTube API 키 설정
});
const musicQueue = new Map(); // 서버별 음악 대기열 관리

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
            .setDescription('재생할 유튜브 URL 또는 검색어')
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
        .setDescription('음악 재생을 중단하고 대기열을 초기화합니다.')
    ),
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

async function searchYouTube(query) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      maxResults: 1,
      type: 'video',
    });

    if (response.data.items.length > 0) {
      const video = response.data.items[0];
      return {
        title: video.snippet.title,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      };
    } else {
      throw new Error('검색 결과를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('YouTube API 검색 중 오류 발생:', error.message);
    throw error;
  }
}

async function playMusic(interaction, query, serverQueue) {
  const voiceChannel = interaction.member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply('음성 채널에 먼저 들어가 주세요!');
  }

  const permissions = voiceChannel.permissionsFor(interaction.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return interaction.reply('음성 채널에서 말할 권한이 필요합니다!');
  }

  let song;
  if (play.yt_validate(query) === 'video') {
    const songInfo = await play.video_info(query);
    song = {
      title: songInfo.video_details.title,
      url: songInfo.video_details.url,
    };
  } else {
    try {
      song = await searchYouTube(query);
    } catch (error) {
      return interaction.reply('YouTube 검색 중 오류가 발생했습니다.');
    }
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
      await playSong(interaction.guild, queueContruct.songs[0]);
      interaction.reply(`🎵 **${song.title}**을(를) 재생합니다!`);
    } catch (err) {
      console.error(err);
      musicQueue.delete(interaction.guild.id);
      return interaction.reply('음악을 재생하는 데 실패했습니다.');
    }
  } else {
    serverQueue.songs.push(song);
    return interaction.reply(`🎵 **${song.title}**이(가) 대기열에 추가되었습니다!`);
  }
}

async function playSong(guild, song) {
  const serverQueue = musicQueue.get(guild.id);

  if (!song) {
    serverQueue.connection.destroy();
    musicQueue.delete(guild.id);
    return;
  }

  try {
    const stream = await play.stream(song.url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type, // play-dl에서 제공한 스트림 타입 사용
    });

    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);

    serverQueue.textChannel.send(`🎶 현재 재생 중: **${song.title}**`);
  } catch (error) {
    console.error('오디오 스트리밍 중 오류 발생:', error);
    serverQueue.textChannel.send('음악을 재생할 수 없습니다.');
    serverQueue.connection.destroy();
    musicQueue.delete(guild.id);
  }
}

function skipMusic(interaction, serverQueue) {
  if (!serverQueue) return interaction.reply('건너뛸 음악이 없습니다!');
  serverQueue.player.stop();
  interaction.reply('현재 음악을 건너뜁니다!');
}

function stopMusic(interaction, serverQueue) {
  if (!serverQueue) return interaction.reply('정지할 음악이 없습니다!');
  serverQueue.songs = [];
  serverQueue.player.stop();
  serverQueue.connection.destroy();
  musicQueue.delete(interaction.guild.id);
  interaction.reply('음악 재생을 중단하고 대기열을 초기화했습니다.');
}
