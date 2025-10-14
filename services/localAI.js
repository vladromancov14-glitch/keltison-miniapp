// Локальная замена OpenAI API для России
const db = require('../config/database');

// Простой ИИ без внешних API
class LocalAI {
  constructor() {
    this.responses = {
      'не заряжается': [
        'Проверьте кабель зарядки и адаптер',
        'Очистите разъем от пыли и грязи',
        'Попробуйте другой кабель или адаптер',
        'Перезагрузите устройство'
      ],
      'разбит экран': [
        'Осторожно оберните устройство в пленку',
        'Не используйте устройство с поврежденным экраном',
        'Обратитесь в сервисный центр',
        'Проверьте гарантию устройства'
      ],
      'медленно работает': [
        'Закройте неиспользуемые приложения',
        'Очистите кэш приложений',
        'Перезагрузите устройство',
        'Освободите место на диске'
      ],
      'не включается': [
        'Проверьте зарядку устройства',
        'Попробуйте принудительную перезагрузку',
        'Проверьте кнопку питания',
        'Обратитесь в сервисный центр'
      ]
    };
  }

  async generateResponse(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Поиск ключевых слов
    for (const [keyword, responses] of Object.entries(this.responses)) {
      if (lowerMessage.includes(keyword)) {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return {
          message: `🧰 Мастер КЁЛТИСОН:\n\nДля решения проблемы "${keyword}":\n\n• ${randomResponse}\n\nРекомендую также проверить наши инструкции по ремонту!`,
          metadata: {
            context: { ...context, keyword },
            local_ai: true,
            instructions_found: 0
          },
          suggestions: [
            'Показать инструкции по ремонту',
            'Найти сервисный центр',
            'Где купить запчасти'
          ]
        };
      }
    }

    // Общий ответ
    return {
      message: '🧰 Мастер КЁЛТИСОН:\n\nОпишите проблему более подробно, и я помогу найти решение!\n\nМожете указать:\n• Тип устройства\n• Марку и модель\n• Что именно не работает',
      metadata: {
        context: { ...context, general_query: true },
        local_ai: true,
        instructions_found: 0
      },
      suggestions: [
        'Не заряжается устройство',
        'Разбит экран',
        'Медленно работает',
        'Не включается'
      ]
    };
  }
}

module.exports = new LocalAI();
