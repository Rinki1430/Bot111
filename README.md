# Telegram Bot (Node.js + Vercel Serverless)

A lightweight, production-ready Telegram bot built with Node.js (ES Modules)
and deployed as a Vercel Serverless Function. Uses Telegram's **webhook**
delivery method — no database, no polling, no unnecessary dependencies.

## Folder Structure

```
telegram-bot/
│
├── api/
│   └── webhook.js       # Serverless function — Telegram webhook endpoint
│
├── lib/
│   └── telegram.js      # Reusable Telegram Bot API helper functions
│
├── package.json
├── vercel.json           # Vercel routing/function config
├── .gitignore
├── .env.example
└── README.md
```

## Features

- `POST /api/webhook` — receives Telegram updates
- `/start` — replies with a fixed welcome message
- All other messages are silently ignored
- Clean, modular architecture designed for easy extension (see below)

---

## 1. Installation

**Requirements:** Node.js 22+, a Vercel account, and a Telegram bot token.

```bash
# Clone or copy this project, then install dependencies
cd telegram-bot
npm install
```

### Create a Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts.
3. Copy the bot token you receive (looks like `123456789:ABCdefGhIJKlmNoPQRstuVWxyz`).

### Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
```

---

## 2. Local Development

Install the Vercel CLI if you don't have it:

```bash
npm install -g vercel
```

Run the local dev server:

```bash
npm run dev
```

This starts the serverless function locally (typically at
`http://localhost:3000/api/webhook`). Note that Telegram webhooks require a
publicly accessible HTTPS URL, so for local testing you'll need a tunnel
tool such as [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Then use the generated `https://...ngrok-free.app/api/webhook` URL as your
webhook URL (see step 4 below).

---

## 3. Deploy to Vercel

```bash
# Log in (first time only)
vercel login

# Deploy to production
vercel --prod
```

After deployment, Vercel gives you a production URL, e.g.:

```
https://your-project.vercel.app
```

Your webhook endpoint will be:

```
https://your-project.vercel.app/api/webhook
```

### Set the environment variable on Vercel

Either via the CLI:

```bash
vercel env add BOT_TOKEN
```

Or via the Vercel Dashboard:
**Project → Settings → Environment Variables → Add `BOT_TOKEN`**

Redeploy after adding the variable:

```bash
vercel --prod
```

---

## 4. Set the Telegram Webhook

Tell Telegram where to send updates by calling the `setWebhook` API method.
Replace `YOUR_TELEGRAM_BOT_TOKEN` and the URL with your own:

```bash
curl -X POST \
  "https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-project.vercel.app/api/webhook"}'
```

A successful response looks like:

```json
{ "ok": true, "result": true, "description": "Webhook was set" }
```

### Verify the webhook

```bash
curl "https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

### Remove the webhook (if needed)

```bash
curl "https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/deleteWebhook"
```

---

## 5. Testing

1. Open Telegram and search for your bot by its username.
2. Send `/start`.
3. You should receive:

   ```
   ━━━━━━━━━━━━━━━
   🤖 I AM HERE

   💬 MAIN KYA HELP KAR SAKTA HOON?
   ━━━━━━━━━━━━━━━
   ```

4. Send any other message (e.g. "hello") — the bot will not respond, as
   designed.

### Checking logs

If something isn't working, check function logs:

```bash
vercel logs your-project.vercel.app
```

or view them live in the Vercel Dashboard under **Deployments → Logs**.

---

## Architecture & Extensibility

The project is intentionally minimal but structured so new features can be
layered on without a rewrite:

| Future Feature      | Where it plugs in |
|----------------------|--------------------|
| Database / MongoDB   | Add a `lib/db.js` module and call it from `api/webhook.js` |
| Admin Panel          | Add new API routes under `api/` (e.g. `api/admin/*.js`) |
| Broadcast            | Add a `lib/broadcast.js` using `sendMessage()` in a loop |
| Scheduler            | Use a Vercel Cron Job hitting a new `api/cron/*.js` route |
| Force Join           | Add a check in `handleTextMessage` before processing commands |
| Referral System      | Persist referral data via the database layer, parse `/start <payload>` |
| Premium UI            | Extend `sendMessage()` calls with `reply_markup` (inline keyboards) |
| AI Commands           | Add a new command branch in `handleTextMessage` calling an AI API |
| File Upload            | Add helpers to `lib/telegram.js` (e.g. `sendPhoto`, `sendDocument`) |
| Analytics              | Log events to an external service or database inside handlers |

All Telegram API interactions are centralized in `lib/telegram.js`, and all
update routing logic lives in `api/webhook.js` — keeping the codebase easy
to navigate as it grows.

## License

MIT
