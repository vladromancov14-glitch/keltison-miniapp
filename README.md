# 🔧 KЁLTISON Mini App

Полноценное Telegram Mini App для ремонта устройств с ИИ-помощником, админ-панелью и PRO-подпиской.

## 🌟 Особенности

- **📱 Telegram WebApp** - Нативный интерфейс в Telegram
- **🤖 ИИ-мастер** - Персональный помощник по ремонту
- **👨‍💼 Админ-панель** - Полный CRUD для управления контентом
- **💎 PRO-подписка** - Расширенные инструкции и консультации
- **🗄️ PostgreSQL** - Надежная база данных
- **🐳 Docker** - Простой деплой
- **🔒 Безопасность** - JWT аутентификация и валидация

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Telegram Bot  │    │   WebApp UI     │    │   Admin Panel   │
│                 │    │                 │    │                 │
│  - /start       │    │  - Categories   │    │  - CRUD Ops     │
│  - WebApp btn   │    │  - Instructions │    │  - File Upload  │
│  - Commands     │    │  - AI Chat      │    │  - Analytics    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Express API   │
                    │                 │
                    │  - /api/auth    │
                    │  - /api/admin   │
                    │  - /api/assistant│
                    │  - /api/*       │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │                 │
                    │  - Users        │
                    │  - Instructions │
                    │  - AI Sessions  │
                    │  - Subscriptions│
                    └─────────────────┘
```

## 🚀 Быстрый старт

### 1. Клонирование и настройка

```bash
git clone <repository-url>
cd keltison-miniapp

# Скопируйте и настройте переменные окружения
cp env.example .env
```

### 2. Настройка .env файла

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=keltison_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token-here
WEBAPP_URL=https://your-domain.com

# OpenAI Configuration (optional)
OPENAI_API_KEY=your-openai-api-key-here

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 3. Установка зависимостей

```bash
npm install
```

### 4. Настройка базы данных

```bash
# Создайте базу данных PostgreSQL
createdb keltison_db

# Импортируйте схему
psql keltison_db < database/keltison_schema.sql

# Импортируйте тестовые данные (опционально)
node scripts/import-sample-data.js
```

### 5. Запуск приложения

```bash
# Режим разработки
npm run dev

# Продакшн режим
npm start
```

## 🐳 Docker деплой

### Быстрый деплой с Docker Compose

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd keltison-miniapp

# Настройте .env файл
cp env.example .env
# Отредактируйте .env файл

# Запустите все сервисы
docker-compose up -d

# Проверьте статус
docker-compose ps
```

### Ручной деплой

```bash
# Соберите образ
docker build -t keltison-miniapp .

# Запустите контейнер
docker run -d \
  --name keltison-app \
  -p 3000:3000 \
  --env-file .env \
  keltison-miniapp
```

## 🤖 Настройка Telegram Bot

### 1. Создание бота

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный токен в `.env` файл

### 2. Настройка WebApp

1. Отправьте команду `/setmenubutton` в @BotFather
2. Выберите вашего бота
3. Укажите URL вашего WebApp: `https://your-domain.com`

### 3. Команды бота

- `/start` - Приветствие и кнопка WebApp
- `/help` - Справка по использованию
- `/webapp` - Прямая ссылка на WebApp

## 📱 Использование WebApp

### Пользовательский интерфейс

1. **Выбор устройства** - 📱 Телефон, 💻 Ноутбук, 🧺 Бытовая техника, 📺 Телевизор
2. **Выбор бренда** - Список брендов по категории
3. **Выбор модели** - Модели выбранного бренда
4. **Выбор проблемы** - Типичные проблемы устройства
5. **Просмотр инструкций** - Пошаговые инструкции с фото/видео

### ИИ-мастер

- Анализирует описание проблемы
- Предлагает подходящие инструкции
- Дает советы по ремонту
- Предупреждает о сложных случаях

### PRO-подписка

- Расширенные инструкции
- Персональные консультации ИИ
- Приоритетная поддержка
- Эксклюзивные материалы

## 👨‍💼 Админ-панель

Доступна по адресу: `https://your-domain.com/admin`

### Функции

- **📊 Дашборд** - Статистика и аналитика
- **📂 Категории** - Управление категориями устройств
- **🏷️ Бренды** - Добавление и редактирование брендов
- **📱 Модели** - Управление моделями устройств
- **⚠️ Проблемы** - Каталог типичных проблем
- **📋 Инструкции** - Создание и редактирование инструкций
- **🤝 Партнеры** - Управление партнерами

### Загрузка файлов

- Поддержка изображений (JPG, PNG, GIF)
- Поддержка видео (MP4, WebM)
- Максимальный размер: 10MB
- Drag & Drop интерфейс

## 🔌 API Endpoints

### Аутентификация

```http
POST /api/auth/webapp-init
Content-Type: application/json

{
  "initData": "telegram_webapp_init_data"
}
```

### Публичные API

```http
GET /api/categories          # Список категорий
GET /api/brands?category_id=1 # Бренды по категории
GET /api/models?brand_id=1   # Модели по бренду
GET /api/problems?category_id=1 # Проблемы по категории
GET /api/instructions?model_id=1&problem_id=1 # Инструкции
GET /api/partners            # Список партнеров
GET /api/search?q=iphone     # Поиск инструкций
```

### ИИ-ассистент

```http
POST /api/assistant/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Не заряжается iPhone",
  "session_id": "optional_session_id"
}
```

### Админ API

```http
GET /api/admin/stats         # Статистика
GET /api/admin/categories    # CRUD категорий
GET /api/admin/brands        # CRUD брендов
GET /api/admin/models        # CRUD моделей
GET /api/admin/problems      # CRUD проблем
GET /api/admin/instructions  # CRUD инструкций
GET /api/admin/partners      # CRUD партнеров
```

## 🗄️ База данных

### Основные таблицы

- **users** - Пользователи Telegram
- **categories** - Категории устройств
- **brands** - Бренды
- **models** - Модели устройств
- **problems** - Типичные проблемы
- **instructions** - Инструкции по ремонту
- **partners** - Партнеры для покупки запчастей
- **chat_sessions** - Сессии ИИ-чата
- **subscriptions** - Подписки пользователей

### Импорт данных

```bash
# Импорт схемы
psql keltison_db < database/keltison_schema.sql

# Импорт тестовых данных
node scripts/import-sample-data.js
```

## 🔒 Безопасность

- **JWT токены** для аутентификации
- **Валидация данных** на всех endpoints
- **Rate limiting** для API
- **CORS** настройки
- **Helmet** для безопасности заголовков
- **File upload** валидация

## 🧪 Тестирование

### Ручное тестирование

1. **WebApp интерфейс**
   - Откройте `http://localhost:3000` в браузере
   - Протестируйте навигацию по категориям
   - Проверьте ИИ-чат

2. **Админ-панель**
   - Откройте `http://localhost:3000/admin`
   - Войдите с учетными данными из .env
   - Протестируйте CRUD операции

3. **Telegram Bot**
   - Найдите вашего бота в Telegram
   - Отправьте `/start`
   - Нажмите кнопку WebApp

### API тестирование

```bash
# Проверка здоровья сервера
curl http://localhost:3000/health

# Получение категорий
curl http://localhost:3000/api/categories

# Тест ИИ-чата (требует токен)
curl -X POST http://localhost:3000/api/assistant/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Не заряжается телефон"}'
```

## 📊 Мониторинг

### Логи

```bash
# Docker логи
docker-compose logs -f app

# Системные логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Check

```bash
curl http://localhost:3000/health
```

Ответ:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## 🔧 Разработка

### Структура проекта

```
keltison-miniapp/
├── config/           # Конфигурация БД
├── database/         # SQL схемы и данные
├── middleware/       # Express middleware
├── public/          # Frontend файлы
│   ├── index.html   # WebApp интерфейс
│   ├── admin.html   # Админ-панель
│   ├── app.js       # WebApp JavaScript
│   ├── admin.js     # Admin JavaScript
│   └── styles.css   # Стили
├── routes/          # API маршруты
├── services/        # Бизнес-логика
├── scripts/         # Утилиты и скрипты
├── uploads/         # Загруженные файлы
├── server.js        # Главный файл сервера
├── package.json     # Зависимости
├── Dockerfile       # Docker образ
└── docker-compose.yml # Docker Compose
```

### Добавление новых функций

1. **Новый API endpoint**
   - Добавьте маршрут в `routes/`
   - Обновите фронтенд в `public/`

2. **Новая таблица БД**
   - Добавьте схему в `database/keltison_schema.sql`
   - Создайте миграцию

3. **Новый UI компонент**
   - Добавьте HTML/CSS в `public/`
   - Обновите JavaScript логику

## 🚀 Продакшн деплой

### Рекомендации

1. **Используйте HTTPS** - Обязательно для Telegram WebApp
2. **Настройте Nginx** - Для reverse proxy и SSL
3. **Используйте PM2** - Для управления процессами Node.js
4. **Настройте мониторинг** - Логи, метрики, алерты
5. **Резервное копирование** - Регулярные бэкапы БД

### Переменные окружения для продакшна

```bash
NODE_ENV=production
WEBAPP_URL=https://your-domain.com
DB_PASSWORD=strong_password
JWT_SECRET=very_long_random_string
TELEGRAM_BOT_TOKEN=your_production_bot_token
```

## 📞 Поддержка

- **Документация**: Этот README
- **Issues**: GitHub Issues
- **Telegram**: @keltison_support

## 📄 Лицензия

MIT License - см. файл LICENSE

## 🤝 Вклад в проект

1. Fork репозиторий
2. Создайте feature branch
3. Commit изменения
4. Push в branch
5. Создайте Pull Request

---

**KЁLTISON** - Мастер ремонта в вашем кармане! 🔧✨
