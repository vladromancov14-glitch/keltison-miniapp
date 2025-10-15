// Запуск Telegram бота для тестирования
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN не найден в .env файле');
  process.exit(1);
}

console.log('🤖 Запуск Telegram бота...');
console.log('🔑 Токен:', token.substring(0, 10) + '...');

const bot = new TelegramBot(token, { polling: true });

// Обработка ошибок
bot.on('error', (error) => {
  console.error('❌ Ошибка бота:', error);
});

bot.on('polling_error', (error) => {
  console.error('❌ Ошибка polling:', error);
});

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'Пользователь';
  
  console.log(`👤 Получен /start от ${firstName} (${chatId})`);
  
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
        web_app: { url: process.env.WEBAPP_URL || 'http://localhost:3000' }
      }
    ]]
  };
  
  bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  console.log(`❓ Получен /help от ${msg.from.first_name} (${chatId})`);
  
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
  `;
  
  const keyboard = {
    inline_keyboard: [
      [{
        text: '🔧 Открыть КЁЛТИСОН',
        web_app: { url: process.env.WEBAPP_URL || 'http://localhost:3000' }
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

// Команда /webapp
bot.onText(/\/webapp/, (msg) => {
  const chatId = msg.chat.id;
  
  console.log(`🌐 Получен /webapp от ${msg.from.first_name} (${chatId})`);
  
  const keyboard = {
    inline_keyboard: [[
      {
        text: '🔧 Открыть КЁЛТИСОН',
        web_app: { url: process.env.WEBAPP_URL || 'http://localhost:3000' }
      }
    ]]
  };
  
  bot.sendMessage(chatId, 'Нажмите кнопку ниже, чтобы открыть KЁLTISON:', {
    reply_markup: keyboard
  });
});

// Обработка callback queries
bot.on('callback_query', (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  console.log(`🔘 Получен callback: ${data} от ${callbackQuery.from.first_name}`);
  
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
            web_app: { url: process.env.WEBAPP_URL || 'http://localhost:3000' }
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

// Обработка любых других сообщений
bot.on('message', (msg) => {
  if (msg.text && !msg.text.startsWith('/')) {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Пользователь';
    
    console.log(`💬 Получено сообщение от ${firstName}: "${msg.text}"`);
    
    const responseMessage = `
Привет, ${firstName}! 👋

Я бот KЁLTISON - ваш персональный мастер по ремонту техники.

Для начала работы используйте команду /start или нажмите кнопку ниже, чтобы открыть веб-приложение с полным функционалом!
    `;
    
    const keyboard = {
      inline_keyboard: [[
        {
          text: '🔧 Открыть КЁЛТИСОН',
          web_app: { url: process.env.WEBAPP_URL || 'http://localhost:3000' }
        }
      ]]
    };
    
    bot.sendMessage(chatId, responseMessage, {
      reply_markup: keyboard
    });
  }
});

// Успешный запуск
console.log('✅ Бот успешно запущен!');
console.log('📱 Напишите боту /start для тестирования');
console.log('🌐 WebApp URL:', process.env.WEBAPP_URL || 'http://localhost:3000');
console.log('');
console.log('Для остановки нажмите Ctrl+C');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка бота...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Остановка бота...');
  bot.stopPolling();
  process.exit(0);
});

