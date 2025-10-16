const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

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
  res.json([
    { id: 1, category_id: 1, name: 'Не заряжается', description: 'Устройство не реагирует на подключение зарядки', severity: 'high' },
    { id: 2, category_id: 1, name: 'Разбит экран', description: 'Треснул или разбит дисплей устройства', severity: 'medium' },
    { id: 3, category_id: 2, name: 'Не включается', description: 'Ноутбук не запускается при нажатии кнопки питания', severity: 'critical' },
    { id: 4, category_id: 3, name: 'Не стирает', description: 'Стиральная машина не выполняет цикл стирки', severity: 'high' },
    { id: 5, category_id: 3, name: 'Не отжимает', description: 'Стиральная машина не отжимает белье', severity: 'medium' },
    { id: 6, category_id: 4, name: 'Не охлаждает', description: 'Холодильник не поддерживает нужную температуру', severity: 'critical' },
    { id: 7, category_id: 4, name: 'Шумит', description: 'Холодильник издает посторонние звуки', severity: 'low' },
    { id: 8, category_id: 5, name: 'Не греет', description: 'Микроволновка не нагревает пищу', severity: 'high' },
    { id: 9, category_id: 5, name: 'Не крутится тарелка', description: 'Тарелка в микроволновке не вращается', severity: 'medium' },
    { id: 10, category_id: 6, name: 'Не моет посуду', description: 'Посудомоечная машина не очищает посуду', severity: 'high' },
    { id: 11, category_id: 6, name: 'Не сушит', description: 'Посудомоечная машина не сушит посуду', severity: 'medium' },
    { id: 12, category_id: 7, name: 'Нет изображения', description: 'Телевизор не показывает картинку', severity: 'critical' },
    { id: 13, category_id: 7, name: 'Нет звука', description: 'Телевизор не воспроизводит звук', severity: 'medium' }
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
      problem_name: 'Не заряжается',
      brand_name: 'Apple',
      category_name: 'Телефон'
    },
    {
      id: 2,
      model_id: 19,
      problem_id: 4,
      title: 'Замена помпы стиральной машины',
      description: 'Инструкция по замене сливной помпы Bosch WAU28PH9',
      difficulty: 'medium',
      estimated_time: '30-45 минут',
      tools_required: ['Отвертка крестовая', 'Плоскогубцы'],
      parts_required: ['Помпа сливная Bosch'],
      cost_estimate: 2500.00,
      is_pro_pretent: true,
      model_name: 'WAU28PH9',
      problem_name: 'Не стирает',
      brand_name: 'Bosch',
      category_name: 'Стиральная машина'
    }
  ]);
});

app.get('/api/instructions/:id', (req, res) => {
  const instructionId = req.params.id;
  
  // Простая логика для демонстрации
  if (instructionId === '1') {
    res.json({
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
      problem_name: 'Не заряжается',
      brand_name: 'Apple',
      category_name: 'Телефон',
      steps: [
        {
          step_number: 1,
          title: 'Отключение устройства',
          description: 'Полностью выключите iPhone и отсоедините все кабели',
          image_url: null,
          estimated_time: '2 минуты'
        },
        {
          step_number: 2,
          title: 'Снятие экрана',
          description: 'Используйте присоску для экрана и осторожно поднимите дисплей',
          image_url: null,
          estimated_time: '10 минут'
        },
        {
          step_number: 3,
          title: 'Замена разъема',
          description: 'Отсоедините старый разъем и установите новый',
          image_url: null,
          estimated_time: '30 минут'
        }
      ]
    });
  } else {
    res.status(404).json({ error: 'Инструкция не найдена' });
  }
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
