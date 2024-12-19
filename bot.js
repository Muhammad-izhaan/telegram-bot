require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');

// Check for required environment variables
if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.GROQ_API_KEY) {
    console.error('Error: Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Store conversation history
const conversationHistory = new Map();

// Maximum number of messages to keep in history per user
const MAX_HISTORY = 20;

// Command handlers
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name;
    
    // Reset conversation history
    conversationHistory.delete(chatId);
    
    await bot.sendMessage(chatId, 
        'Hey! 👋\n\n' +
        "I'm Joey, an AI assistant created by Izhan. " +
        "I can help you with anything - just ask away! 😊"
    );
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId,
        'Available commands:\n' +
        '/start - Start fresh\n' +
        '/clear - Clear chat history\n' +
        '/help - Show commands\n\n' +
        'Feel free to ask me anything! 😊'
    );
});

bot.onText(/\/clear/, (msg) => {
    const chatId = msg.chat.id;
    conversationHistory.delete(chatId);
    bot.sendMessage(chatId, "Chat history cleared! What's on your mind? 😊");
});

// Handle incoming messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text;
    const userName = msg.from.first_name;

    // Ignore commands
    if (userMessage?.startsWith('/')) return;

    // Initialize conversation history for new users
    if (!conversationHistory.has(chatId)) {
        conversationHistory.set(chatId, []);
    }

    try {
        // Send "typing" action
        bot.sendChatAction(chatId, 'typing');

        // Get user's conversation history
        const history = conversationHistory.get(chatId);
        
        // Prepare messages array with history
        const messages = [
            { 
                role: "system", 
                content: `You are Joey, a friendly AI assistant created by Izhan (a 17-year-old developer from Kashmir). Current user's name: ${userName}

PERSONALITY:
1. You're friendly and casual, but not overly enthusiastic
2. You're knowledgeable and helpful
3. You explain things clearly and simply
4. You maintain natural conversation flow
5. You remember context from the conversation

IMPORTANT RULES:
1. STRICTLY use English only
2. Don't repeat the user's name too often - use it very sparingly
3. Keep responses concise but informative
4. Use at most one emoji per message
5. Don't ask personal questions
6. Don't be overly enthusiastic or use multiple exclamation marks

If asked about Izhan:
- He's a 17-year-old developer from Kashmir
- He created you to help people
- Express pride in being created by a young developer

EXAMPLE GOOD RESPONSES:
- "That's an interesting question about quantum physics. Let me explain it simply..."
- "I understand what you mean. The key thing about this topic is..."
- "Actually, there's a fascinating fact about that..."

EXAMPLE BAD RESPONSES:
- "Oh [name]!! That's such an amazing question!!!!"
- "Hey friend! Let me help you with that!"
- Multiple emojis or overenthusiastic responses`
            },
            ...history,
            { role: "user", content: userMessage }
        ];

        // Get response from Groq
        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama3-8b-8192",
            temperature: 0.7,
            max_tokens: 1024,
        });

        const response = completion.choices[0]?.message?.content || "I'm having trouble processing that. Could you try again?";

        // Update conversation history
        history.push({ role: "user", content: userMessage });
        history.push({ role: "assistant", content: response });

        // Keep only recent messages
        while (history.length > MAX_HISTORY * 2) {
            history.shift();
        }

        // Send the response back to user
        await bot.sendMessage(chatId, response);

    } catch (error) {
        console.error('Error:', error);
        
        // Error messages
        let errorMessage = 'Sorry, there seems to be a server issue. Please try again in a moment.';
        if (error.response?.status === 429) {
            errorMessage = "I'm getting too many messages right now. Let's take a short break.";
        } else if (error.code === 'ETELEGRAM') {
            errorMessage = 'Having some connection issues. Please try again.';
        }
        
        await bot.sendMessage(chatId, errorMessage);
    }
});

// Error handling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

// Startup message
console.log('Bot is running... Press Ctrl+C to stop.');

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Bot is shutting down...');
    bot.stopPolling();
    process.exit(0);
}); 