// Тестовый сервер для проверки работы без базы данных
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'KЁLTISON Mini App is running!'
  });
});

// Mock API endpoints
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'Телефон', icon: '📱', description: 'Смартфоны и мобильные устройства' },
    { id: 2, name: 'Ноутбук', icon: '💻', description: 'Ноутбуки и планшеты' },
    { id: 3, name: 'Бытовая техника', icon: '🧺', description: 'Стиральные машины, холодильники' },
    { id: 4, name: 'Телевизор', icon: '📺', description: 'Телевизоры и мониторы' }
  ]);
});

app.get('/api/brands', (req, res) => {
  res.json([
    { id: 1, name: 'Apple', logo_url: 'https://logo.clearbit.com/apple.com', website: 'https://apple.com' },
    { id: 2, name: 'Samsung', logo_url: 'https://logo.clearbit.com/samsung.com', website: 'https://samsung.com' },
    { id: 3, name: 'Xiaomi', logo_url: 'https://logo.clearbit.com/mi.com', website: 'https://mi.com' }
  ]);
});

// Mock WebApp init
app.post('/api/auth/webapp-init', (req, res) => {
  res.json({
    success: true,
    token: 'mock-jwt-token',
    user: {
      id: 1,
      telegram_id: 123456789,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      is_admin: false,
      is_premium: false
    },
    subscription: {
      plan: 'free',
      status: 'active'
    }
  });
});

// Mock AI chat
app.post('/api/assistant/chat', (req, res) => {
  const { message } = req.body;
  
  let response = '🧰 Мастер КЁЛТИСОН:\n\n';
  
  if (message.toLowerCase().includes('не заряжается')) {
    response += 'Для решения проблемы с зарядкой:\n\n• Проверьте кабель и адаптер\n• Очистите разъем от пыли\n• Попробуйте другой кабель\n\n👉 [Показать инструкции]';
  } else if (message.toLowerCase().includes('разбит')) {
    response += 'При повреждении экрана:\n\n• Оберните устройство в пленку\n• Не используйте сломанный экран\n• Обратитесь в сервис\n\n👉 [Найти сервисный центр]';
  } else {
    response += 'Опишите проблему подробнее, и я помогу найти решение!\n\nМожете указать:\n• Тип устройства\n• Марку и модель\n• Что именно не работает';
  }
  
  res.json({
    session_id: 'mock-session-id',
    response: response,
    metadata: {
      local_ai: true,
      instructions_found: 0
    },
    suggestions: [
      'Не заряжается устройство',
      'Разбит экран',
      'Медленно работает'
    ]
  });
});

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KЁLTISON Mini App test server running on port ${PORT}`);
  console.log(`📱 WebApp URL: http://localhost:${PORT}`);
  console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('Тестовые данные:');
  console.log('- Категории: http://localhost:3000/api/categories');
  console.log('- Бренды: http://localhost:3000/api/brands');
  console.log('- ИИ-чат работает с mock данными');
  console.log('');
  console.log('Для полного функционала нужно настроить PostgreSQL');
});
