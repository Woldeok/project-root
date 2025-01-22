const { SlashCommandBuilder } = require('discord.js');
const musicQueue = require('../musicQueue'); // 상위 디렉토리에서 musicQueue 가져오기

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('현재 재생 중인 음악을 정지하고 대기열을 초기화합니다.'),
    async execute(interaction) {
        const serverQueue = musicQueue.get(interaction.guild.id);

        if (!serverQueue) {
            return interaction.reply({ content: '정지할 음악이 없습니다!', ephemeral: true });
        }

        serverQueue.songs = [];
        serverQueue.player.stop();
        serverQueue.connection.destroy();
        musicQueue.delete(interaction.guild.id);

        interaction.reply('⏹️ 음악을 정지하고 대기열을 초기화했습니다.');
    },
};
