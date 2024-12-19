const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');
const musicQueue = new Map(); // 서버별 음악 대기열 관리

module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('음악 관련 명령어')
    .addSubcommand(subcommand =>
      subcommand
        .setName('play')
        .setDescription('음악을 재생합니다.')
        .addStringOption(option =>
          option.setName('query')
            .setDescription('재생할 유튜브 URL 또는 검색어')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('skip')
        .setDescription('현재 재생 중인 음악을 건너뜁니다.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stop')
        .setDescription('음악 재생을 중단하고 대기열을 초기화합니다.')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const query = interaction.options.getString('query');
    const serverQueue = musicQueue.get(interaction.guild.id);

    if (subcommand === 'play') {
      await playMusic(interaction, query, serverQueue);
    } else if (subcommand === 'skip') {
      skipMusic(interaction, serverQueue);
    } else if (subcommand === 'stop') {
      stopMusic(interaction, serverQueue);
    }
  },
};

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
    const searchResults = await play.search(query, { limit: 1 });
    if (searchResults.length === 0) {
      return interaction.reply('검색 결과를 찾을 수 없습니다.');
    }
    const songInfo = searchResults[0];
    song = {
      title: songInfo.title,
      url: songInfo.url,
    };
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
      playSong(interaction.guild, queueContruct.songs[0]);
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

function playSong(guild, song) {
  const serverQueue = musicQueue.get(guild.id);

  if (!song) {
    serverQueue.connection.destroy();
    musicQueue.delete(guild.id);
    return;
  }

  const resource = createAudioResource(play.stream(song.url).stream);
  serverQueue.player.play(resource);
  serverQueue.connection.subscribe(serverQueue.player);

  serverQueue.textChannel.send(`🎶 현재 재생 중: **${song.title}**`);
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
