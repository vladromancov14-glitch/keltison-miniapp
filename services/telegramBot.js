const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

let bot = null;

function init() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ Telegram bot token not provided');
    return null;
  }
  
  try {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
    
    // Set webhook for WebApp
    if (process.env.WEBAPP_URL) {
      const webAppUrl = `${process.env.WEBAPP_URL}/webapp`;
      bot.setWebAppUrl(webAppUrl);
    }
    
    setupHandlers();
    console.log('✅ Telegram bot initialized successfully');
    return bot;
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error);
    return null;
  }
}

function setupHandlers() {
  // Start command
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Пользователь';
    
    const welcomeMessage = `
🔧 Добро пожаловать в KЁLTISON, ${firstName}!

Я помогу вам с ремонтом ваших устройств:
📱 Телефоны и смартфоны
💻 Ноутбуки и компьютеры  
🧺 Бытовая техника
📺 Телевизоры и мониторы

Нажмите кнопку ниже, чтобы открыть мастер-классы по ремонту!
    `;
    
    const keyboard = {
      inline_keyboard: [[
        {
          text: '🔧 Открыть КЁЛТИСОН',
          web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}` }
        }
      ]]
    };
    
    bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
  });
  
  // Help command
  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `
🔧 <b>KЁLTISON - Мастер ремонта в вашем кармане</b>

<b>Что я умею:</b>
• 📋 Пошаговые инструкции по ремонту
• 🔍 Поиск решений по марке и модели
• 🧰 Список необходимых инструментов и запчастей
• 💰 Информация о стоимости ремонта
• 🤖 ИИ-помощник для консультаций
• 🛒 Ссылки на магазины запчастей

<b>Как пользоваться:</b>
1. Нажмите "Открыть КЁЛТИСОН"
2. Выберите тип устройства
3. Укажите марку и модель
4. Выберите проблему
5. Получите подробную инструкцию!

<b>Команды:</b>
/start - Запустить бота
/help - Показать эту справку
/webapp - Открыть веб-приложение

💎 <b>PRO-подписка</b> дает доступ к:
• Расширенным инструкциям
• Персональным консультациям ИИ
• Приоритетной поддержке
• Эксклюзивным материалам

Поддержка: @keltison_support
    `;
    
    const keyboard = {
      inline_keyboard: [
        [{
          text: '🔧 Открыть КЁЛТИСОН',
          web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}` }
        }],
        [{
          text: '💎 PRO-подписка',
          callback_data: 'pro_upgrade'
        }],
        [{
          text: '📞 Поддержка',
          url: 'https://t.me/keltison_support'
        }]
      ]
    };
    
    bot.sendMessage(chatId, helpMessage, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
  });
  
  // WebApp command
  bot.onText(/\/webapp/, (msg) => {
    const chatId = msg.chat.id;
    
    const keyboard = {
      inline_keyboard: [[
        {
          text: '🔧 Открыть КЁЛТИСОН',
          web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}` }
        }
      ]]
    };
    
    bot.sendMessage(chatId, 'Нажмите кнопку ниже, чтобы открыть KЁLTISON:', {
      reply_markup: keyboard
    });
  });
  
  // Handle callback queries
  bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    switch (data) {
      case 'pro_upgrade':
        const proMessage = `
💎 <b>PRO-подписка KЁLTISON</b>

<b>Что включено:</b>
✅ Расширенные инструкции с видео
✅ Персональные консультации ИИ-мастера
✅ Приоритетная техническая поддержка
✅ Эксклюзивные мастер-классы
✅ Доступ к базе запчастей
✅ Калькулятор стоимости ремонта

<b>Стоимость:</b> 299₽/месяц

<b>Как оформить:</b>
1. Откройте веб-приложение
2. Нажмите "💎 PRO-подписка"
3. Следуйте инструкциям

<b>Попробуйте бесплатно 7 дней!</b>
        `;
        
        const proKeyboard = {
          inline_keyboard: [
            [{
              text: '🔧 Открыть КЁЛТИСОН',
              web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}` }
            }],
            [{
              text: '📞 Поддержка',
              url: 'https://t.me/keltison_support'
            }]
          ]
        };
        
        bot.sendMessage(chatId, proMessage, {
          reply_markup: proKeyboard,
          parse_mode: 'HTML'
        });
        break;
    }
    
    bot.answerCallbackQuery(callbackQuery.id);
  });
  
  // Handle any other messages
  bot.on('message', (msg) => {
    if (msg.text && !msg.text.startsWith('/')) {
      const chatId = msg.chat.id;
      const firstName = msg.from.first_name || 'Пользователь';
      
      const responseMessage = `
Привет, ${firstName}! 👋

Я бот KЁLTISON - ваш персональный мастер по ремонту техники.

Для начала работы используйте команду /start или нажмите кнопку ниже, чтобы открыть веб-приложение с полным функционалом!
      `;
      
      const keyboard = {
        inline_keyboard: [[
          {
            text: '🔧 Открыть КЁЛТИСОН',
            web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}` }
          }
        ]]
      };
      
      bot.sendMessage(chatId, responseMessage, {
        reply_markup: keyboard
      });
    }
  });
  
  // Error handling
  bot.on('error', (error) => {
    console.error('Telegram bot error:', error);
  });
  
  bot.on('polling_error', (error) => {
    console.error('Telegram bot polling error:', error);
  });
}

// Send notification to user
async function sendNotification(telegramId, message, options = {}) {
  if (!bot) {
    console.log('Bot not initialized');
    return false;
  }
  
  try {
    await bot.sendMessage(telegramId, message, options);
    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

// Send WebApp button
async function sendWebAppButton(telegramId, text = 'Открыть KЁLTISON') {
  if (!bot) {
    console.log('Bot not initialized');
    return false;
  }
  
  try {
    const keyboard = {
      inline_keyboard: [[
        {
          text: `🔧 ${text}`,
          web_app: { url: `${process.env.WEBAPP_URL || 'http://localhost:3000'}` }
        }
      ]]
    };
    
    await bot.sendMessage(telegramId, 'Нажмите кнопку ниже:', {
      reply_markup: keyboard
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send WebApp button:', error);
    return false;
  }
}

module.exports = {
  init,
  sendNotification,
  sendWebAppButton,
  getBot: () => bot
};
