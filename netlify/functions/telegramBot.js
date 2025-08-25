const axios = require("axios");

const TOKEN = "7935641284:AAEMsJFEt-_n203bu3IvNNAEKrV17wgQrqw"; // Replace with your bot token
const API_URL = `https://api.telegram.org/bot${TOKEN}`;
const CHANNELS = ["@gpayspoof"]; // Channels to check

exports.handler = async function(event) {
  try {
    const update = JSON.parse(event.body); // Telegram sends updates here
    const message = update.message || update.callback_query;

    if (!message) return { statusCode: 200, body: "ok" };

    const chatId = message.message ? message.message.chat.id : message.from.id;
    const messageId = message.message ? message.message.message_id : message.callback_query.message.message_id;

    // Handle /start
    if (message.message && message.message.text === "/start") {
      await axios.post(`${API_URL}/sendMessage`, {
        chat_id: chatId,
        text: "Join Our Channel To Gain Instagram Followers For Free",
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

    // Handle /joined callback
    if (message.callback_query && message.callback_query.data === "/joined") {
      const userId = message.from.id;

      let allJoined = true;

      for (let ch of CHANNELS) {
        try {
          const res = await axios.get(`${API_URL}/getChatMember`, {
            params: { chat_id: ch, user_id: userId }
          });
          const status = res.data.result.status;
          if (!["member", "creator", "administrator"].includes(status)) {
            allJoined = false;
          }
        } catch (err) {
          allJoined = false; // assume not joined if API fails
        }
      }

      if (!allJoined) {
        // User not joined, show alert
        await axios.post(`${API_URL}/answerCallbackQuery`, {
          callback_query_id: message.callback_query.id,
          text: "You are not joined to our channel",
          show_alert: true
        });
      } else {
        // User joined, edit message to claim
        await axios.post(`${API_URL}/editMessageText`, {
          chat_id: chatId,
          message_id: messageId,
          text: "Claim Your Free Instagram Followers:",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Claim Followers", url: "https://instaboostdwajju.netlify.app/" }
              ]
            ]
          }
        });
      }
    }

    return { statusCode: 200, body: "ok" };
  } catch (err) {
    console.error(err);
    return { statusCode: 200, body: "error" };
  }
};
