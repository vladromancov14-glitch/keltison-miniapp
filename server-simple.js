const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3006;

// Global store for instructions (in-memory)
let instructionsStore = [];

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Для обработки множественных файлов (медиа + фото шагов)
const uploadMultiple = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
}).fields([
  { name: 'media', maxCount: 10 },
  { name: 'step_0_photo', maxCount: 5 },
  { name: 'step_1_photo', maxCount: 5 },
  { name: 'step_2_photo', maxCount: 5 },
  { name: 'step_3_photo', maxCount: 5 },
  { name: 'step_4_photo', maxCount: 5 },
  { name: 'step_5_photo', maxCount: 5 },
  { name: 'step_6_photo', maxCount: 5 },
  { name: 'step_7_photo', maxCount: 5 },
  { name: 'step_8_photo', maxCount: 5 },
  { name: 'step_9_photo', maxCount: 5 }
]);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://telegram.org"],
      scriptSrc: ["'self'", "https://telegram.org"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.telegram.org"],
      frameSrc: ["'self'", "https://telegram.org"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      scriptSrcAttr: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  originAgentCluster: true
}));

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with no cache for development
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin panel route - отключаем CSP для админ-панели
app.get('/admin-instructions', (req, res) => {
  // Временно отключаем CSP для админ-панели
  res.set({
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-src 'self' https:;"
  });
  res.sendFile(path.join(__dirname, 'public', 'admin-instructions.html'));
});

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
        if (categoryId === '1') {
          if (brandId === '1') { // Apple телефоны
            models = [
              { id: 1, brand_id: 1, category_id: 1, name: 'iPhone 5', description: 'Классический iPhone 5', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 2, brand_id: 1, category_id: 1, name: 'iPhone 5c', description: 'iPhone 5c с цветным корпусом', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 3, brand_id: 1, category_id: 1, name: 'iPhone 5s', description: 'iPhone 5s с Touch ID', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 4, brand_id: 1, category_id: 1, name: 'iPhone 6', description: 'iPhone 6 с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 5, brand_id: 1, category_id: 1, name: 'iPhone 6 Plus', description: 'iPhone 6 Plus с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 6, brand_id: 1, category_id: 1, name: 'iPhone 6s', description: 'iPhone 6s с 3D Touch', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 7, brand_id: 1, category_id: 1, name: 'iPhone 6s Plus', description: 'iPhone 6s Plus с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 8, brand_id: 1, category_id: 1, name: 'iPhone SE (1st gen)', description: 'Компактный iPhone SE первого поколения', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 9, brand_id: 1, category_id: 1, name: 'iPhone 7', description: 'iPhone 7 без разъема для наушников', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 10, brand_id: 1, category_id: 1, name: 'iPhone 7 Plus', description: 'iPhone 7 Plus с двойной камерой', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 11, brand_id: 1, category_id: 1, name: 'iPhone 8', description: 'iPhone 8 с беспроводной зарядкой', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 12, brand_id: 1, category_id: 1, name: 'iPhone 8 Plus', description: 'iPhone 8 Plus с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 13, brand_id: 1, category_id: 1, name: 'iPhone X', description: 'iPhone X с Face ID', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 14, brand_id: 1, category_id: 1, name: 'iPhone XR', description: 'iPhone XR с Liquid Retina', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 15, brand_id: 1, category_id: 1, name: 'iPhone XS', description: 'iPhone XS с Super Retina', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 16, brand_id: 1, category_id: 1, name: 'iPhone XS Max', description: 'iPhone XS Max с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 17, brand_id: 1, category_id: 1, name: 'iPhone 11', description: 'iPhone 11 с двойной камерой', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 18, brand_id: 1, category_id: 1, name: 'iPhone 11 Pro', description: 'iPhone 11 Pro с тройной камерой', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 19, brand_id: 1, category_id: 1, name: 'iPhone 11 Pro Max', description: 'iPhone 11 Pro Max с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 20, brand_id: 1, category_id: 1, name: 'iPhone SE (2nd gen)', description: 'iPhone SE второго поколения', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 21, brand_id: 1, category_id: 1, name: 'iPhone 12 mini', description: 'iPhone 12 mini компактный', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 22, brand_id: 1, category_id: 1, name: 'iPhone 12', description: 'iPhone 12 с A14 Bionic', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 23, brand_id: 1, category_id: 1, name: 'iPhone 12 Pro', description: 'iPhone 12 Pro с LiDAR', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 24, brand_id: 1, category_id: 1, name: 'iPhone 12 Pro Max', description: 'iPhone 12 Pro Max с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 25, brand_id: 1, category_id: 1, name: 'iPhone 13 mini', description: 'iPhone 13 mini компактный', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 26, brand_id: 1, category_id: 1, name: 'iPhone 13', description: 'iPhone 13 с A15 Bionic', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 27, brand_id: 1, category_id: 1, name: 'iPhone 13 Pro', description: 'iPhone 13 Pro с ProMotion', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 28, brand_id: 1, category_id: 1, name: 'iPhone 13 Pro Max', description: 'iPhone 13 Pro Max с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 29, brand_id: 1, category_id: 1, name: 'iPhone SE (3rd gen)', description: 'iPhone SE третьего поколения', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 30, brand_id: 1, category_id: 1, name: 'iPhone 14', description: 'iPhone 14 с A15 Bionic', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 31, brand_id: 1, category_id: 1, name: 'iPhone 14 Plus', description: 'iPhone 14 Plus с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 32, brand_id: 1, category_id: 1, name: 'iPhone 14 Pro', description: 'iPhone 14 Pro с Dynamic Island', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 33, brand_id: 1, category_id: 1, name: 'iPhone 14 Pro Max', description: 'iPhone 14 Pro Max с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 34, brand_id: 1, category_id: 1, name: 'iPhone 15', description: 'iPhone 15 с USB-C', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 35, brand_id: 1, category_id: 1, name: 'iPhone 15 Plus', description: 'iPhone 15 Plus с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 36, brand_id: 1, category_id: 1, name: 'iPhone 15 Pro', description: 'iPhone 15 Pro с титановым корпусом', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 37, brand_id: 1, category_id: 1, name: 'iPhone 15 Pro Max', description: 'iPhone 15 Pro Max с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 38, brand_id: 1, category_id: 1, name: 'iPhone 16', description: 'iPhone 16 с A18 Bionic', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 39, brand_id: 1, category_id: 1, name: 'iPhone 16 Plus', description: 'iPhone 16 Plus с большим экраном', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 40, brand_id: 1, category_id: 1, name: 'iPhone 16 Pro', description: 'iPhone 16 Pro с улучшенной камерой', brand_name: 'Apple', category_name: 'Телефон' },
              { id: 41, brand_id: 1, category_id: 1, name: 'iPhone 16 Pro Max', description: 'iPhone 16 Pro Max с большим экраном', brand_name: 'Apple', category_name: 'Телефон' }
            ];
          } else if (brandId === '2') { // Samsung телефоны
            models = [
              { id: 42, brand_id: 2, category_id: 1, name: 'Galaxy S23', description: 'Флагманский смартфон Samsung', brand_name: 'Samsung', category_name: 'Телефон' },
              { id: 43, brand_id: 2, category_id: 1, name: 'Galaxy A54', description: 'Средний класс Samsung', brand_name: 'Samsung', category_name: 'Телефон' },
              { id: 44, brand_id: 2, category_id: 1, name: 'Galaxy Note', description: 'Samsung с S-Pen', brand_name: 'Samsung', category_name: 'Телефон' }
            ];
          } else if (brandId === '3') { // Xiaomi телефоны
            models = [
              { id: 45, brand_id: 3, category_id: 1, name: 'Redmi Note 12', description: 'Популярный смартфон Xiaomi', brand_name: 'Xiaomi', category_name: 'Телефон' },
              { id: 46, brand_id: 3, category_id: 1, name: 'Mi 13', description: 'Флагманский Xiaomi', brand_name: 'Xiaomi', category_name: 'Телефон' }
            ];
          } else if (brandId === '4') { // Huawei телефоны
            models = [
              { id: 47, brand_id: 4, category_id: 1, name: 'P60 Pro', description: 'Флагманский Huawei', brand_name: 'Huawei', category_name: 'Телефон' },
              { id: 48, brand_id: 4, category_id: 1, name: 'Nova 11', description: 'Средний класс Huawei', brand_name: 'Huawei', category_name: 'Телефон' }
            ];
    }
  }
  // Ноутбуки
  else if (categoryId === '2') {
    if (brandId === '5') { // Apple ноутбуки
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
  }
  // Стиральные машины
  else if (categoryId === '3') {
    if (brandId === '9') { // Bosch стиральные машины
      models = [
        { id: 19, brand_id: 9, category_id: 3, name: 'WAU28PH9', description: 'Стиральная машина Bosch', brand_name: 'Bosch', category_name: 'Стиральная машина' },
        { id: 20, brand_id: 9, category_id: 3, name: 'WAU28PH8', description: 'Стиральная машина Bosch', brand_name: 'Bosch', category_name: 'Стиральная машина' }
      ];
    } else if (brandId === '10') { // Samsung стиральные машины
      models = [
        { id: 21, brand_id: 10, category_id: 3, name: 'WW90T4540AE', description: 'Стиральная машина Samsung', brand_name: 'Samsung', category_name: 'Стиральная машина' },
        { id: 22, brand_id: 10, category_id: 3, name: 'WW80T4540AE', description: 'Стиральная машина Samsung', brand_name: 'Samsung', category_name: 'Стиральная машина' }
      ];
    } else if (brandId === '11') { // LG стиральные машины
      models = [
        { id: 23, brand_id: 11, category_id: 3, name: 'F4V909W4E', description: 'Стиральная машина LG', brand_name: 'LG', category_name: 'Стиральная машина' },
        { id: 24, brand_id: 11, category_id: 3, name: 'F4V909W4T', description: 'Стиральная машина LG', brand_name: 'LG', category_name: 'Стиральная машина' }
      ];
    } else if (brandId === '12') { // Whirlpool стиральные машины
      models = [
        { id: 25, brand_id: 12, category_id: 3, name: 'W7M849WH', description: 'Стиральная машина Whirlpool', brand_name: 'Whirlpool', category_name: 'Стиральная машина' },
        { id: 26, brand_id: 12, category_id: 3, name: 'W7M849WH', description: 'Стиральная машина Whirlpool', brand_name: 'Whirlpool', category_name: 'Стиральная машина' }
      ];
    }
  }
  // Холодильники
  else if (categoryId === '4') {
    if (brandId === '13') { // Bosch холодильники
      models = [
        { id: 27, brand_id: 13, category_id: 4, name: 'KGN39VLEA', description: 'Холодильник Bosch', brand_name: 'Bosch', category_name: 'Холодильник' },
        { id: 28, brand_id: 13, category_id: 4, name: 'KGN39VLEB', description: 'Холодильник Bosch', brand_name: 'Bosch', category_name: 'Холодильник' }
      ];
    } else if (brandId === '14') { // Samsung холодильники
      models = [
        { id: 29, brand_id: 14, category_id: 4, name: 'RF28K9070SG', description: 'Холодильник Samsung', brand_name: 'Samsung', category_name: 'Холодильник' },
        { id: 30, brand_id: 14, category_id: 4, name: 'RF28K9070SG', description: 'Холодильник Samsung', brand_name: 'Samsung', category_name: 'Холодильник' }
      ];
    } else if (brandId === '15') { // LG холодильники
      models = [
        { id: 31, brand_id: 15, category_id: 4, name: 'GSL760PZXV', description: 'Холодильник LG', brand_name: 'LG', category_name: 'Холодильник' },
        { id: 32, brand_id: 15, category_id: 4, name: 'GSL760PZXV', description: 'Холодильник LG', brand_name: 'LG', category_name: 'Холодильник' }
      ];
    } else if (brandId === '16') { // Whirlpool холодильники
      models = [
        { id: 33, brand_id: 16, category_id: 4, name: 'W7M849WH', description: 'Холодильник Whirlpool', brand_name: 'Whirlpool', category_name: 'Холодильник' },
        { id: 34, brand_id: 16, category_id: 4, name: 'W7M849WH', description: 'Холодильник Whirlpool', brand_name: 'Whirlpool', category_name: 'Холодильник' }
      ];
    }
  }
  // Микроволновки
  else if (categoryId === '5') {
    if (brandId === '17') { // Samsung микроволновки
      models = [
        { id: 35, brand_id: 17, category_id: 5, name: 'MW23K3515AS', description: 'Микроволновка Samsung', brand_name: 'Samsung', category_name: 'Микроволновка' },
        { id: 36, brand_id: 17, category_id: 5, name: 'MW23K3515AS', description: 'Микроволновка Samsung', brand_name: 'Samsung', category_name: 'Микроволновка' }
      ];
    } else if (brandId === '18') { // LG микроволновки
      models = [
        { id: 37, brand_id: 18, category_id: 5, name: 'MS2042DB', description: 'Микроволновка LG', brand_name: 'LG', category_name: 'Микроволновка' },
        { id: 38, brand_id: 18, category_id: 5, name: 'MS2042DB', description: 'Микроволновка LG', brand_name: 'LG', category_name: 'Микроволновка' }
      ];
    } else if (brandId === '19') { // Panasonic микроволновки
      models = [
        { id: 39, brand_id: 19, category_id: 5, name: 'NN-ST45KW', description: 'Микроволновка Panasonic', brand_name: 'Panasonic', category_name: 'Микроволновка' },
        { id: 40, brand_id: 19, category_id: 5, name: 'NN-ST45KW', description: 'Микроволновка Panasonic', brand_name: 'Panasonic', category_name: 'Микроволновка' }
      ];
    } else if (brandId === '20') { // Sharp микроволновки
      models = [
        { id: 41, brand_id: 20, category_id: 5, name: 'R-642INW', description: 'Микроволновка Sharp', brand_name: 'Sharp', category_name: 'Микроволновка' },
        { id: 42, brand_id: 20, category_id: 5, name: 'R-642INW', description: 'Микроволновка Sharp', brand_name: 'Sharp', category_name: 'Микроволновка' }
      ];
    }
  }
  // Посудомоечные машины
  else if (categoryId === '6') {
    if (brandId === '21') { // Bosch посудомоечные машины
      models = [
        { id: 43, brand_id: 21, category_id: 6, name: 'SMS46IW08E', description: 'Посудомоечная машина Bosch', brand_name: 'Bosch', category_name: 'Посудомоечная машина' },
        { id: 44, brand_id: 21, category_id: 6, name: 'SMS46IW08E', description: 'Посудомоечная машина Bosch', brand_name: 'Bosch', category_name: 'Посудомоечная машина' }
      ];
    } else if (brandId === '22') { // Siemens посудомоечные машины
      models = [
        { id: 45, brand_id: 22, category_id: 6, name: 'SN25I831TE', description: 'Посудомоечная машина Siemens', brand_name: 'Siemens', category_name: 'Посудомоечная машина' },
        { id: 46, brand_id: 22, category_id: 6, name: 'SN25I831TE', description: 'Посудомоечная машина Siemens', brand_name: 'Siemens', category_name: 'Посудомоечная машина' }
      ];
    } else if (brandId === '23') { // Electrolux посудомоечные машины
      models = [
        { id: 47, brand_id: 23, category_id: 6, name: 'ESF9452LOX', description: 'Посудомоечная машина Electrolux', brand_name: 'Electrolux', category_name: 'Посудомоечная машина' },
        { id: 48, brand_id: 23, category_id: 6, name: 'ESF9452LOX', description: 'Посудомоечная машина Electrolux', brand_name: 'Electrolux', category_name: 'Посудомоечная машина' }
      ];
    } else if (brandId === '24') { // Candy посудомоечные машины
      models = [
        { id: 49, brand_id: 24, category_id: 6, name: 'CDP 2L952 W', description: 'Посудомоечная машина Candy', brand_name: 'Candy', category_name: 'Посудомоечная машина' },
        { id: 50, brand_id: 24, category_id: 6, name: 'CDP 2L952 W', description: 'Посудомоечная машина Candy', brand_name: 'Candy', category_name: 'Посудомоечная машина' }
      ];
    }
  }
  // Телевизоры
  else if (categoryId === '7') {
    if (brandId === '25') { // Samsung телевизоры
      models = [
        { id: 51, brand_id: 25, category_id: 7, name: 'QLED Q80C', description: 'Телевизор Samsung QLED', brand_name: 'Samsung', category_name: 'Телевизор' },
        { id: 52, brand_id: 25, category_id: 7, name: 'Neo QLED QN90C', description: 'Премиум телевизор Samsung', brand_name: 'Samsung', category_name: 'Телевизор' }
      ];
    } else if (brandId === '26') { // LG телевизоры
      models = [
        { id: 53, brand_id: 26, category_id: 7, name: 'OLED C3', description: 'OLED телевизор LG', brand_name: 'LG', category_name: 'Телевизор' },
        { id: 54, brand_id: 26, category_id: 7, name: 'NanoCell NANO', description: 'NanoCell телевизор LG', brand_name: 'LG', category_name: 'Телевизор' }
      ];
    } else if (brandId === '27') { // Sony телевизоры
      models = [
        { id: 55, brand_id: 27, category_id: 7, name: 'BRAVIA XR A95K', description: 'OLED телевизор Sony', brand_name: 'Sony', category_name: 'Телевизор' },
        { id: 56, brand_id: 27, category_id: 7, name: 'BRAVIA XR X95K', description: 'LED телевизор Sony', brand_name: 'Sony', category_name: 'Телевизор' }
      ];
    } else if (brandId === '28') { // TCL телевизоры
      models = [
        { id: 57, brand_id: 28, category_id: 7, name: 'C735 QLED', description: 'QLED телевизор TCL', brand_name: 'TCL', category_name: 'Телевизор' },
        { id: 58, brand_id: 28, category_id: 7, name: 'P635 LED', description: 'LED телевизор TCL', brand_name: 'TCL', category_name: 'Телевизор' }
      ];
    }
  } else {
    // Если бренд не найден, показываем пустой список
    models = [];
  }
  
  res.json(models);
});

