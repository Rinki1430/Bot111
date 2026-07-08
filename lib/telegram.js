/**
 * lib/telegram.js
 *
 * Reusable helper functions for interacting with the Telegram Bot API.
 * Keeping all raw HTTP calls to Telegram in one place makes it easy to
 * extend the bot later (inline keyboards, file uploads, broadcasts, etc.)
 * without touching the webhook handler logic.
 */

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API_BASE = 'https://api.telegram.org';

if (!BOT_TOKEN) {
  // We don't throw here because this module may be imported during build
  // steps where env vars aren't available yet. The actual request-time
  // handlers should validate this before use.
  console.warn('[telegram.js] BOT_TOKEN is not set in environment variables.');
}

/**
 * Low-level helper to call any Telegram Bot API method.
 *
 * @param {string} method - Telegram API method name (e.g. "sendMessage")
 * @param {object} payload - JSON body to send
 * @returns {Promise<object>} Parsed Telegram API response
 */
async function callTelegramApi(method, payload = {}) {
  if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not configured.');
  }

  const url = `${TELEGRAM_API_BASE}/bot${BOT_TOKEN}/${method}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data.ok) {
    // Telegram returns { ok: false, description, error_code } on failure.
    throw new Error(
      `Telegram API error [${method}]: ${data.description || 'Unknown error'}`
    );
  }

  return data.result;
}

/**
 * Send a text message to a chat.
 *
 * @param {number|string} chatId - Target chat ID
 * @param {string} text - Message text
 * @param {object} [options] - Extra Telegram sendMessage options
 *   (e.g. parse_mode, reply_markup) for future extensibility.
 * @returns {Promise<object>} The sent Message object
 */
export async function sendMessage(chatId, text, options = {}) {
  return callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    ...options,
  });
}

/**
 * Fetch pending updates via long polling.
 * Optional utility — not used in webhook mode, but kept here for local
 * testing/debugging or in case the bot ever needs to run in polling mode.
 *
 * @param {number} [offset] - Identifier of the first update to return
 * @returns {Promise<object[]>} Array of Update objects
 */
export async function getUpdates(offset) {
  return callTelegramApi('getUpdates', offset ? { offset } : {});
}

/**
 * Answer a callback query (used for inline keyboard button presses).
 * Placeholder for future inline keyboard support.
 *
 * @param {string} callbackQueryId - The callback query ID to answer
 * @param {object} [options] - Extra options (text, show_alert, etc.)
 * @returns {Promise<boolean>} True on success
 */
export async function answerCallback(callbackQueryId, options = {}) {
  return callTelegramApi('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...options,
  });
}

/**
 * Register the bot's webhook URL with Telegram.
 * Useful for a setup script or one-off admin call.
 *
 * @param {string} url - Publicly accessible HTTPS URL for the webhook
 * @returns {Promise<boolean>} True on success
 */
export async function setWebhook(url) {
  return callTelegramApi('setWebhook', { url });
}

/**
 * Remove the currently configured webhook.
 *
 * @returns {Promise<boolean>} True on success
 */
export async function deleteWebhook() {
  return callTelegramApi('deleteWebhook', {});
}
