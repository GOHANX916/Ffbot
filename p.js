const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const fs = require('fs');
const path = require('path');

// Define the path to your users file.
const usersFilePath = path.join(__dirname, 'users.json');

// Helper function to load users from the file.
function loadUsers() {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(data);
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Helper function to save users to the file.
function saveUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users file:', error);
  }
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// States per chat for multi-step commands
let userStates = {};
let userInputs = {};
// Track likes usage per UID (once per day)
let userLikesLog = {};

// Lines to remove from API responses for non-raw commands
const linesToRemove = [
  'Info Admin - Group',
  'Admin',
  'Telegram',
  'Channel Telegram',
  'Group Zalo'
];

// Function to clean API response.
function cleanApiResponse(response) {
  return response
    .split('\n')
    .filter(line => !linesToRemove.some(removable => line.includes(removable)))
    .join('\n');
}

// Function to escape MarkdownV2 special characters.
function escapeMarkdownV2(text) {
  return text.replace(/([_*[\]()~`>#+\-=|{}\.!])/g, '\\$1');
}

// Function to fetch API data.
async function fetchApiData(url) {
  try {
    const response = await axios.get(url, { responseType: 'text' });
    return response.data;
  } catch (error) {
    return 'Failed to fetch data. Please try again.';
  }
}

// Helper function to get or create a user object (with balance).
function getOrCreateUser(ctx) {
  const users = loadUsers();
  const telegramUser = ctx.message.from;
  
  let user = users.find(u => u.id === telegramUser.id);
  if (!user) {
    user = {
      id: telegramUser.id,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name || '',
      username: telegramUser.username || '',
      balance: 0
    };
    users.push(user);
    saveUsers(users);
  }
  return user;
}

// Helper function to update a user's balance.
function updateUserBalance(userId, newBalance) {
  const users = loadUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].balance = newBalance;
    saveUsers(users);
  }
}

// Costs for premium actions.
const COSTS = {
  CHECK_INFO: 20,
  SEND_VISIT: 50,
  SEARCH_BY_NAME: 10,
  SPAM_FRIEND_REQUEST: 30
};

// ADMIN ID for broadcasting (replace with your Telegram ID)
const ADMIN_ID = 7479124922;

// Define channels.
const CHANNEL1 = '@freefirehacksantiban'; // Required channel (public)
const CHANNEL2 = 'https://t.me/+zRMhWLX04i1jNTU1'; // Optional channel

// Helper: Check if the user is a member of CHANNEL1.
async function checkJoin(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL1, ctx.from.id);
    if (member.status === 'left' || member.status === 'kicked') {
      await ctx.reply(`🚫 Please JOIN ALL CHANNELS first: https://t.me/freefirehacksantiban`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(e);
    await ctx.reply("🚫 Error verifying membership. Please try again later.");
    return false;
  }
}

// /start command: Handle referrals & user registration, then introduce the bot.
bot.start(async (ctx) => {
  const users = loadUsers();
  const telegramUser = ctx.message.from;
  const referralId = ctx.startPayload; // referral parameter, if any
  
  // Check if user already exists.
  let user = users.find(u => u.id === telegramUser.id);
  if (!user) {
    // New user: create them with 0 balance.
    user = {
      id: telegramUser.id,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name || '',
      username: telegramUser.username || '',
      balance: 0
    };
    users.push(user);
    // Referral awarding (if valid).
    if (referralId && referralId !== String(telegramUser.id)) {
      const refUser = users.find(u => String(u.id) === referralId);
      if (refUser) {
        refUser.balance += 50;
        saveUsers(users);
        ctx.reply(`You were referred by ${refUser.first_name}. They have earned 50 points!`);
      }
    }
    saveUsers(users);
  }
  
  // Introduce the bot with two JOIN buttons.
  const introMessage = "This is The First Ai🌐 powered Telegram bot For Free Fire. Lots of Features you can access Here🌋 OWNER @L1GENDFF.";
  ctx.reply(
    introMessage,
    Markup.inlineKeyboard([
      [
        Markup.button.url("JOIN Channel 1", "https://t.me/freefirehacksantiban"),
        Markup.button.url("JOIN Channel 2", CHANNEL2)
      ],
      [Markup.button.callback("CONTINUE", "continue")]
    ])
  );
});

// Callback for "CONTINUE": Check forced join on CHANNEL1.
bot.action('continue', async (ctx) => {
  if (!(await checkJoin(ctx))) return;
  ctx.answerCbQuery();
  ctx.reply(
    'Welcome! Select an option below 🇮🇳 (For IND server only):',
    Markup.keyboard([
      ['ℹ️ CHECK INFO', '❤️ LIKES'],
      ['👀 SEND VISIT', '🔍 SEARCH BY NAME'],
      ['🚫 CHECK BANNED', '🤝 SPAM FRIEND REQUEST'],
      ['💰 BALANCE', '🔗 REFERRAL'],
      ['👤 OWNER']
    ]).resize()
  );
});

// Middleware for commands (except /start, /ai, /users, broadcast) to check join.
async function requireJoin(ctx, next) {
  if (!(await checkJoin(ctx))) return;
  return next();
}

// Broadcast command: if message starts with "@everyone" and from ADMIN_ID.
bot.hears(/^@everyone\s+(.+)/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const messageToSend = ctx.match[1];
  const users = loadUsers();
  for (const user of users) {
    try {
      await ctx.telegram.sendMessage(user.id, messageToSend);
    } catch (error) {
      console.error(`Failed to send message to ${user.id}`, error);
    }
  }
  ctx.reply("Broadcast sent to all users.");
});

// /users command: Show total number of users.
bot.command('users', (ctx) => {
  const users = loadUsers();
  const userCount = users.length;
  ctx.replyWithMarkdownV2(`🤖 Total Users Using This Bot: *${userCount}*`);
});

// /ai command: Query the AI API.
bot.command('ai', async (ctx) => {
  // /ai is available even without join check.
  const parts = ctx.message.text.split(' ');
  const question = parts.slice(1).join(' ');
  if (!question) {
    return ctx.reply('Please provide a question after the command. For example: /ai What is the meaning of life?');
  }
  ctx.reply('⏳ Processing your query...');
  
  const url = `https://deepseek.ytansh038.workers.dev/?question=${encodeURIComponent(question)}`;
  const apiResponse = await fetchApiData(url);

  let finalAnswer = apiResponse;
  try {
    const parsed = JSON.parse(apiResponse);
    if (parsed.status === 'success' && parsed.message) {
      finalAnswer = parsed.message;
    }
  } catch (err) {
    // Leave as-is.
  }

  const cleanedResponse = escapeMarkdownV2(cleanApiResponse(finalAnswer));
  ctx.replyWithMarkdownV2(`*AI Response:*\n\n${cleanedResponse}`);
});

// For all commands below, require join.
bot.hears('ℹ️ CHECK INFO', requireJoin, (ctx) => {
  const user = getOrCreateUser(ctx);
  if (user.balance < COSTS.CHECK_INFO) {
    return ctx.reply('❌ You do not have enough points to CHECK INFO.');
  }
  user.balance -= COSTS.CHECK_INFO;
  updateUserBalance(user.id, user.balance);
  
  userStates[ctx.chat.id] = 'info';
  ctx.reply('Please enter your User ID:');
});

bot.hears('❤️ LIKES', requireJoin, (ctx) => {
  userStates[ctx.chat.id] = 'likes';
  ctx.reply('Please enter your User ID to receive likes:');
});

bot.hears('👀 SEND VISIT', requireJoin, (ctx) => {
  const user = getOrCreateUser(ctx);
  if (user.balance < COSTS.SEND_VISIT) {
    return ctx.reply('❌ You do not have enough points to SEND VISIT.');
  }
  user.balance -= COSTS.SEND_VISIT;
  updateUserBalance(user.id, user.balance);
  
  userStates[ctx.chat.id] = 'visit_uid';
  ctx.reply('Please enter your User ID to send visits:');
});

bot.hears('🔍 SEARCH BY NAME', requireJoin, (ctx) => {
  const user = getOrCreateUser(ctx);
  if (user.balance < COSTS.SEARCH_BY_NAME) {
    return ctx.reply('❌ You do not have enough points to SEARCH BY NAME.');
  }
  user.balance -= COSTS.SEARCH_BY_NAME;
  updateUserBalance(user.id, user.balance);
  
  userStates[ctx.chat.id] = 'search_name';
  ctx.reply('Please enter the name to search for:');
});

bot.hears('🚫 CHECK BANNED', requireJoin, (ctx) => {
  userStates[ctx.chat.id] = 'banned';
  ctx.reply('Please enter your User ID to check banned status:');
});

bot.hears('🤝 SPAM FRIEND REQUEST', requireJoin, (ctx) => {
  const user = getOrCreateUser(ctx);
  if (user.balance < COSTS.SPAM_FRIEND_REQUEST) {
    return ctx.reply('❌ You do not have enough points to SPAM FRIEND REQUEST.');
  }
  user.balance -= COSTS.SPAM_FRIEND_REQUEST;
  updateUserBalance(user.id, user.balance);
  
  userStates[ctx.chat.id] = 'spam_friend';
  ctx.reply('Please enter your User ID to spam friend request:');
});

bot.hears('💰 BALANCE', requireJoin, (ctx) => {
  const user = getOrCreateUser(ctx);
  ctx.reply(`Your current balance is: ${user.balance} points.`);
});

bot.hears('🔗 REFERRAL', requireJoin, (ctx) => {
  const user = getOrCreateUser(ctx);
  ctx.reply(
    `Share this link with new users:\n` +
    `https://t.me/Legend_X_FF_BOT?start=${user.id}\n\n` +
    `You’ll earn 50 points if they start the bot using your link!`
  );
});

// OWNER option: When clicked, show a "SEE" button linking to the owner's page.
bot.hears('👤 OWNER', requireJoin, (ctx) => {
  ctx.reply("Now you know who is behind It", Markup.inlineKeyboard([
    [Markup.button.url("SEE", "http://t.me/Legend_X_FF_BOT/Legend_bot")]
  ]));
});

// Handle multi-step text inputs.
bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const input = ctx.message.text.trim();
  const state = userStates[chatId];

  // SEND VISIT flow: Step 1 – UID input.
  if (state === 'visit_uid') {
    if (!/^\d+$/.test(input)) {
      return ctx.reply('❌ Invalid UID. Please enter numbers only.');
    }
    userInputs[chatId] = { uid: input };
    userStates[chatId] = 'visit_count';
    return ctx.reply('✅ Now enter the number of visits you want to send:');
  }

  // SEND VISIT flow: Step 2 – Count input.
  if (state === 'visit_count') {
    if (!/^\d+$/.test(input) || parseInt(input) < 1) {
      return ctx.reply('❌ Invalid count. Please enter a positive number.');
    }
    const { uid } = userInputs[chatId];
    const url = `https://freefire-virusteam.vercel.app/ind/visit?key=Bruh&uid=${uid}&sl=${input}`;
    
    ctx.reply('⏳ Connecting to server...');
    const rawData = await fetchApiData(url);
    ctx.replyWithMarkdownV2(
      `✅ *Visits Sent Successfully\\!*\\n\\n📄 *RAW DATA:*\\n\`\`\`\n${rawData}\n\`\`\``
    );
    delete userStates[chatId];
    delete userInputs[chatId];
    return;
  }

  let url;
  let messagePrefix = '';

  if (state === 'info') {
    if (!/^\d+$/.test(input)) {
      return ctx.reply('❌ Invalid UID. Please enter numbers only.');
    }
    url = `https://freefire-virusteam.vercel.app/ind/info?uid=${input}`;
    messagePrefix = '*User Info:*\n\n';
  }
  else if (state === 'likes') {
    if (!/^\d+$/.test(input)) {
      return ctx.reply('❌ Invalid UID. Please enter numbers only.');
    }
    if (userLikesLog[input]) {
      return ctx.reply('❌ YOU ARE DONE FOR TODAY, TRY TOMORROW.');
    }
    userLikesLog[input] = true;
    url = `https://freefire-virusteam.vercel.app/ind/likes?key=Bruh&uid=${input}`;
    messagePrefix = '✅ *Likes Sent Successfully\\!*\\n\\n';
  }
  else if (state === 'search_name') {
    url = `https://freefire-virusteam.vercel.app/ind/search?key=Bruh&name=${encodeURIComponent(input)}`;
    messagePrefix = '🔍 *Search Results:*\n\n';
  }
  else if (state === 'banned') {
    if (!/^\d+$/.test(input)) {
      return ctx.reply('❌ Invalid UID. Please enter numbers only.');
    }
    url = `https://freefire-virusteam.vercel.app/ind/isbanned?uid=${input}`;
    messagePrefix = '*Banned Check:*\n\n';
  }
  else if (state === 'spam_friend') {
    if (!/^\d+$/.test(input)) {
      return ctx.reply('❌ Invalid UID. Please enter numbers only.');
    }
    url = `https://freefire-virusteam.vercel.app/ind/spamkb?key=Bruh&uid=${input}`;
    messagePrefix = '✅ *Spam Friend Request Sent Successfully\\!*\\n\\n';
  }
  else {
    return ctx.reply('Please select an option from the keyboard before entering an ID or name.');
  }

  ctx.reply('⏳ Connecting to server...');
  const apiResponse = await fetchApiData(url);
  const cleanedResponse = escapeMarkdownV2(cleanApiResponse(apiResponse));

  if (state === 'likes') {
    ctx.replyWithMarkdownV2(
      messagePrefix + cleanedResponse + '\\n\\n📢 *IF YOU WANT LIKES IN BULK CONTACT @Gohan52 @L1GENDFF *'
    );
  } else {
    ctx.replyWithMarkdownV2(messagePrefix + cleanedResponse);
  }
  
  delete userStates[chatId];
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
