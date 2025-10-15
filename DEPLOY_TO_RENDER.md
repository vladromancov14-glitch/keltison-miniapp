# 🚀 Деплой KЁLTISON Mini App на Render

## ✅ Код готов к деплою!

**GitHub репозиторий:** https://github.com/vladromancov14-glitch/keltison-miniapp

## 🎯 Пошаговый деплой на Render:

### **Шаг 1: Регистрация на Render**

1. **Перейдите на https://render.com**
2. **Нажмите "Get Started for Free"**
3. **Войдите через GitHub** (Sign up with GitHub)
4. **Подтвердите email** (если потребуется)

### **Шаг 2: Создание Web Service**

1. **Нажмите "New +"**
2. **Выберите "Web Service"**
3. **Connect GitHub repo**
4. **Выберите репозиторий:** `vladromancov14-glitch/keltison-miniapp`
5. **Нажмите "Connect"**

### **Шаг 3: Настройка сервиса**

**Основные настройки:**
```
Name: keltison-miniapp
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**Environment Variables (переменные окружения):**
```bash
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
TELEGRAM_BOT_TOKEN=8491782314:AAG9CyFRCMlNbQCCFwPy6w5a86mmLdkqoOU
WEBAPP_URL=https://keltison-miniapp.onrender.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecureAdminPass2024!
```

### **Шаг 4: Деплой**

1. **Нажмите "Create Web Service"**
2. **Render автоматически:**
   - Склонирует ваш репозиторий
   - Установит зависимости
   - Запустит приложение
3. **Получите URL** типа: `https://keltison-miniapp.onrender.com`

### **Шаг 5: Настройка домена REG.RU**

**В панели управления REG.RU:**

1. **Перейдите в DNS управление**
2. **Добавьте CNAME запись:**
   ```
   Type: CNAME
   Name: www
   Value: keltison-miniapp.onrender.com
   TTL: 3600
   ```

3. **Добавьте A запись для корневого домена:**
   ```
   Type: A
   Name: @
   Value: 76.76.19.61 (IP Render)
   TTL: 3600
   ```

### **Шаг 6: Обновление Telegram Bot**

**В @BotFather:**

1. **Напишите команду:**
   ```
   /setmenubutton
   ```

2. **Выберите вашего бота**

3. **Введите URL:**
   ```
   https://ВАШ_ДОМЕН.com
   ```

## 🔧 Альтернативные варианты деплоя:

### **Vercel (еще проще):**

1. **Перейдите на https://vercel.com**
2. **Войдите через GitHub**
3. **Import Project**
4. **Выберите репозиторий**
5. **Deploy**

### **Netlify:**

1. **Перейдите на https://netlify.com**
2. **New site from Git**
3. **Выберите GitHub репозиторий**
4. **Deploy site**

## 📊 После деплоя:

### **Что будет работать:**

- ✅ **WebApp**: https://ВАШ_ДОМЕН.com
- ✅ **Админка**: https://ВАШ_ДОМЕН.com/admin
- ✅ **API**: https://ВАШ_ДОМЕН.com/api/categories
- ✅ **Health Check**: https://ВАШ_ДОМЕН.com/health
- ✅ **Telegram Bot**: подключен к WebApp
- ✅ **HTTPS**: автоматически настроен

### **Тестирование:**

1. **Откройте WebApp** в браузере
2. **Протестируйте навигацию**
3. **Проверьте ИИ-чат**
4. **Напишите боту** `/start` в Telegram
5. **Нажмите кнопку** "Открыть КЁЛТИСОН"

## 🎉 Готово!

**Ваш KЁLTISON Mini App будет доступен по адресу:**
- **WebApp**: https://ВАШ_ДОМЕН.com
- **Telegram Bot**: @repairelectronicsb

---

## 🆘 Если нужна помощь:

1. **Render Dashboard** - мониторинг и логи
2. **GitHub** - исходный код
3. **Telegram Bot** - тестирование WebApp

**Время деплоя: ~10 минут! 🚀**
