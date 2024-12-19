const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('내정보')
        .setDescription('현재 잔액 및 보유 주식 정보를 확인합니다.'),
    async execute(interaction) {
        const userId = interaction.user.id; // Discord 사용자 ID

        let connection;

        try {
            console.log('[INFO] 내정보 명령어 실행 중...');
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            console.log('[INFO] 사용자 정보 조회...');
            // 사용자 잔액 조회
            const [userRows] = await connection.execute('SELECT balance FROM users WHERE id = ?', [userId]);
            if (userRows.length === 0) {
                await interaction.reply({
                    content: `❌ 가입되지 않은 사용자입니다. /가입 명령어를 사용해 먼저 가입하세요.`,
                    ephemeral: true,
                });
                return;
            }
            const userBalance = userRows[0].balance;

            console.log('[INFO] 보유 주식 정보 조회...');
            // 보유 주식 조회
            const [stockRows] = await connection.execute(
                `SELECT 
                    so.stock_symbol, 
                    so.quantity, 
                    so.purchase_price, 
                    st.price AS current_price 
                FROM stock_ownership AS so
                INNER JOIN stocks AS st ON so.stock_symbol = st.stock_symbol
                WHERE so.user_id = ?`,
                [userId]
            );

            let stockInfo = '보유한 주식이 없습니다.';
            if (stockRows.length > 0) {
                stockInfo = stockRows
                    .map(stock => {
                        const { stock_symbol, quantity, purchase_price, current_price } = stock;
                        const totalPurchasePrice = quantity * purchase_price;
                        const totalCurrentPrice = quantity * current_price;
                        const profitLoss = totalCurrentPrice - totalPurchasePrice;
                        const profitPercentage = ((profitLoss / totalPurchasePrice) * 100).toFixed(2);

                        return `**${stock_symbol}**: ${quantity}주\n- **구매가:** ${purchase_price.toLocaleString()}원\n- **현재가:** ${current_price.toLocaleString()}원\n- **총 구매가:** ${totalPurchasePrice.toLocaleString()}원\n- **현재 가치:** ${totalCurrentPrice.toLocaleString()}원\n- **수익률:** ${profitPercentage}%`;
                    })
                    .join('\n\n');
            }

            console.log('[INFO] 사용자 정보 응답 전송 중...');
            await interaction.reply({
                content: `💰 **현재 잔액:** ${userBalance.toLocaleString()}원\n\n📊 **보유 주식 정보:**\n${stockInfo}`,
                ephemeral: true,
            });
        } catch (error) {
            console.error(`[ERROR] 내정보 처리 중 오류 발생: ${error.message}`);
            await interaction.reply({
                content: '❌ 정보를 조회하는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
                ephemeral: true,
            });
        } finally {
            if (connection) {
                console.log('[INFO] 데이터베이스 연결 종료 중...');
                await connection.end();
                console.log('[INFO] 데이터베이스 연결 종료 완료');
            }
        }
    },
};
