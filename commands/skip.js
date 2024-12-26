const { SlashCommandBuilder } = require('discord.js');
const musicQueue = require('../musicQueue'); // musicQueue 불러오기

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('현재 재생 중인 음악을 스킵합니다.'),
    async execute(interaction) {
        const serverQueue = musicQueue.get(interaction.guild.id);

        if (!serverQueue) {
            return interaction.reply({ content: '스킵할 음악이 없습니다!', ephemeral: true });
        }

        serverQueue.player.stop();
        interaction.reply('⏭️ 음악을 스킵했습니다.');
    },
};
 