app.get('/api/problems', (req, res) => {
  const categoryId = req.query.category_id;
  
  const allProblems = [
    // Телефоны (category_id: 1)
    { id: 1, category_id: 1, name: 'Замена разъема Lightning', description: 'Не заряжается', severity: 'high' },
    { id: 2, category_id: 1, name: 'Замена дисплея', description: 'Разбит экран', severity: 'medium' },
    { id: 3, category_id: 1, name: 'Замена кнопок громкости', description: 'Не работают кнопки', severity: 'medium' },
    { id: 4, category_id: 1, name: 'Замена динамика', description: 'Нет звука', severity: 'medium' },
    { id: 5, category_id: 1, name: 'Замена аккумулятора', description: 'Быстро разряжается', severity: 'high' },
    { id: 6, category_id: 1, name: 'Прошивка', description: 'Проблемы с ПО', severity: 'medium' },
    { id: 7, category_id: 1, name: 'Разблокировка', description: 'Забыт пароль', severity: 'low' },
    
    // Ноутбуки (category_id: 2)
    { id: 8, category_id: 2, name: 'Замена клавиатуры', description: 'Не работают клавиши', severity: 'medium' },
    { id: 9, category_id: 2, name: 'Замена жёсткого диска или SSD', description: 'Проблемы с накопителем', severity: 'high' },
    { id: 10, category_id: 2, name: 'Перегрев', description: 'Сильно греется', severity: 'high' },
    { id: 11, category_id: 2, name: 'Замена экрана', description: 'Разбит дисплей', severity: 'critical' },
    { id: 12, category_id: 2, name: 'Перегрев (обслуживание)', description: 'Чистка системы охлаждения', severity: 'medium' },
    { id: 13, category_id: 2, name: 'Переустановка системы', description: 'Проблемы с ОС', severity: 'medium' },
    { id: 14, category_id: 2, name: 'Прошивка BIOS', description: 'Проблемы с BIOS', severity: 'critical' },
    { id: 15, category_id: 2, name: 'Проблемы со звуком', description: 'Нет звука', severity: 'medium' },
    { id: 16, category_id: 2, name: 'Установка драйверов', description: 'Проблемы с драйверами', severity: 'low' },
    { id: 17, category_id: 2, name: 'Не включается', description: 'Не запускается', severity: 'critical' },
    
    // Стиральные машины (category_id: 3)
    { id: 18, category_id: 3, name: 'Не открывается дверца', description: 'Дверца заблокирована', severity: 'high' },
    { id: 19, category_id: 3, name: 'Не нагревает воду', description: 'Холодная стирка', severity: 'medium' },
    { id: 20, category_id: 3, name: 'Не крутится барабан', description: 'Барабан не вращается', severity: 'high' },
    { id: 21, category_id: 3, name: 'Протекает вода', description: 'Утечка воды', severity: 'critical' },
    { id: 22, category_id: 3, name: 'Не включается', description: 'Не запускается', severity: 'critical' },
    { id: 23, category_id: 3, name: 'Ошибка на дисплее', description: 'Показывает ошибку', severity: 'medium' },
    
    // Холодильники (category_id: 4)
    { id: 24, category_id: 4, name: 'Не включается', description: 'Не запускается', severity: 'critical' },
    { id: 25, category_id: 4, name: 'Протекает вода', description: 'Утечка воды', severity: 'critical' },
    { id: 26, category_id: 4, name: 'Не работает морозилка', description: 'Не морозит', severity: 'critical' },
    { id: 27, category_id: 4, name: 'Ошибка на дисплее', description: 'Показывает ошибку', severity: 'medium' },
    { id: 28, category_id: 4, name: 'Не работает освещение', description: 'Не горит свет', severity: 'low' },
    { id: 29, category_id: 4, name: 'Не работает льдогенератор', description: 'Не делает лед', severity: 'medium' },
    
    // Микроволновки (category_id: 5)
    { id: 30, category_id: 5, name: 'Не греет', description: 'Не нагревает пищу', severity: 'high' },
    { id: 31, category_id: 5, name: 'Не крутится тарелка', description: 'Тарелка не вращается', severity: 'medium' },
    { id: 32, category_id: 5, name: 'Не включается', description: 'Не запускается', severity: 'critical' },
    { id: 33, category_id: 5, name: 'Искрит', description: 'Искры внутри', severity: 'critical' },
    { id: 34, category_id: 5, name: 'Шумит', description: 'Сильный шум', severity: 'medium' },
    
    // Посудомойки (category_id: 6)
    { id: 35, category_id: 6, name: 'Не моет посуду', description: 'Плохо моет', severity: 'high' },
    { id: 36, category_id: 6, name: 'Не сушит', description: 'Посуда мокрая', severity: 'medium' },
    { id: 37, category_id: 6, name: 'Протекает вода', description: 'Утечка воды', severity: 'critical' },
    { id: 38, category_id: 6, name: 'Не включается', description: 'Не запускается', severity: 'critical' },
    { id: 39, category_id: 6, name: 'Ошибка на дисплее', description: 'Показывает ошибку', severity: 'medium' },
    
    // Телевизоры (category_id: 7)
    { id: 40, category_id: 7, name: 'Нет изображения', description: 'Черный экран', severity: 'critical' },
    { id: 41, category_id: 7, name: 'Нет звука', description: 'Тишина', severity: 'medium' },
    { id: 42, category_id: 7, name: 'Не включается', description: 'Не запускается', severity: 'critical' },
    { id: 43, category_id: 7, name: 'Плохое качество изображения', description: 'Размытая картинка', severity: 'medium' },
    { id: 44, category_id: 7, name: 'Проблемы с пультом', description: 'Пульт не работает', severity: 'low' }
  ];
  
  // Фильтруем по категории если указана
  if (categoryId) {
    const filteredProblems = allProblems.filter(problem => problem.category_id === parseInt(categoryId));
    res.json(filteredProblems);
  } else {
    res.json(allProblems);
  }
});

