const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const localAI = require('../services/localAI');

const router = express.Router();

// Apply auth middleware
router.use(verifyToken);

// Chat with AI assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, session_id } = req.body;
    const user = req.user;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get or create session
    let session;
    if (session_id) {
      const sessionResult = await db.query(
        'SELECT * FROM chat_sessions WHERE session_id = $1 AND user_id = $2',
        [session_id, user.id]
      );
      session = sessionResult.rows[0];
    }
    
    if (!session) {
      const newSessionId = uuidv4();
      const newSession = await db.query(
        'INSERT INTO chat_sessions (user_id, session_id, context) VALUES ($1, $2, $3) RETURNING *',
        [user.id, newSessionId, {}]
      );
      session = newSession.rows[0];
    }
    
    // Save user message
    await db.query(
      'INSERT INTO chat_messages (session_id, message, is_user) VALUES ($1, $2, $3)',
      [session.session_id, message, true]
    );
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, user, session);
    
    // Save AI response
    await db.query(
      'INSERT INTO chat_messages (session_id, message, is_user, metadata) VALUES ($1, $2, $3, $4)',
      [session.session_id, aiResponse.message, false, aiResponse.metadata || {}]
    );
    
    res.json({
      session_id: session.session_id,
      response: aiResponse.message,
      metadata: aiResponse.metadata || {},
      suggestions: aiResponse.suggestions || []
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat history
router.get('/chat/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    const user = req.user;
    
    // Verify session belongs to user
    const sessionResult = await db.query(
      'SELECT * FROM chat_sessions WHERE session_id = $1 AND user_id = $2',
      [session_id, user.id]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Get messages
    const messagesResult = await db.query(
      'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
      [session_id]
    );
    
    res.json({
      session_id,
      messages: messagesResult.rows
    });
    
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's chat sessions
router.get('/sessions', async (req, res) => {
  try {
    const user = req.user;
    
    const result = await db.query(
      `SELECT cs.*, cm.message as last_message, cm.created_at as last_message_at
       FROM chat_sessions cs
       LEFT JOIN chat_messages cm ON cs.session_id = cm.session_id
       WHERE cs.user_id = $1
       ORDER BY cs.updated_at DESC
       LIMIT 10`,
      [user.id]
    );
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate AI response
async function generateAIResponse(message, user, session) {
  try {
    // Check if user has PRO subscription for advanced features
    const hasProAccess = await checkProAccess(user.id);
    
    // Analyze message for device/repair context
    const context = analyzeMessage(message);
    
    // Search for relevant instructions
    const relevantInstructions = await searchRelevantInstructions(context);
    
    // Try OpenAI first, fallback to local AI
    let response;
    try {
      if (process.env.OPENAI_API_KEY) {
        // Use OpenAI API if available
        response = await generateOpenAIResponse(message, context, relevantInstructions, hasProAccess);
      } else {
        throw new Error('OpenAI API key not available');
      }
    } catch (openaiError) {
      console.log('OpenAI not available, using local AI:', openaiError.message);
      // Use local AI as fallback
      response = await localAI.generateResponse(message, context);
      
      // Add instructions if found
      if (relevantInstructions.length > 0) {
        response.message += '\n\n📋 Найденные инструкции:\n';
        relevantInstructions.slice(0, 3).forEach((instruction, index) => {
          response.message += `${index + 1}. ${instruction.brand_name} ${instruction.model_name} - ${instruction.title}\n`;
        });
        response.message += '\n👉 [Показать все инструкции]';
      }
    }
    
    // Add PRO upgrade suggestion if applicable
    if (!hasProAccess && context.needsProFeatures) {
      response.message += '\n\n💎 Для получения более подробных инструкций и персональных консультаций оформите PRO-подписку!';
    }
    
    return response;
    
  } catch (error) {
    console.error('AI response generation error:', error);
    return {
      message: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте переформулировать вопрос или обратитесь в службу поддержки.',
      metadata: { error: true }
    };
  }
}

// Generate OpenAI response (if API key available)
async function generateOpenAIResponse(message, context, instructions, hasProAccess) {
  // This would integrate with OpenAI API
  // For now, return the existing logic
  const response = generateContextualResponse(context, instructions, hasProAccess);
  
  return {
    message: response,
    metadata: {
      context,
      instructions_found: instructions.length,
      has_pro_access: hasProAccess,
      openai_used: true
    },
    suggestions: generateSuggestions(context, instructions)
  };
}

// Analyze user message for context
function analyzeMessage(message) {
  const lowerMessage = message.toLowerCase();
  
  const context = {
    device_type: null,
    problem: null,
    brand: null,
    model: null,
    urgency: 'medium',
    needsProFeatures: false
  };
  
  // Detect device type
  const deviceKeywords = {
    phone: ['телефон', 'смартфон', 'iphone', 'android', 'мобильный'],
    laptop: ['ноутбук', 'laptop', 'компьютер', 'пк', 'ноут'],
    appliance: ['стиральная', 'холодильник', 'микроволновка', 'бытовая техника', 'машина'],
    tv: ['телевизор', 'монитор', 'экран', 'тв']
  };
  
  for (const [type, keywords] of Object.entries(deviceKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      context.device_type = type;
      break;
    }
  }
  
  // Detect problems
  const problemKeywords = {
    'не заряжается': ['не заряжается', 'зарядка', 'батарея', 'аккумулятор'],
    'разбит экран': ['разбит', 'треснул', 'экран', 'дисплей', 'стекло'],
    'не включается': ['не включается', 'не запускается', 'не загружается'],
    'медленно работает': ['медленно', 'тормозит', 'зависает', 'лагает'],
    'плохой звук': ['звук', 'динамик', 'микрофон', 'аудио'],
    'перегревается': ['перегревается', 'нагревается', 'горячий', 'температура']
  };
  
  for (const [problem, keywords] of Object.entries(problemKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      context.problem = problem;
      break;
    }
  }
  
  // Detect urgency
  if (lowerMessage.includes('срочно') || lowerMessage.includes('быстро') || lowerMessage.includes('помогите')) {
    context.urgency = 'high';
  }
  
  // Check if PRO features might be needed
  if (lowerMessage.includes('сложный') || lowerMessage.includes('детально') || lowerMessage.includes('пошагово')) {
    context.needsProFeatures = true;
  }
  
  return context;
}

// Search for relevant instructions
async function searchRelevantInstructions(context) {
  try {
    let query = `
      SELECT i.*, m.name as model_name, b.name as brand_name, p.name as problem_name
      FROM instructions i
      JOIN models m ON i.model_id = m.id
      JOIN brands b ON m.brand_id = b.id
      JOIN problems p ON i.problem_id = p.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;
    
    // Add category filter if device type is known
    if (context.device_type) {
      const categoryMap = {
        phone: 1,
        laptop: 2,
        appliance: 3,
        tv: 4
      };
      
      if (categoryMap[context.device_type]) {
        paramCount++;
        query += ` AND m.category_id = $${paramCount}`;
        params.push(categoryMap[context.device_type]);
      }
    }
    
    // Add problem filter if problem is known
    if (context.problem) {
      paramCount++;
      query += ` AND p.name ILIKE $${paramCount}`;
      params.push(`%${context.problem}%`);
    }
    
    query += ' ORDER BY i.created_at DESC LIMIT 5';
    
    const result = await db.query(query, params);
    return result.rows;
    
  } catch (error) {
    console.error('Search instructions error:', error);
    return [];
  }
}

// Generate contextual response
function generateContextualResponse(context, instructions, hasProAccess) {
  let response = '🧰 Мастер КЁЛТИСОН:\n\n';
  
  if (instructions.length === 0) {
    response += 'К сожалению, я не нашел точных инструкций по вашей проблеме. ';
    response += 'Попробуйте указать более конкретно:\n';
    response += '• Тип устройства (телефон, ноутбук, бытовая техника, телевизор)\n';
    response += '• Марку и модель\n';
    response += '• Подробное описание проблемы\n\n';
    response += 'Или воспользуйтесь поиском по каталогу инструкций!';
    return response;
  }
  
  if (instructions.length === 1) {
    const instruction = instructions[0];
    response += `Нашел инструкцию для ${instruction.brand_name} ${instruction.model_name}:\n\n`;
    response += `📋 ${instruction.title}\n`;
    response += `⏱️ Время: ${instruction.estimated_time || 'Не указано'}\n`;
    response += `🔧 Сложность: ${getDifficultyText(instruction.difficulty)}\n`;
    
    if (instruction.cost_estimate > 0) {
      response += `💰 Примерная стоимость: ${instruction.cost_estimate} руб.\n`;
    }
    
    response += `\n👉 [Открыть инструкцию]\n\n`;
    
    if (instruction.tools_required && instruction.tools_required.length > 0) {
      response += `Инструменты: ${instruction.tools_required.join(', ')}\n`;
    }
    
    if (instruction.parts_required && instruction.parts_required.length > 0) {
      response += `Запчасти: ${instruction.parts_required.join(', ')}\n`;
    }
  } else {
    response += `Нашел ${instructions.length} подходящих инструкций:\n\n`;
    
    instructions.slice(0, 3).forEach((instruction, index) => {
      response += `${index + 1}. ${instruction.brand_name} ${instruction.model_name} - ${instruction.title}\n`;
      response += `   ⏱️ ${instruction.estimated_time || 'Не указано'} | 🔧 ${getDifficultyText(instruction.difficulty)}\n`;
    });
    
    response += '\n👉 [Показать все инструкции]\n';
  }
  
  // Add safety warnings
  if (context.urgency === 'high') {
    response += '\n⚠️ Внимание! Если устройство критически важно, рекомендую обратиться в сервисный центр.';
  }
  
  return response;
}

// Generate suggestions
function generateSuggestions(context, instructions) {
  const suggestions = [];
  
  if (context.device_type) {
    suggestions.push(`Показать все инструкции для ${getDeviceTypeText(context.device_type)}`);
  }
  
  if (context.problem) {
    suggestions.push(`Найти решение для "${context.problem}"`);
  }
  
  if (instructions.length > 0) {
    suggestions.push('Где купить запчасти');
    suggestions.push('Найти мастера в моем городе');
  }
  
  suggestions.push('Связаться с поддержкой');
  
  return suggestions;
}

// Helper functions
function getDifficultyText(difficulty) {
  const difficultyMap = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно',
    expert: 'Эксперт'
  };
  return difficultyMap[difficulty] || difficulty;
}

function getDeviceTypeText(deviceType) {
  const deviceMap = {
    phone: 'телефонов',
    laptop: 'ноутбуков',
    appliance: 'бытовой техники',
    tv: 'телевизоров'
  };
  return deviceMap[deviceType] || deviceType;
}

async function checkProAccess(userId) {
  try {
    const result = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status = $2 AND expires_at > NOW()',
      [userId, 'active']
    );
    return result.rows.length > 0 && result.rows[0].plan !== 'free';
  } catch (error) {
    console.error('Check PRO access error:', error);
    return false;
  }
}

module.exports = router;
