# KЁLTISON Mini App

Telegram Mini App для ремонта устройств с AI-ассистентом и админ-панелью.

## 🚀 Деплой на Render

### 1. Подготовка

1. Убедитесь, что у вас есть аккаунт на [Render.com](https://render.com)
2. Создайте новый репозиторий на GitHub и загрузите код
3. Подготовьте переменные окружения

### 2. Создание Web Service на Render

1. Войдите в [Render Dashboard](https://dashboard.render.com)
2. Нажмите "New +" → "Web Service"
3. Подключите ваш GitHub репозиторий
4. Настройте сервис:

**Build & Deploy:**
- **Build Command:** `npm ci`
- **Start Command:** `npm start`
- **Environment:** `Node`

**Environment Variables:**
```
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=keltison_miniapp
DB_USER=your-postgres-user
DB_PASSWORD=your-postgres-password
JWT_SECRET=your-super-secret-jwt-key-here
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
WEBAPP_URL=https://your-app-name.onrender.com
YANDEX_GPT_API_KEY=your-yandex-gpt-api-key
YANDEX_GPT_FOLDER_ID=your-yandex-folder-id
OPENAI_API_KEY=your-openai-api-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
PORT=3000
NODE_ENV=production
```

### 3. Настройка PostgreSQL

1. В Render Dashboard создайте "PostgreSQL" сервис
2. Скопируйте данные подключения в переменные окружения Web Service
3. Импортируйте схему из `db/keltison_schema.sql`

### 4. Настройка Telegram Bot

1. Обновите WebApp URL в настройках бота на `https://your-app-name.onrender.com`
2. Убедитесь, что переменная `WEBAPP_URL` в Render соответствует URL вашего сервиса

### 5. Запуск

После настройки Render автоматически:
- Соберет приложение
- Запустит сервер
- Назначит HTTPS URL

Ваше приложение будет доступно по адресу: `https://your-app-name.onrender.com`

## 📱 Использование

- **Основное приложение:** `https://your-app-name.onrender.com`
- **Админ-панель:** `https://your-app-name.onrender.com/admin-instructions`
- **API документация:** `https://your-app-name.onrender.com/health`

## 🔧 Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск сервера
npm start

# Запуск бота
npm run bot
```

## 📋 API Endpoints

- `GET /api/categories` - Список категорий
- `GET /api/brands` - Список брендов
- `GET /api/models` - Список моделей
- `GET /api/problems` - Список проблем
- `GET /api/instructions` - Инструкции
- `POST /api/auth/webapp-init` - Инициализация WebApp
- `POST /api/assistant/chat` - AI чат
- `GET /api/parts/stores` - Магазины запчастей

## 🛠 Технологии

- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **AI:** YandexGPT + OpenAI
- **Frontend:** HTML + CSS + JavaScript
- **Telegram:** WebApp API
- **Deployment:** Render + Docker