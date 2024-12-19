# Joey - AI Assistant

A friendly AI assistant created by Izhan, a 17-year-old developer from Kashmir. Joey is powered by Groq AI and can help with various topics while maintaining natural conversations.

## Features

- Natural conversation in English
- Knowledge about various topics
- Conversation memory
- Simple command system
- Friendly and helpful personality

## Commands

- `/start` - Start fresh conversation
- `/clear` - Clear chat history
- `/help` - Show available commands

## Setup

1. Clone the repository
```bash
git clone <your-repo-url>
cd telegram-bot
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with your tokens:
```
TELEGRAM_BOT_TOKEN=your_telegram_token
GROQ_API_KEY=your_groq_api_key
```

4. Run the bot
```bash
node bot.js
```

## Deployment

This bot is configured for Vercel deployment:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard.

## Technologies Used

- Node.js
- Telegram Bot API
- Groq AI
- Vercel for hosting

## Created By

Izhan - A 17-year-old developer from Kashmir 