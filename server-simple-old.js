const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

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
    { id: 1, name: 'Телефон', icon: '📱', description: 'Смартфоны и мобильные телефоны' },
    { id: 2, name: 'Ноутбук', icon: '💻', description: 'Портативные компьютеры' },
    { id: 3, name: 'Стиральная машина', icon: '🧺', description: 'Стиральные машины' },
    { id: 4, name: 'Холодильник', icon: '❄️', description: 'Холодильники' },
    { id: 5, name: 'Микроволновка', icon: '🔥', description: 'Микроволновые печи' },
    { id: 6, name: 'Посудомоечная машина', icon: '🍽️', description: 'Посудомоечные машины' },
    { id: 7, name: 'Телевизор', icon: '📺', description: 'Телевизоры и мониторы' }
  ]);
});

app.get('/api/brands', (req, res) => {
  const categoryId = req.query.category_id;
  
  let brands = [];
  
  if (categoryId === '1') { // Телефоны
    brands = [
      { id: 1, name: 'Apple', logo_url: 'https://logo.clearbit.com/apple.com', website: 'https://apple.com' },
      { id: 2, name: 'Samsung', logo_url: 'https://logo.clearbit.com/samsung.com', website: 'https://samsung.com' },
      { id: 3, name: 'Xiaomi', logo_url: 'https://logo.clearbit.com/mi.com', website: 'https://mi.com' },
      { id: 4, name: 'Huawei', logo_url: 'https://logo.clearbit.com/huawei.com', website: 'https://huawei.com' }
    ];
  } else if (categoryId === '2') { // Ноутбуки
    brands = [
      { id: 5, name: 'Apple', logo_url: 'https://logo.clearbit.com/apple.com', website: 'https://apple.com' },
      { id: 6, name: 'Lenovo', logo_url: 'https://logo.clearbit.com/lenovo.com', website: 'https://lenovo.com' },
      { id: 7, name: 'ASUS', logo_url: 'https://logo.clearbit.com/asus.com', website: 'https://asus.com' },
      { id: 8, name: 'HP', logo_url: 'https://logo.clearbit.com/hp.com', website: 'https://hp.com' }
    ];
  } else if (categoryId === '3') { // Стиральные машины
    brands = [
      { id: 9, name: 'Bosch', logo_url: 'https://logo.clearbit.com/bosch.com', website: 'https://bosch.com' },
      { id: 10, name: 'Samsung', logo_url: 'https://logo.clearbit.com/samsung.com', website: 'https://samsung.com' },
      { id: 11, name: 'LG', logo_url: 'https://logo.clearbit.com/lg.com', website: 'https://lg.com' },
      { id: 12, name: 'Whirlpool', logo_url: 'https://logo.clearbit.com/whirlpool.com', website: 'https://whirlpool.com' }
    ];
  } else if (categoryId === '4') { // Холодильники
    brands = [
      { id: 13, name: 'Bosch', logo_url: 'https://logo.clearbit.com/bosch.com', website: 'https://bosch.com' },
      { id: 14, name: 'Samsung', logo_url: 'https://logo.clearbit.com/samsung.com', website: 'https://samsung.com' },
      { id: 15, name: 'LG', logo_url: 'https://logo.clearbit.com/lg.com', website: 'https://lg.com' },
      { id: 16, name: 'Whirlpool', logo_url: 'https://logo.clearbit.com/whirlpool.com', website: 'https://whirlpool.com' }
    ];
  } else if (categoryId === '5') { // Микроволновки
    brands = [
      { id: 17, name: 'Samsung', logo_url: 'https://logo.clearbit.com/samsung.com', website: 'https://samsung.com' },
      { id: 18, name: 'LG', logo_url: 'https://logo.clearbit.com/lg.com', website: 'https://lg.com' },
      { id: 19, name: 'Panasonic', logo_url: 'https://logo.clearbit.com/panasonic.com', website: 'https://panasonic.com' },
      { id: 20, name: 'Sharp', logo_url: 'https://logo.clearbit.com/sharp.com', website: 'https://sharp.com' }
    ];
  } else if (categoryId === '6') { // Посудомоечные машины
    brands = [
      { id: 21, name: 'Bosch', logo_url: 'https://logo.clearbit.com/bosch.com', website: 'https://bosch.com' },
      { id: 22, name: 'Siemens', logo_url: 'https://logo.clearbit.com/siemens.com', website: 'https://siemens.com' },
      { id: 23, name: 'Electrolux', logo_url: 'https://logo.clearbit.com/electrolux.com', website: 'https://electrolux.com' },
      { id: 24, name: 'Candy', logo_url: 'https://logo.clearbit.com/candy.com', website: 'https://candy.com' }
    ];
  } else if (categoryId === '7') { // Телевизоры
    brands = [
      { id: 25, name: 'Samsung', logo_url: 'https://logo.clearbit.com/samsung.com', website: 'https://samsung.com' },
      { id: 26, name: 'LG', logo_url: 'https://logo.clearbit.com/lg.com', website: 'https://lg.com' },
      { id: 27, name: 'Sony', logo_url: 'https://logo.clearbit.com/sony.com', website: 'https://sony.com' },
      { id: 28, name: 'TCL', logo_url: 'https://logo.clearbit.com/tcl.com', website: 'https://tcl.com' }
    ];
  } else {
    // Если категория не указана, показываем телефоны по умолчанию
    brands = [
      { id: 1, name: 'Apple', logo_url: 'https://logo.clearbit.com/apple.com', website: 'https://apple.com' },
      { id: 2, name: 'Samsung', logo_url: 'https://logo.clearbit.com/samsung.com', website: 'https://samsung.com' },
      { id: 3, name: 'Xiaomi', logo_url: 'https://logo.clearbit.com/mi.com', website: 'https://mi.com' },
      { id: 4, name: 'Huawei', logo_url: 'https://logo.clearbit.com/huawei.com', website: 'https://huawei.com' }
    ];
  }
  
  res.json(brands);
});

