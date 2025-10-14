# 🔌 KЁLTISON Mini App API Documentation

Полная документация API для разработчиков.

## 🌐 Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## 🔐 Аутентификация

### Telegram WebApp Init

Инициализация пользователя через Telegram WebApp API.

```http
POST /api/auth/webapp-init
Content-Type: application/json

{
  "initData": "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1662771648&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "telegram_id": 279058397,
    "username": "vdkfrost",
    "first_name": "Vladislav",
    "last_name": "Kibenko",
    "is_admin": false,
    "is_premium": false
  },
  "subscription": {
    "plan": "free",
    "status": "active"
  }
}
```

### Получение профиля

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "telegram_id": 279058397,
    "username": "vdkfrost",
    "first_name": "Vladislav",
    "last_name": "Kibenko",
    "is_admin": false,
    "is_premium": false
  },
  "subscription": {
    "plan": "free",
    "status": "active"
  }
}
```

## 📂 Публичные API

### Категории устройств

```http
GET /api/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Телефон",
    "icon": "📱",
    "description": "Смартфоны и мобильные устройства"
  },
  {
    "id": 2,
    "name": "Ноутбук",
    "icon": "💻",
    "description": "Ноутбуки и планшеты"
  }
]
```

### Бренды

```http
GET /api/brands?category_id=1
```

**Parameters:**
- `category_id` (optional) - ID категории для фильтрации

**Response:**
```json
[
  {
    "id": 1,
    "name": "Apple",
    "logo_url": "https://logo.clearbit.com/apple.com",
    "website": "https://apple.com"
  },
  {
    "id": 2,
    "name": "Samsung",
    "logo_url": "https://logo.clearbit.com/samsung.com",
    "website": "https://samsung.com"
  }
]
```

### Модели устройств

```http
GET /api/models?brand_id=1&category_id=1
```

**Parameters:**
- `brand_id` (optional) - ID бренда
- `category_id` (optional) - ID категории

**Response:**
```json
[
  {
    "id": 1,
    "brand_id": 1,
    "category_id": 1,
    "name": "iPhone 14",
    "description": "Флагманский смартфон Apple",
    "image_url": "https://example.com/iphone14.jpg",
    "brand_name": "Apple",
    "category_name": "Телефон"
  }
]
```

### Проблемы

```http
GET /api/problems?category_id=1
```

**Parameters:**
- `category_id` (optional) - ID категории для фильтрации

**Response:**
```json
[
  {
    "id": 1,
    "category_id": 1,
    "name": "Не заряжается",
    "description": "Устройство не реагирует на подключение зарядки",
    "severity": "high"
  }
]
```

### Инструкции

```http
GET /api/instructions?model_id=1&problem_id=1
```

**Parameters:**
- `model_id` (required) - ID модели устройства
- `problem_id` (required) - ID проблемы

**Response:**
```json
[
  {
    "id": 1,
    "model_id": 1,
    "problem_id": 1,
    "title": "Замена разъема Lightning",
    "description": "Пошаговая инструкция по замене разъема зарядки iPhone 14",
    "difficulty": "hard",
    "estimated_time": "1-2 часа",
    "tools_required": ["Отвертка P2 Pentalobe", "Присоска для экрана"],
    "parts_required": ["Разъем Lightning", "Клей для экрана"],
    "cost_estimate": 1500.00,
    "is_pro_pretent": false,
    "steps": [
      {
        "step": 1,
        "title": "Отключение устройства",
        "description": "Полностью выключите iPhone и убедитесь, что он разряжен",
        "image": "https://example.com/step1.jpg"
      }
    ],
    "images": ["https://example.com/instruction1.jpg"],
    "videos": ["https://example.com/instruction-video.mp4"],
    "model_name": "iPhone 14",
    "brand_name": "Apple",
    "problem_name": "Не заряжается"
  }
]
```

### Детальная инструкция

```http
GET /api/instructions/1
Authorization: Bearer <token>
```

**Response (Free пользователь):**
```json
{
  "id": 1,
  "title": "Замена разъема Lightning",
  "description": "Пошаговая инструкция по замене разъема зарядки iPhone 14",
  "difficulty": "hard",
  "estimated_time": "1-2 часа",
  "tools_required": ["Отвертка P2 Pentalobe", "Присоска для экрана"],
  "parts_required": ["Разъем Lightning", "Клей для экрана"],
  "cost_estimate": 1500.00,
  "is_pro_pretent": false,
  "steps": [
    {
      "step": 1,
      "title": "Отключение устройства",
      "description": "Полностью выключите iPhone и убедитесь, что он разряжен",
      "image": "https://example.com/step1.jpg"
    }
  ],
  "images": ["https://example.com/instruction1.jpg"],
  "videos": ["https://example.com/instruction-video.mp4"],
  "model_name": "iPhone 14",
  "brand_name": "Apple",
  "problem_name": "Не заряжается"
}
```

**Response (PRO контент для Free пользователя):**
```json
{
  "error": "PRO subscription required",
  "upgrade_url": "/upgrade",
  "preview": {
    "title": "Замена разъема Lightning",
    "description": "Пошаговая инструкция по замене разъема зарядки iPhone 14",
    "difficulty": "hard",
    "estimated_time": "1-2 часа"
  }
}
```

### Партнеры

```http
GET /api/partners
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "iFixit",
    "website": "https://ru.ifixit.com",
    "logo_url": "https://logo.clearbit.com/ifixit.com",
    "description": "Оригинальные запчасти и инструменты для ремонта электроники",
    "is_active": true
  }
]
```

### Поиск

```http
GET /api/search?q=iphone&category_id=1
```

**Parameters:**
- `q` (required) - Поисковый запрос
- `category_id` (optional) - ID категории для фильтрации

**Response:**
```json
[
  {
    "id": 1,
    "title": "Замена разъема Lightning",
    "description": "Пошаговая инструкция по замене разъема зарядки iPhone 14",
    "model_name": "iPhone 14",
    "brand_name": "Apple",
    "problem_name": "Не заряжается",
    "difficulty": "hard",
    "estimated_time": "1-2 часа"
  }
]
```

## 🤖 ИИ-ассистент

### Чат с ИИ-мастером

```http
POST /api/assistant/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Не заряжается iPhone 14",
  "session_id": "optional-session-id"
}
```

**Response:**
```json
{
  "session_id": "uuid-session-id",
  "response": "🧰 Мастер КЁЛТИСОН:\n\nНашел инструкцию для Apple iPhone 14:\n\n📋 Замена разъема Lightning\n⏱️ Время: 1-2 часа\n🔧 Сложность: Сложно\n💰 Примерная стоимость: 1500 руб.\n\n👉 [Открыть инструкцию]",
  "metadata": {
    "context": {
      "device_type": "phone",
      "problem": "не заряжается",
      "brand": "apple",
      "urgency": "medium",
      "needsProFeatures": false
    },
    "instructions_found": 1,
    "has_pro_access": false
  },
  "suggestions": [
    "Показать все инструкции для телефонов",
    "Найти решение для \"не заряжается\"",
    "Где купить запчасти"
  ]
}
```

### История чата

```http
GET /api/assistant/chat/{session_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "session_id": "uuid-session-id",
  "messages": [
    {
      "id": 1,
      "session_id": "uuid-session-id",
      "message": "Не заряжается iPhone 14",
      "is_user": true,
      "metadata": null,
      "created_at": "2024-01-01T12:00:00.000Z"
    },
    {
      "id": 2,
      "session_id": "uuid-session-id",
      "message": "🧰 Мастер КЁЛТИСОН:\n\nНашел инструкцию...",
      "is_user": false,
      "metadata": {
        "context": {...},
        "instructions_found": 1
      },
      "created_at": "2024-01-01T12:00:01.000Z"
    }
  ]
}
```

### Список сессий пользователя

```http
GET /api/assistant/sessions
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "session_id": "uuid-session-id",
    "context": {},
    "last_message": "Не заряжается iPhone 14",
    "last_message_at": "2024-01-01T12:00:01.000Z",
    "created_at": "2024-01-01T12:00:00.000Z"
  }
]
```

## 👨‍💼 Админ API

Все админ API требуют аутентификации и прав администратора.

### Аутентификация администратора

```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "is_admin": true
  }
}
```

### Статистика

```http
GET /api/admin/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "users": 150,
  "categories": 4,
  "brands": 25,
  "models": 180,
  "problems": 45,
  "instructions": 320,
  "partners": 8
}
```

### CRUD операции

#### Категории

```http
# Получить все категории
GET /api/admin/categories
Authorization: Bearer <admin-token>

