const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const TOKEN = "7935641284:AAEMsJFEt-_n203bu3IvNNAEKrV17wgQrqw";
const bot = new TelegramBot(TOKEN);

// Channels to check
const CHANNELS = ["@gpayspoof"];

exports.handler = async function(event, context) {
    const body = JSON.parse(event.body);
    const message = body.message || body.callback_query;
    if (!message) return { statusCode: 200 };

    const chatId = message.message ? message.message.chat.id : message.from.id;
    const messageId = message.message ? message.message.message_id : message.callback_query.message.message_id;

    // Handle /start
    if (message.message && message.message.text === "/start") {
        await bot.sendMessage(chatId, "Join Our Channel To Gain Instagram Followers For Free", {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Join Channel", url: "https://t.me/coderajinkya" },
                        { text: "Join Channel", url: "https://t.me/gpayspoof" }
                    ],
                    [
                        { text: "Joined", callback_data: "/joined" }
                    ]
                ]
            }
        });
    }

    // Handle /joined
    if (message.callback_query && message.callback_query.data === "/joined") {
        const userId = message.from.id;

        try {
            const results = await Promise.all(
                CHANNELS.map(ch =>
                    axios.get(`https://api.telegram.org/bot${TOKEN}/getChatMember`, {
                        params: { chat_id: ch, user_id: userId }
                    })
                )
            );

            let allJoined = true;
            for (let res of results) {
                const status = res.data.result.status;
                if (!["member", "creator", "administrator"].includes(status)) allJoined = false;
            }

            if (!allJoined) {
                await bot.answerCallbackQuery(message.callback_query.id, {
                    text: "You are not joined to our channel",
                    show_alert: true
                });
            } else {
                await bot.editMessageText("Claim Your Free Instagram Followers:", {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: "Claim Followers", url: "https://instaboostdwajju.netlify.app/" }
                            ]
                        ]
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    return { statusCode: 200 };
};