app.get('/api/instructions', (req, res) => {
  const { model_id, problem_id, category_id } = req.query;
  
  let filteredInstructions = instructionsStore;
  
  if (model_id) {
    filteredInstructions = filteredInstructions.filter(inst => inst.model_id == model_id);
  }
  
  if (problem_id) {
    filteredInstructions = filteredInstructions.filter(inst => inst.problem_id == problem_id);
  }
  
  if (category_id) {
    filteredInstructions = filteredInstructions.filter(inst => inst.category_id == category_id);
  }
  
  res.json(filteredInstructions);
});

app.get('/api/instructions/:id', (req, res) => {
  const instructionId = parseInt(req.params.id);
  const instruction = instructionsStore.find(inst => inst.id === instructionId);
  
  if (!instruction) {
    return res.status(404).json({ error: 'Instruction not found' });
  }
  
  res.json(instruction);
});

app.get('/api/partners', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Сервисный центр "ТехноМастер"',
      address: 'ул. Ленина, 123, Москва',
      phone: '+7 (495) 123-45-67',
      rating: 4.8,
      services: ['Ремонт телефонов', 'Ремонт ноутбуков'],
      working_hours: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00'
    },
    {
      id: 2,
      name: 'Мастерская "Быстрый ремонт"',
      address: 'пр. Мира, 456, Москва',
      phone: '+7 (495) 234-56-78',
      rating: 4.5,
      services: ['Ремонт бытовой техники', 'Ремонт телевизоров'],
      working_hours: 'Пн-Вс: 8:00-20:00'
    }
  ]);
});