# Создать категорию
POST /api/admin/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Игровые консоли",
  "icon": "🎮",
  "description": "PlayStation, Xbox, Nintendo Switch"
}

# Обновить категорию
PUT /api/admin/categories/5
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Игровые консоли",
  "icon": "🎮",
  "description": "PlayStation, Xbox, Nintendo Switch"
}

# Удалить категорию
DELETE /api/admin/categories/5
Authorization: Bearer <admin-token>
```

#### Бренды

```http
# Получить все бренды
GET /api/admin/brands
Authorization: Bearer <admin-token>

# Создать бренд
POST /api/admin/brands
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Sony",
  "logo_url": "https://logo.clearbit.com/sony.com",
  "website": "https://sony.com"
}
```

#### Модели

```http
# Получить все модели
GET /api/admin/models
Authorization: Bearer <admin-token>

# Создать модель
POST /api/admin/models
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "brand_id": 3,
  "category_id": 1,
  "name": "PlayStation 5",
  "description": "Игровая консоль Sony",
  "image_url": "https://example.com/ps5.jpg"
}
```

#### Проблемы

```http
# Получить все проблемы
GET /api/admin/problems
Authorization: Bearer <admin-token>

# Создать проблему
POST /api/admin/problems
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "category_id": 5,
  "name": "Не включается",
  "description": "Консоль не запускается при нажатии кнопки питания",
  "severity": "high"
}
```

#### Инструкции

```http
# Получить все инструкции
GET /api/admin/instructions
Authorization: Bearer <admin-token>

