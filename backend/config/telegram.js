import { isDbConnected } from './mockDb.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Send message to Telegram Chat/Group
 * @param {string} text - Message body
 * @param {object} replyMarkup - Telegram inline keyboard or other reply markup
 */
export const sendTelegramMessage = async (text, replyMarkup = null) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram Bot Token or Chat ID not configured. Message:', text);
    return null;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: TELEGRAM_CHAT_ID,
    text: text,
    parse_mode: 'HTML',
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API Error:', data.description);
    }
    return data;
  } catch (error) {
    console.error('Error sending Telegram message:', error.message);
    return null;
  }
};

/**
 * Answer Telegram callback query (shows a toast or alert to user on Telegram)
 * @param {string} callbackQueryId
 * @param {string} text
 */
export const answerCallbackQuery = async (callbackQueryId, text) => {
  if (!TELEGRAM_BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    });
  } catch (err) {
    console.error('Error answering callback query:', err.message);
  }
};

/**
 * Edit Telegram message text and keyboard (to update button status)
 * @param {number|string} messageId
 * @param {string} text
 * @param {object} replyMarkup
 */
export const editTelegramMessage = async (messageId, text, replyMarkup = null) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
  } catch (err) {
    console.error('Error editing Telegram message:', err.message);
  }
};
