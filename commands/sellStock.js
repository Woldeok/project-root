const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');
const { getStockPrice } = require('../utils/stockUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('주식판매')
        .setDescription('보유한 주식을 판매합니다.')
        .addStringOption(option =>
            option.setName('종목')
                .setDescription('판매할 주식의 종목 코드')
                .setRequired(true)
                .setAutocomplete(true) // 자동완성 활성화
        )
        .addIntegerOption(option =>
            option.setName('수량')
                .setDescription('판매할 주식의 수량')
                .setRequired(true)
        ),
    async autocomplete(interaction) {
        const userId = interaction.user.id;

        console.log(`[Autocomplete] User ID: ${userId}`);
        try {
            // 데이터베이스 연결
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            console.log('[Autocomplete] Connected to database');

            // 사용자 보유 주식 조회
            const [stocks] = await connection.execute(
                'SELECT stock_symbol FROM stock_ownership WHERE user_id = ?',
                [userId]
            );

            console.log(`[Autocomplete] Stocks retrieved:`, stocks);

            if (stocks.length === 0) {
                console.warn(`[Autocomplete] No stocks found for user ${userId}`);
                await interaction.respond([]);
                await connection.end();
                return;
            }

            // 주식 가격 추가
            const choices = await Promise.all(stocks.map(async (stock) => {
                try {
                    const price = await getStockPrice(stock.stock_symbol);
                    console.log(`[Autocomplete] Fetched price for ${stock.stock_symbol}: ${price}`);
                    return {
                        name: `${stock.stock_symbol} - ${price.toFixed(2)}원`,
                        value: stock.stock_symbol,
                    };
                } catch (error) {
                    console.error(`[Autocomplete] Error fetching price for ${stock.stock_symbol}:`, error.message);
                    return {
                        name: stock.stock_symbol,
                        value: stock.stock_symbol,
                    };
                }
            }));

            console.log(`[Autocomplete] Final choices for user ${userId}:`, choices);
            await connection.end();

            // Discord API 제한 준수 (최대 25개 선택지)
            await interaction.respond(choices.slice(0, 25));
        } catch (error) {
            console.error(`[Autocomplete] Error for user ${userId}:`, error.message);
            await interaction.respond([]);
        }
    },
    async execute(interaction) {
        const stockSymbol = interaction.options.getString('종목');
        const quantity = interaction.options.getInteger('수량');
        const userId = interaction.user.id;

        console.log(`[Execute] User ID: ${userId}, Stock: ${stockSymbol}, Quantity: ${quantity}`);
        try {
            const stockPrice = await getStockPrice(stockSymbol);
            console.log(`[Execute] Stock price for ${stockSymbol}: ${stockPrice}`);
            const totalValue = stockPrice * quantity;

            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });

            console.log('[Execute] Connected to database');

            const [stockRows] = await connection.execute(
                'SELECT quantity FROM stock_ownership WHERE user_id = ? AND stock_symbol = ?',
                [userId, stockSymbol]
            );

            console.log(`[Execute] Stock data for ${stockSymbol}:`, stockRows);

            if (stockRows.length === 0 || stockRows[0].quantity < quantity) {
                console.warn(`[Execute] Insufficient stock for ${stockSymbol}. Requested: ${quantity}, Available: ${stockRows[0]?.quantity || 0}`);
                await interaction.reply({
                    content: `보유한 ${stockSymbol} 주식 수량이 부족합니다. 현재 보유 수량: ${stockRows[0]?.quantity || 0}주`,
                    ephemeral: true,
                });
                await connection.end();
                return;
            }

            // 주식 판매 로직
            await connection.execute(
                'UPDATE stock_ownership SET quantity = quantity - ? WHERE user_id = ? AND stock_symbol = ?',
                [quantity, userId, stockSymbol]
            );
            await connection.execute(
                'UPDATE users SET balance = balance + ? WHERE id = ?',
                [totalValue, userId]
            );

            const [updatedRows] = await connection.execute(
                'SELECT quantity FROM stock_ownership WHERE user_id = ? AND stock_symbol = ?',
                [userId, stockSymbol]
            );

            console.log(`[Execute] Updated stock data for ${stockSymbol}:`, updatedRows);

            if (updatedRows[0]?.quantity === 0) {
                await connection.execute(
                    'DELETE FROM stock_ownership WHERE user_id = ? AND stock_symbol = ?',
                    [userId, stockSymbol]
                );
                console.log(`[Execute] Deleted stock ownership for ${stockSymbol}`);
            }

            await connection.end();

            await interaction.reply({
                content: `✅ ${stockSymbol} 주식 ${quantity}주를 판매하셨습니다. 총 판매 금액: ${totalValue.toFixed(2)}원`,
                ephemeral: false,
            });
        } catch (error) {
            console.error(`[Execute] Error for user ${userId}:`, error.message);
            await interaction.reply({
                content: '주식 판매 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
                ephemeral: true,
            });
        }
    },
};