# Создать инструкцию
POST /api/admin/instructions
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

{
  "model_id": 15,
  "problem_id": 8,
  "title": "Замена жесткого диска PS5",
  "description": "Пошаговая инструкция по замене SSD",
  "difficulty": "medium",
  "estimated_time": "30-60 минут",
  "tools_required": ["Отвертка Phillips", "Пластиковая лопатка"],
  "parts_required": ["M.2 SSD", "Винты"],
  "cost_estimate": 8000.00,
  "is_pro_pretent": false,
  "steps": "[{\"step\": 1, \"title\": \"Отключение питания\", \"description\": \"Отключите консоль от сети\"}]",
  "files": [file1, file2]
}
```

#### Партнеры

```http
# Получить всех партнеров
GET /api/admin/partners
Authorization: Bearer <admin-token>

# Создать партнера
POST /api/admin/partners
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "DNS",
  "website": "https://dns-shop.ru",
  "logo_url": "https://logo.clearbit.com/dns-shop.ru",
  "description": "Российский магазин электроники",
  "is_active": true
}
```

## 📊 Коды ответов

### Успешные ответы

- `200 OK` - Успешный запрос
- `201 Created` - Ресурс создан
- `204 No Content` - Успешный запрос без содержимого

### Ошибки клиента

- `400 Bad Request` - Некорректный запрос
- `401 Unauthorized` - Требуется аутентификация
- `403 Forbidden` - Недостаточно прав доступа
- `404 Not Found` - Ресурс не найден
- `422 Unprocessable Entity` - Ошибка валидации данных

### Ошибки сервера

- `500 Internal Server Error` - Внутренняя ошибка сервера
- `502 Bad Gateway` - Ошибка прокси-сервера
- `503 Service Unavailable` - Сервис недоступен

## 🔒 Безопасность

### Rate Limiting

- **API endpoints**: 10 запросов в секунду
- **Admin endpoints**: 5 запросов в секунду
- **Chat API**: 3 запроса в секунду

### CORS

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

### Валидация данных

Все входящие данные валидируются:

- **Email**: RFC 5322
- **URL**: RFC 3986
- **File uploads**: MIME type, размер файла
- **JSON**: Схема валидации

## 📝 Примеры использования

### JavaScript (Fetch API)

```javascript
// Инициализация пользователя
const initUser = async (initData) => {
  const response = await fetch('/api/auth/webapp-init', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ initData })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  }
  throw new Error('Failed to initialize user');
};

// Получение категорий
const getCategories = async () => {
  const response = await fetch('/api/categories');
  return await response.json();
};

// Чат с ИИ
const chatWithAI = async (message, token) => {
  const response = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message })
  });
  
  return await response.json();
};
```

### Python (requests)

```python
import requests

# Инициализация пользователя
def init_user(init_data):
    response = requests.post('/api/auth/webapp-init', json={'initData': init_data})
    response.raise_for_status()
    return response.json()

# Получение инструкций
def get_instructions(model_id, problem_id):
    response = requests.get('/api/instructions', params={
        'model_id': model_id,
        'problem_id': problem_id
    })
    response.raise_for_status()
    return response.json()

# Чат с ИИ
def chat_with_ai(message, token):
    response = requests.post('/api/assistant/chat', 
        headers={'Authorization': f'Bearer {token}'},
        json={'message': message}
    )
    response.raise_for_status()
    return response.json()
```

### cURL

```bash
# Получение категорий
curl -X GET "https://your-domain.com/api/categories"

# Инициализация пользователя
curl -X POST "https://your-domain.com/api/auth/webapp-init" \
  -H "Content-Type: application/json" \
  -d '{"initData": "query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=..."}'

# Чат с ИИ
curl -X POST "https://your-domain.com/api/assistant/chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Не заряжается iPhone"}'
```

## 🔄 Webhooks

### Telegram Webhook (планируется)

```http
POST /api/webhooks/telegram
Content-Type: application/json

{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 279058397,
      "is_bot": false,
      "first_name": "Vladislav",
      "username": "vdkfrost"
    },
    "chat": {
      "id": 279058397,
      "first_name": "Vladislav",
      "type": "private"
    },
    "date": 1662771648,
    "text": "/start"
  }
}
```

---

**API документация обновлена**: 2024-01-01  
**Версия API**: 1.0.0