// API для магазинов запчастей по городам
app.get('/api/parts/stores', (req, res) => {
  const city = req.query.city;
  console.log('🔍 Запрос магазинов для города:', city);
  
  // Реальные города из сайтов магазинов
  const storesByCity = {
    // TAGGSM города
    'Адлер': [
      { id: 1, name: 'Taggsm', address: 'Адлер', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 2, name: 'GreenSpark', address: 'Адлер', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 3, name: 'Liberty', address: 'Адлер', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Армавир': [
      { id: 4, name: 'Taggsm', address: 'Армавир', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Архангельск': [
      { id: 5, name: 'Taggsm', address: 'Архангельск', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Астрахань': [
      { id: 6, name: 'Taggsm', address: 'Астрахань', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 7, name: 'GreenSpark', address: 'Астрахань', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Владивосток': [
      { id: 8, name: 'Taggsm', address: 'Владивосток', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Владикавказ': [
      { id: 9, name: 'Taggsm', address: 'Владикавказ', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 10, name: 'GreenSpark', address: 'Владикавказ', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Волгоград': [
      { id: 11, name: 'Taggsm', address: 'Волгоград', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 12, name: 'GreenSpark', address: 'Волгоград', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 13, name: 'Liberty', address: 'Волгоград', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Волгодонск': [
      { id: 14, name: 'Taggsm', address: 'Волгодонск', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 15, name: 'GreenSpark', address: 'Волгодонск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Геленджик': [
      { id: 16, name: 'Taggsm', address: 'Геленджик', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Грозный': [
      { id: 17, name: 'Taggsm', address: 'Грозный', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Калининград': [
      { id: 18, name: 'Taggsm', address: 'Калининград', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 19, name: 'GreenSpark', address: 'Калининград', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 20, name: 'Liberty', address: 'Калининград', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Краснодар': [
      { id: 21, name: 'Taggsm', address: 'Краснодар «Гавр.»', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 22, name: 'Taggsm', address: 'Краснодар «Ставр.»', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 23, name: 'GreenSpark', address: 'Краснодар', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 24, name: 'Liberty', address: 'Краснодар', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Мариуполь': [
      { id: 25, name: 'Taggsm', address: 'Мариуполь', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Мелитополь': [
      { id: 26, name: 'Taggsm', address: 'Мелитополь', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Москва': [
      { id: 27, name: 'Taggsm', address: 'Москва', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 28, name: 'GreenSpark', address: 'Москва', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 29, name: 'Liberty', address: 'Москва', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Мурманск': [
      { id: 36, name: 'Taggsm', address: 'Мурманск', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 37, name: 'GreenSpark', address: 'Мурманск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 38, name: 'Liberty', address: 'Мурманск', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Новороссийск': [
      { id: 39, name: 'Taggsm', address: 'Новороссийск', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 40, name: 'GreenSpark', address: 'Новороссийск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 41, name: 'Liberty', address: 'Новороссийск', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Ростов-на-Дону': [
      { id: 42, name: 'Taggsm', address: 'Ростов-на-Дону', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 43, name: 'GreenSpark', address: 'Ростов-на-Дону', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 44, name: 'Liberty', address: 'Ростов-на-Дону', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Самара': [
      { id: 45, name: 'Taggsm', address: 'Самара', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 46, name: 'GreenSpark', address: 'Самара', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 47, name: 'Liberty', address: 'Самара', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Санкт-Петербург': [
      { id: 48, name: 'Taggsm', address: 'Санкт-Петербург', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 49, name: 'GreenSpark', address: 'Санкт-Петербург', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 50, name: 'Liberty', address: 'Санкт-Петербург (Дыбенко)', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' },
      { id: 51, name: 'Liberty', address: 'Санкт-Петербург (Комендантский)', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' },
      { id: 52, name: 'Liberty', address: 'Санкт-Петербург (Московская)', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' },
      { id: 53, name: 'Liberty', address: 'Санкт-Петербург (Просвещение)', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' },
      { id: 54, name: 'Liberty', address: 'Санкт-Петербург (Садовая)', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' },
      { id: 55, name: 'Liberty', address: 'Санкт-Петербург (Юнона)', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Саратов': [
      { id: 56, name: 'Taggsm', address: 'Саратов', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 57, name: 'GreenSpark', address: 'Саратов', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 58, name: 'Liberty', address: 'Саратов', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Севастополь': [
      { id: 59, name: 'Taggsm', address: 'Севастополь', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Симферополь': [
      { id: 60, name: 'Taggsm', address: 'Симферополь', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 61, name: 'Liberty', address: 'Симферополь', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Сочи': [
      { id: 62, name: 'Taggsm', address: 'Сочи', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 63, name: 'GreenSpark', address: 'Сочи', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 64, name: 'Liberty', address: 'Сочи', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Ставрополь': [
      { id: 65, name: 'Taggsm', address: 'Ставрополь «Лерм.»', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 66, name: 'Taggsm', address: 'Ставрополь «Туха.»', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 67, name: 'GreenSpark', address: 'Ставрополь', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 68, name: 'Liberty', address: 'Ставрополь', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Сургут': [
      { id: 69, name: 'Taggsm', address: 'Сургут', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Сызрань': [
      { id: 70, name: 'Taggsm', address: 'Сызрань', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Таганрог': [
      { id: 71, name: 'Taggsm', address: 'Таганрог — «Централ. склад TAGGSM»', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    'Тольятти': [
      { id: 72, name: 'Taggsm', address: 'Тольятти', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 73, name: 'Liberty', address: 'Тольятти', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Улан-Удэ': [
      { id: 74, name: 'Taggsm', address: 'Улан-Удэ', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 75, name: 'GreenSpark', address: 'Улан-Удэ', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 76, name: 'Liberty', address: 'Улан-Удэ', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Ульяновск': [
      { id: 77, name: 'Taggsm', address: 'Ульяновск', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 78, name: 'GreenSpark', address: 'Ульяновск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 79, name: 'Liberty', address: 'Ульяновск', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Хабаровск': [
      { id: 80, name: 'Taggsm', address: 'Хабаровск', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 81, name: 'GreenSpark', address: 'Хабаровск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Челябинск': [
      { id: 82, name: 'Taggsm', address: 'Челябинск', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 83, name: 'GreenSpark', address: 'Челябинск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 84, name: 'Liberty', address: 'Челябинск', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Чита': [
      { id: 85, name: 'Taggsm', address: 'Чита', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' },
      { id: 86, name: 'GreenSpark', address: 'Чита', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Южно-Сахалинск': [
      { id: 87, name: 'Taggsm', address: 'Южно-Сахалинск', phone: '+7 (909) 420-29-40', website: 'https://taggsm.ru' }
    ],
    
    // Дополнительные города GreenSpark
    'Абакан': [
      { id: 88, name: 'GreenSpark', address: 'Абакан', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Барнаул': [
      { id: 89, name: 'GreenSpark', address: 'Барнаул', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Белгород': [
      { id: 90, name: 'GreenSpark', address: 'Белгород', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Брянск': [
      { id: 91, name: 'GreenSpark', address: 'Брянск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Вологда': [
      { id: 92, name: 'GreenSpark', address: 'Вологда', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Воронеж': [
      { id: 93, name: 'GreenSpark', address: 'Воронеж', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 94, name: 'Liberty', address: 'Воронеж', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Екатеринбург': [
      { id: 95, name: 'GreenSpark', address: 'Екатеринбург', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 96, name: 'Liberty', address: 'Екатеринбург', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' },
      { id: 97, name: 'Liberty', address: 'Екатеринбург Север', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Иваново': [
      { id: 98, name: 'GreenSpark', address: 'Иваново', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Иркутск': [
      { id: 99, name: 'GreenSpark', address: 'Иркутск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Йошкар-Ола': [
      { id: 100, name: 'GreenSpark', address: 'Йошкар-Ола', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Казань': [
      { id: 101, name: 'GreenSpark', address: 'Казань', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 102, name: 'Liberty', address: 'Казань', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Каменск-Шахтинский': [
      { id: 103, name: 'GreenSpark', address: 'Каменск-Шахтинский', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Киров': [
      { id: 104, name: 'GreenSpark', address: 'Киров', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 105, name: 'Liberty', address: 'Киров', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Комсомольск-на-Амуре': [
      { id: 106, name: 'GreenSpark', address: 'Комсомольск-на-Амуре', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Кострома': [
      { id: 107, name: 'GreenSpark', address: 'Кострома', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Курск': [
      { id: 108, name: 'GreenSpark', address: 'Курск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 109, name: 'Liberty', address: 'Курск', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Лесной': [
      { id: 110, name: 'GreenSpark', address: 'Лесной', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Липецк': [
      { id: 111, name: 'GreenSpark', address: 'Липецк', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 112, name: 'Liberty', address: 'Липецк', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Магнитогорск': [
      { id: 113, name: 'GreenSpark', address: 'Магнитогорск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 114, name: 'Liberty', address: 'Магнитогорск', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Майкоп': [
      { id: 115, name: 'GreenSpark', address: 'Майкоп', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Набережные Челны': [
      { id: 116, name: 'GreenSpark', address: 'Набережные Челны', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 117, name: 'Liberty', address: 'Набережные Челны', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Нефтекамск': [
      { id: 118, name: 'GreenSpark', address: 'Нефтекамск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Нижний Тагил': [
      { id: 119, name: 'GreenSpark', address: 'Нижний Тагил', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Ноябрьск': [
      { id: 120, name: 'GreenSpark', address: 'Ноябрьск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Оренбург': [
      { id: 121, name: 'GreenSpark', address: 'Оренбург', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 122, name: 'Liberty', address: 'Оренбург', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Орск': [
      { id: 123, name: 'GreenSpark', address: 'Орск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Пенза': [
      { id: 124, name: 'GreenSpark', address: 'Пенза', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 125, name: 'Liberty', address: 'Пенза', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Пермь': [
      { id: 126, name: 'GreenSpark', address: 'Пермь', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 127, name: 'Liberty', address: 'Пермь', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Подольск': [
      { id: 128, name: 'GreenSpark', address: 'Подольск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Псков': [
      { id: 129, name: 'GreenSpark', address: 'Псков', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Россошь': [
      { id: 130, name: 'GreenSpark', address: 'Россошь', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Рубцовск': [
      { id: 131, name: 'GreenSpark', address: 'Рубцовск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Рязань': [
      { id: 132, name: 'GreenSpark', address: 'Рязань', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 133, name: 'Liberty', address: 'Рязань', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Саранск': [
      { id: 134, name: 'GreenSpark', address: 'Саранск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Смоленск': [
      { id: 135, name: 'GreenSpark', address: 'Смоленск', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Старый Оскол': [
      { id: 136, name: 'GreenSpark', address: 'Старый Оскол', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Стерлитамак': [
      { id: 137, name: 'GreenSpark', address: 'Стерлитамак', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Сыктывкар': [
      { id: 138, name: 'GreenSpark', address: 'Сыктывкар', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Тамбов': [
      { id: 139, name: 'GreenSpark', address: 'Тамбов', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Тверь': [
      { id: 140, name: 'GreenSpark', address: 'Тверь', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 141, name: 'Liberty', address: 'Тверь', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Тула': [
      { id: 142, name: 'GreenSpark', address: 'Тула', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 143, name: 'Liberty', address: 'Тула', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Тюмень': [
      { id: 144, name: 'GreenSpark', address: 'Тюмень', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 145, name: 'Liberty', address: 'Тюмень', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Уфа': [
      { id: 146, name: 'GreenSpark', address: 'Уфа', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 147, name: 'Liberty', address: 'Уфа', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Ухта': [
      { id: 148, name: 'GreenSpark', address: 'Ухта', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Чебоксары': [
      { id: 149, name: 'GreenSpark', address: 'Чебоксары', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 150, name: 'Liberty', address: 'Чебоксары', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Череповец': [
      { id: 151, name: 'GreenSpark', address: 'Череповец', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' }
    ],
    'Ярославль': [
      { id: 152, name: 'GreenSpark', address: 'Ярославль', phone: '+7 (800) 700-29-40', website: 'https://green-spark.ru' },
      { id: 153, name: 'Liberty', address: 'Ярославль', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    
    // Дополнительные города Liberty
    'Великий Новгород': [
      { id: 154, name: 'Liberty', address: 'Великий Новгород', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Владимир': [
      { id: 155, name: 'Liberty', address: 'Владимир', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Ижевск': [
      { id: 156, name: 'Liberty', address: 'Ижевск', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Махачкала': [
      { id: 157, name: 'Liberty', address: 'Махачкала', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Новосибирск': [
      { id: 158, name: 'Liberty', address: 'Новосибирск', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ],
    'Омск': [
      { id: 159, name: 'Liberty', address: 'Омск', phone: '+7 (800) 700-29-40', website: 'https://liberti.ru' }
    ]
  };
  
  if (city && storesByCity[city]) {
    console.log('✅ Найдены магазины для города:', city, 'количество:', storesByCity[city].length);
    res.json(storesByCity[city]);
  } else {
    console.log('❌ Город не найден:', city, 'возвращаем маркетплейсы');
    // Если город не найден, возвращаем маркетплейсы
    res.json([
      { id: 160, name: 'Wildberries', address: 'Онлайн', phone: '8-800-555-55-55', website: 'https://wildberries.ru' },
      { id: 161, name: 'Ozon', address: 'Онлайн', phone: '8-800-234-55-55', website: 'https://ozon.ru' }
    ]);
  }
});

// WebApp initialization endpoint
app.post('/api/auth/webapp-init', (req, res) => {
  const { initData } = req.body;
  
  // Простая авторизация для демонстрации
  const mockUser = {
    id: 12345,
    first_name: 'Тестовый',
    last_name: 'Пользователь',
    username: 'testuser',
    is_premium: false
  };
  
  // Генерируем простой токен
  const token = 'mock_token_' + Date.now();
  
  res.json({
    success: true,
    token: token,
    user: mockUser
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: 'development',
    mode: 'simple (no database)'
  });
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Admin API endpoints
app.get('/api/admin/instructions', (req, res) => {
  res.json(instructionsStore);
});

app.post('/api/admin/instructions', uploadMultiple, (req, res) => {
  try {
    const steps = JSON.parse(req.body.steps || '[]');
    
    // Обрабатываем фото для шагов
    steps.forEach((step, index) => {
      const stepPhotos = req.files[`step_${index}_photo`] || [];
      step.photos = stepPhotos.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`
      }));
    });
    
    const newInstruction = {
      id: instructionsStore.length + 1,
      ...req.body,
      steps: steps,
      tools: JSON.parse(req.body.tools || '[]'),
      parts_required: JSON.parse(req.body.parts_required || '[]'),
      media: req.files.media ? req.files.media.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`
      })) : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    instructionsStore.push(newInstruction);
    res.json(newInstruction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/instructions/:id', upload.array('media', 10), (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = instructionsStore.findIndex(inst => inst.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Instruction not found' });
    }
    
    const existingMedia = instructionsStore[index].media || [];
    const newMedia = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    })) : [];
    
    instructionsStore[index] = {
      ...instructionsStore[index],
      ...req.body,
      steps: JSON.parse(req.body.steps || '[]'),
      tools: JSON.parse(req.body.tools || '[]'),
      parts_required: JSON.parse(req.body.parts_required || '[]'),
      media: [...existingMedia, ...newMedia],
      updated_at: new Date().toISOString()
    };
    
    res.json(instructionsStore[index]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/instructions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = instructionsStore.findIndex(inst => inst.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Instruction not found' });
  }
  
  instructionsStore.splice(index, 1);
  res.json({ message: 'Instruction deleted' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KЁLTISON Mini App server running on port ${PORT}`);
  console.log(`📱 WebApp URL: ${process.env.WEBAPP_URL || `http://localhost:${PORT}`}`);
  console.log(`🔧 Admin Panel: ${process.env.WEBAPP_URL || `http://localhost:${PORT}`}/admin`);
  console.log(`❤️ Health Check: ${process.env.WEBAPP_URL || `http://localhost:${PORT}`}/health`);
  console.log(`🎯 Mode: Simple (mock data, no database)`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔧 Development mode enabled`);
  }
});