app.get('/api/models', (req, res) => {
  const brandId = req.query.brand_id;
  const categoryId = req.query.category_id;
  
  let models = [];
  
  // Телефоны
  if (brandId === '1') { // Apple телефоны
    models = [
      { id: 1, brand_id: 1, category_id: 1, name: 'iPhone 14', description: 'Флагманский смартфон Apple', brand_name: 'Apple', category_name: 'Телефон' },
      { id: 2, brand_id: 1, category_id: 1, name: 'iPhone 13', description: 'Предыдущее поколение iPhone', brand_name: 'Apple', category_name: 'Телефон' },
      { id: 3, brand_id: 1, category_id: 1, name: 'iPhone SE', description: 'Компактный iPhone', brand_name: 'Apple', category_name: 'Телефон' }
    ];
  } else if (brandId === '2') { // Samsung телефоны
    models = [
      { id: 4, brand_id: 2, category_id: 1, name: 'Galaxy S23', description: 'Флагманский смартфон Samsung', brand_name: 'Samsung', category_name: 'Телефон' },
      { id: 5, brand_id: 2, category_id: 1, name: 'Galaxy A54', description: 'Средний класс Samsung', brand_name: 'Samsung', category_name: 'Телефон' },
      { id: 6, brand_id: 2, category_id: 1, name: 'Galaxy Note', description: 'Samsung с S-Pen', brand_name: 'Samsung', category_name: 'Телефон' }
    ];
  } else if (brandId === '3') { // Xiaomi телефоны
    models = [
      { id: 7, brand_id: 3, category_id: 1, name: 'Redmi Note 12', description: 'Популярный смартфон Xiaomi', brand_name: 'Xiaomi', category_name: 'Телефон' },
      { id: 8, brand_id: 3, category_id: 1, name: 'Mi 13', description: 'Флагманский Xiaomi', brand_name: 'Xiaomi', category_name: 'Телефон' }
    ];
  } else if (brandId === '4') { // Huawei телефоны
    models = [
      { id: 9, brand_id: 4, category_id: 1, name: 'P60 Pro', description: 'Флагманский Huawei', brand_name: 'Huawei', category_name: 'Телефон' },
      { id: 10, brand_id: 4, category_id: 1, name: 'Nova 11', description: 'Средний класс Huawei', brand_name: 'Huawei', category_name: 'Телефон' }
    ];
  }
  // Ноутбуки
  else if (brandId === '5') { // Apple ноутбуки
    models = [
      { id: 11, brand_id: 5, category_id: 2, name: 'MacBook Pro 14"', description: 'Профессиональный ноутбук Apple', brand_name: 'Apple', category_name: 'Ноутбук' },
      { id: 12, brand_id: 5, category_id: 2, name: 'MacBook Air M2', description: 'Легкий ноутбук Apple', brand_name: 'Apple', category_name: 'Ноутбук' }
    ];
  } else if (brandId === '6') { // Lenovo ноутбуки
    models = [
      { id: 13, brand_id: 6, category_id: 2, name: 'ThinkPad X1', description: 'Бизнес ноутбук Lenovo', brand_name: 'Lenovo', category_name: 'Ноутбук' },
      { id: 14, brand_id: 6, category_id: 2, name: 'IdeaPad Gaming', description: 'Игровой ноутбук Lenovo', brand_name: 'Lenovo', category_name: 'Ноутбук' }
    ];
  } else if (brandId === '7') { // ASUS ноутбуки
    models = [
      { id: 15, brand_id: 7, category_id: 2, name: 'ROG Strix', description: 'Игровой ноутбук ASUS', brand_name: 'ASUS', category_name: 'Ноутбук' },
      { id: 16, brand_id: 7, category_id: 2, name: 'ZenBook Pro', description: 'Премиум ноутбук ASUS', brand_name: 'ASUS', category_name: 'Ноутбук' }
    ];
  } else if (brandId === '8') { // HP ноутбуки
    models = [
      { id: 17, brand_id: 8, category_id: 2, name: 'Pavilion Gaming', description: 'Игровой ноутбук HP', brand_name: 'HP', category_name: 'Ноутбук' },
      { id: 18, brand_id: 8, category_id: 2, name: 'EliteBook', description: 'Бизнес ноутбук HP', brand_name: 'HP', category_name: 'Ноутбук' }
    ];
  }
  // Бытовая техника
  else if (brandId === '9') { // Bosch бытовая техника
    models = [
      { id: 19, brand_id: 9, category_id: 3, name: 'Стиральная машина WAU', description: 'Стиральная машина Bosch', brand_name: 'Bosch', category_name: 'Бытовая техника' },
      { id: 20, brand_id: 9, category_id: 3, name: 'Холодильник KGN', description: 'Холодильник Bosch', brand_name: 'Bosch', category_name: 'Бытовая техника' },
      { id: 21, brand_id: 9, category_id: 3, name: 'Микроволновка HMT', description: 'Микроволновка Bosch', brand_name: 'Bosch', category_name: 'Бытовая техника' },
      { id: 22, brand_id: 9, category_id: 3, name: 'Посудомоечная машина SMS', description: 'Посудомоечная машина Bosch', brand_name: 'Bosch', category_name: 'Бытовая техника' }
    ];
  } else if (brandId === '10') { // Samsung бытовая техника
    models = [
      { id: 23, brand_id: 10, category_id: 3, name: 'Стиральная машина WW', description: 'Стиральная машина Samsung', brand_name: 'Samsung', category_name: 'Бытовая техника' },
      { id: 24, brand_id: 10, category_id: 3, name: 'Холодильник RF', description: 'Холодильник Samsung', brand_name: 'Samsung', category_name: 'Бытовая техника' },
      { id: 25, brand_id: 10, category_id: 3, name: 'Микроволновка MW', description: 'Микроволновка Samsung', brand_name: 'Samsung', category_name: 'Бытовая техника' },
      { id: 26, brand_id: 10, category_id: 3, name: 'Посудомоечная машина DW', description: 'Посудомоечная машина Samsung', brand_name: 'Samsung', category_name: 'Бытовая техника' }
    ];
  } else if (brandId === '11') { // LG бытовая техника
    models = [
      { id: 27, brand_id: 11, category_id: 3, name: 'Стиральная машина F', description: 'Стиральная машина LG', brand_name: 'LG', category_name: 'Бытовая техника' },
      { id: 28, brand_id: 11, category_id: 3, name: 'Холодильник GSL', description: 'Холодильник LG', brand_name: 'LG', category_name: 'Бытовая техника' },
      { id: 29, brand_id: 11, category_id: 3, name: 'Микроволновка MS', description: 'Микроволновка LG', brand_name: 'LG', category_name: 'Бытовая техника' },
      { id: 30, brand_id: 11, category_id: 3, name: 'Посудомоечная машина DF', description: 'Посудомоечная машина LG', brand_name: 'LG', category_name: 'Бытовая техника' }
    ];
  } else if (brandId === '12') { // Whirlpool бытовая техника
    models = [
      { id: 31, brand_id: 12, category_id: 3, name: 'Стиральная машина W', description: 'Стиральная машина Whirlpool', brand_name: 'Whirlpool', category_name: 'Бытовая техника' },
      { id: 32, brand_id: 12, category_id: 3, name: 'Холодильник W', description: 'Холодильник Whirlpool', brand_name: 'Whirlpool', category_name: 'Бытовая техника' },
      { id: 33, brand_id: 12, category_id: 3, name: 'Микроволновка W', description: 'Микроволновка Whirlpool', brand_name: 'Whirlpool', category_name: 'Бытовая техника' },
      { id: 34, brand_id: 12, category_id: 3, name: 'Посудомоечная машина W', description: 'Посудомоечная машина Whirlpool', brand_name: 'Whirlpool', category_name: 'Бытовая техника' }
    ];
  }
  // Телевизоры
  else if (brandId === '13') { // Samsung телевизоры
    models = [
      { id: 35, brand_id: 13, category_id: 4, name: 'QLED Q80C', description: 'Телевизор Samsung QLED', brand_name: 'Samsung', category_name: 'Телевизор' },
      { id: 36, brand_id: 13, category_id: 4, name: 'Neo QLED QN90C', description: 'Премиум телевизор Samsung', brand_name: 'Samsung', category_name: 'Телевизор' }
    ];
  } else if (brandId === '14') { // LG телевизоры
    models = [
      { id: 37, brand_id: 14, category_id: 4, name: 'OLED C3', description: 'OLED телевизор LG', brand_name: 'LG', category_name: 'Телевизор' },
      { id: 38, brand_id: 14, category_id: 4, name: 'NanoCell NANO', description: 'NanoCell телевизор LG', brand_name: 'LG', category_name: 'Телевизор' }
    ];
  } else if (brandId === '15') { // Sony телевизоры
    models = [
      { id: 39, brand_id: 15, category_id: 4, name: 'BRAVIA XR A95K', description: 'OLED телевизор Sony', brand_name: 'Sony', category_name: 'Телевизор' },
      { id: 40, brand_id: 15, category_id: 4, name: 'BRAVIA XR X95K', description: 'LED телевизор Sony', brand_name: 'Sony', category_name: 'Телевизор' }
    ];
  } else if (brandId === '16') { // TCL телевизоры
    models = [
      { id: 41, brand_id: 16, category_id: 4, name: 'C735 QLED', description: 'QLED телевизор TCL', brand_name: 'TCL', category_name: 'Телевизор' },
      { id: 42, brand_id: 16, category_id: 4, name: 'P635 LED', description: 'LED телевизор TCL', brand_name: 'TCL', category_name: 'Телевизор' }
    ];
  } else {
    // Если бренд не найден, показываем пустой список
    models = [];
  }
  
  res.json(models);
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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
