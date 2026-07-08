/**
 * api/webhook.js
 *
 * Vercel Serverless Function that receives Telegram Bot updates via webhook.
 *
 * Endpoint: POST /api/webhook
 *
 * Architecture notes for future extensibility:
 * - Command handling is isolated in `handleTextMessage`, so adding new
 *   commands (/help, /profile, /broadcast, etc.) just means adding new
 *   `if` branches or, later, swapping this for a proper command router.
 * - Database, admin panel, referral system, scheduler, etc. can hook into
 *   this handler without changing the webhook contract — Telegram always
 *   POSTs an "Update" object here regardless of what we do with it.
 */

import { sendMessage } from '../lib/telegram.js';

// Exact reply text for the /start command, as specified.
const START_MESSAGE = [
  '━━━━━━━━━━━━━━━',
  '🤖 I AM HERE',
  '',
  '💬 MAIN KYA HELP KAR SAKTA HOON?',
  '━━━━━━━━━━━━━━━',
].join('\n');

/**
 * Handle an incoming text message update.
 * Currently only responds to /start; everything else is ignored.
 *
 * @param {object} message - Telegram Message object
 */
async function handleTextMessage(message) {
  const chatId = message.chat.id;
  const text = (message.text || '').trim();

  // Support "/start" and "/start@BotUsername" variants.
  const command = text.split(/\s+/)[0].split('@')[0];

  switch (command) {
    case '/start':
      await sendMessage(chatId, START_MESSAGE);
      break;

    // Future commands go here, e.g.:
    // case '/help':
    //   await sendMessage(chatId, HELP_MESSAGE);
    //   break;

    default:
      // Silently ignore any other message, as required.
      break;
  }
}

/**
 * Route a Telegram Update object to the correct handler based on its type.
 *
 * @param {object} update - Telegram Update object
 */
async function handleUpdate(update) {
  if (update.message && typeof update.message.text === 'string') {
    await handleTextMessage(update.message);
    return;
  }

  // Future update types (callback_query, my_chat_member, etc.) can be
  // routed here, e.g.:
  // if (update.callback_query) {
  //   await handleCallbackQuery(update.callback_query);
  //   return;
  // }

  // Non-text updates (photos, stickers, joins, etc.) are ignored for now.
}

/**
 * Vercel Serverless Function entry point.
 *
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async function handler(req, res) {
  // Telegram only ever sends POST requests to webhooks.
  if (req.method !== 'POST') {
    res.status(200).json({ ok: true, message: 'Telegram webhook is live.' });
    return;
  }

  try {
    const update = req.body;

    if (!update || typeof update !== 'object') {
      res.status(400).json({ ok: false, error: 'Invalid update payload.' });
      return;
    }

    await handleUpdate(update);

    // Always respond 200 quickly so Telegram doesn't retry/backoff.
    res.status(200).json({ ok: true });
  } catch (error) {
    // Log for observability (visible in Vercel function logs).
    console.error('[webhook] Error handling update:', error);

    // Still return 200 to prevent Telegram from repeatedly retrying a
    // failing update. Errors are captured via logs instead.
    res.status(200).json({ ok: false, error: 'Internal error handled.' });
  }
}
