const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
      scriptSrc: ["'self'", "https://telegram.org"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.telegram.org"],
      frameSrc: ["'self'", "https://telegram.org"]
    }
  }
}));

app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

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
    { id: 3, name: 'Xiaomi', logo_url: 'https://logo.clearbit.com/mi.com', website: 'https://mi.com' },
    { id: 4, name: 'Lenovo', logo_url: 'https://logo.clearbit.com/lenovo.com', website: 'https://lenovo.com' }
  ]);
});

app.get('/api/models', (req, res) => {
  res.json([
    { id: 1, brand_id: 1, category_id: 1, name: 'iPhone 14', description: 'Флагманский смартфон Apple', brand_name: 'Apple', category_name: 'Телефон' },
    { id: 2, brand_id: 2, category_id: 1, name: 'Galaxy S23', description: 'Флагманский смартфон Samsung', brand_name: 'Samsung', category_name: 'Телефон' },
    { id: 3, brand_id: 1, category_id: 2, name: 'MacBook Pro', description: 'Профессиональный ноутбук Apple', brand_name: 'Apple', category_name: 'Ноутбук' }
  ]);
});

app.get('/api/problems', (req, res) => {
  res.json([
    { id: 1, category_id: 1, name: 'Не заряжается', description: 'Устройство не реагирует на подключение зарядки', severity: 'high' },
    { id: 2, category_id: 1, name: 'Разбит экран', description: 'Треснул или разбит дисплей устройства', severity: 'medium' },
    { id: 3, category_id: 2, name: 'Не включается', description: 'Ноутбук не запускается при нажатии кнопки питания', severity: 'critical' }
  ]);
});

app.get('/api/instructions', (req, res) => {
  res.json([
    {
      id: 1,
      model_id: 1,
      problem_id: 1,
      title: 'Замена разъема Lightning',
      description: 'Пошаговая инструкция по замене разъема зарядки iPhone 14',
      difficulty: 'hard',
      estimated_time: '1-2 часа',
      tools_required: ['Отвертка P2 Pentalobe', 'Присоска для экрана'],
      parts_required: ['Разъем Lightning', 'Клей для экрана'],
      cost_estimate: 1500.00,
      is_pro_pretent: false,
      model_name: 'iPhone 14',
      brand_name: 'Apple',
      problem_name: 'Не заряжается'
    }
  ]);
});

// Get specific instruction by ID
app.get('/api/instructions/:id', (req, res) => {
  const instructionId = req.params.id;
  
  const instruction = {
    id: parseInt(instructionId),
    model_id: 1,
    problem_id: 1,
    title: 'Замена разъема Lightning',
    description: 'Пошаговая инструкция по замене разъема зарядки iPhone 14',
    difficulty: 'hard',
    estimated_time: '1-2 часа',
    tools_required: ['Отвертка P2 Pentalobe', 'Присоска для экрана'],
    parts_required: ['Разъем Lightning', 'Клей для экрана'],
    cost_estimate: 1500.00,
    is_pro_pretent: false,
    model_name: 'iPhone 14',
    brand_name: 'Apple',
    problem_name: 'Не заряжается',
    steps: [
      {
        step: 1,
        title: 'Отключите устройство',
        description: 'Полностью выключите iPhone и отсоедините все кабели',
        image_url: null
      },
      {
        step: 2,
        title: 'Снимите винты',
        description: 'Открутите два винта Pentalobe в нижней части устройства',
        image_url: null
      },
      {
        step: 3,
        title: 'Откройте корпус',
        description: 'Используйте присоску для экрана, чтобы аккуратно приподнять дисплей',
        image_url: null
      },
      {
        step: 4,
        title: 'Замените разъем',
        description: 'Отсоедините старый разъем и установите новый',
        image_url: null
      },
      {
        step: 5,
        title: 'Соберите устройство',
        description: 'Установите дисплей обратно и закрутите винты',
        image_url: null
      }
    ]
  };
  
  res.json(instruction);
});

app.get('/api/partners', (req, res) => {
  res.json([
    { id: 1, name: 'iFixit', website: 'https://ru.ifixit.com', logo_url: 'https://logo.clearbit.com/ifixit.com', description: 'Оригинальные запчасти и инструменты', is_active: true },
    { id: 2, name: 'AliExpress', website: 'https://aliexpress.ru', logo_url: 'https://logo.clearbit.com/aliexpress.com', description: 'Широкий выбор запчастей', is_active: true }
  ]);
});

// Mock WebApp init
app.post('/api/auth/webapp-init', (req, res) => {
  res.json({
    success: true,
    token: 'mock-jwt-token-' + Date.now(),
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
    response += 'Для решения проблемы с зарядкой:\n\n• Проверьте кабель и адаптер\n• Очистите разъем от пыли\n• Попробуйте другой кабель\n• Перезагрузите устройство\n\n👉 [Показать инструкции]';
  } else if (message.toLowerCase().includes('разбит')) {
    response += 'При повреждении экрана:\n\n• Оберните устройство в пленку\n• Не используйте сломанный экран\n• Обратитесь в сервисный центр\n• Проверьте гарантию\n\n👉 [Найти сервисный центр]';
  } else if (message.toLowerCase().includes('медленно')) {
    response += 'Для ускорения устройства:\n\n• Закройте неиспользуемые приложения\n• Очистите кэш приложений\n• Перезагрузите устройство\n• Освободите место на диске\n\n👉 [Показать инструкции]';
  } else {
    response += 'Опишите проблему подробнее, и я помогу найти решение!\n\nМожете указать:\n• Тип устройства (телефон, ноутбук)\n• Марку и модель\n• Что именно не работает\n\nПример: "Не заряжается iPhone 14"';
  }
  
  res.json({
    session_id: 'mock-session-' + Date.now(),
    response: response,
    metadata: {
      local_ai: true,
      instructions_found: 1,
      has_pro_access: false
    },
    suggestions: [
      'Не заряжается устройство',
      'Разбит экран',
      'Медленно работает',
      'Не включается'
    ]
  });
});

// Mock admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    res.json({
      success: true,
      token: 'admin-token-' + Date.now(),
      admin: {
        id: 1,
        username: username,
        is_admin: true
      }
    });
  } else {
    res.status(401).json({ error: 'Неверные учетные данные' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    mode: 'simple (no database)'
  });
});

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index-simple.html'));
});

// Admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KЁLTISON Mini App server running on port ${PORT}`);
  console.log(`📱 WebApp URL: ${process.env.WEBAPP_URL || `http://localhost:${PORT}`}`);
  console.log(`🔧 Admin Panel: ${process.env.WEBAPP_URL || `http://localhost:${PORT}`}/admin`);
  console.log(`❤️ Health Check: ${process.env.WEBAPP_URL || `http://localhost:${PORT}`}/health`);
  console.log(`🎯 Mode: Simple (mock data, no database)`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('🌐 Production mode enabled');
  } else {
    console.log('🔧 Development mode enabled');
  }
});
