// Simple local AI service for testing
const localAI = {
  generateResponse: async (message, context) => {
    return {
      message: '🧰 Мастер КЁЛТИСОН:\n\nИзвините, локальный AI недоступен. Используется YandexGPT.',
      metadata: { local_ai_used: true }
    };
  }
};

module.exports = localAI;