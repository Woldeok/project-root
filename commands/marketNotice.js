const { SlashCommandBuilder } = require('discord.js');
const { updateStockPrice } = require('../utils/stockUpdate_s'); // 올바른 경로

module.exports = {
    data: new SlashCommandBuilder()
        .setName('시장공지')
        .setDescription('시장 공지를 통해 주식 가격을 조정합니다.')
        .addStringOption(option =>
            option.setName('종목')
                .setDescription('가격 조정 대상 주식 코드')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('변동')
                .setDescription('가격 변화량 (예: +100 또는 -50)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('내용')
                .setDescription('시장 공지 내용')
                .setRequired(true)
        ),
    async execute(interaction) {
        const adminId = process.env.ADMIN_ID; // 관리자 인증
        if (interaction.user.id !== adminId) {
            await interaction.reply({ content: '이 명령어는 관리자만 사용할 수 있습니다.', ephemeral: true });
            return;
        }

        const stockSymbol = interaction.options.getString('종목'); // 입력된 종목
        const priceChange = interaction.options.getInteger('변동'); // 가격 변동량
        const noticeMessage = interaction.options.getString('내용'); // 공지 내용

        try {
            await updateStockPrice(stockSymbol, priceChange); // 가격 업데이트 호출

            await interaction.reply({
                content: `📢 시장 공지: ${noticeMessage}\n${stockSymbol}의 가격이 ${priceChange > 0 ? '상승' : '하락'}했습니다!`,
            });
        } catch (error) {
            console.error(`시장 공지 처리 중 오류 발생: ${error.message}`);
            await interaction.reply({ content: '시장 공지 처리 중 오류가 발생했습니다.', ephemeral: true });
        }
    },
};
