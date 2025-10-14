# 🚀 Руководство по деплою KЁLTISON Mini App

## 🌐 Деплой на ваш домен REG.RU

### Вариант 1: Railway (рекомендуется) - БЕСПЛАТНО

**Преимущества:**
- ✅ Автоматический HTTPS
- ✅ Автоматический деплой из GitHub
- ✅ Поддержка PostgreSQL
- ✅ Бесплатный план (500 часов/месяц)

**Шаги:**

1. **Создайте GitHub репозиторий:**
   ```bash
   # В корне проекта
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/keltison-miniapp.git
   git push -u origin main
   ```

2. **Зарегистрируйтесь на Railway:**
   - Перейдите на https://railway.app
   - Войдите через GitHub
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Выберите ваш репозиторий

3. **Настройте переменные окружения:**
   ```bash
   # В Railway Dashboard > Variables
   NODE_ENV=production
   PORT=3000
   
   # Database (Railway предоставляет PostgreSQL)
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Telegram
   TELEGRAM_BOT_TOKEN=8491782314:AAG9CyFRCMlNbQCCFwPy6w5a86mmLdkqoOU
   WEBAPP_URL=https://your-app.railway.app
   
   # Admin
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=SecureAdminPass2024!
   ```

4. **Получите URL:**
   - Railway автоматически создаст URL типа: `https://keltison-miniapp-production-xxxx.up.railway.app`

### Вариант 2: Render - БЕСПЛАТНО

**Шаги:**

1. **Зарегистрируйтесь на Render:**
   - Перейдите на https://render.com
   - Войдите через GitHub

2. **Создайте Web Service:**
   - New > Web Service
   - Connect GitHub repo
   - Выберите ваш репозиторий

3. **Настройки:**
   ```bash
   Build Command: npm install
   Start Command: npm start
   ```

4. **Переменные окружения:**
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-here
   TELEGRAM_BOT_TOKEN=8491782314:AAG9CyFRCMlNbQCCFwPy6w5a86mmLdkqoOU
   WEBAPP_URL=https://your-app.onrender.com
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=SecureAdminPass2024!
   ```

### Вариант 3: VPS на REG.RU

Если у вас есть VPS на REG.RU:

1. **Подключитесь по SSH:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Установите Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Установите PostgreSQL:**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

4. **Создайте базу данных:**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE keltison_db;
   CREATE USER keltison_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE keltison_db TO keltison_user;
   \q
   ```

5. **Клонируйте проект:**
   ```bash
   git clone https://github.com/yourusername/keltison-miniapp.git
   cd keltison-miniapp
   npm install
   ```

6. **Настройте .env:**
   ```bash
   cp env.example .env
   nano .env
   ```

7. **Настройте Nginx:**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/keltison
   ```

   Содержимое файла:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

8. **Активируйте сайт:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/keltison /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Установите SSL:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

10. **Запустите приложение:**
    ```bash
    npm install -g pm2
    pm2 start server-production.js --name keltison-app
    pm2 startup
    pm2 save
    ```

## 🔗 Настройка домена REG.RU

### Если используете внешний хостинг (Railway/Render):

1. **Войдите в панель управления REG.RU**
2. **Перейдите в DNS управление**
3. **Добавьте CNAME запись:**
   ```bash
   Type: CNAME
   Name: www (или @ для корневого домена)
   Value: your-app.railway.app (ваш URL от Railway/Render)
   TTL: 3600
   ```

4. **Добавьте A запись для корневого домена:**
   ```bash
   Type: A
   Name: @
   Value: IP-адрес вашего хостинга (если нужно)
   TTL: 3600
   ```

### Если используете VPS на REG.RU:

1. **Настройте A запись:**
   ```bash
   Type: A
   Name: @
   Value: IP-адрес вашего VPS
   TTL: 3600
   ```

2. **Настройте CNAME для www:**
   ```bash
   Type: CNAME
   Name: www
   Value: your-domain.com
   TTL: 3600
   ```

## 🤖 Настройка Telegram Bot

После деплоя:

1. **Откройте @BotFather в Telegram**
2. **Настройте WebApp URL:**
   ```
   /setmenubutton
   Выберите вашего бота
   URL: https://your-domain.com
   ```

3. **Протестируйте бота:**
   - Отправьте `/start`
   - Нажмите кнопку "Открыть КЁЛТИСОН"

## 📊 Мониторинг и поддержка

### Railway:
- Автоматические логи
- Мониторинг в реальном времени
- Автоматические деплои при push в GitHub

### Render:
- Логи в dashboard
- Автоматические деплои
- Мониторинг uptime

### VPS:
```bash
# Проверка статуса
pm2 status
pm2 logs keltison-app

# Перезапуск
pm2 restart keltison-app

# Мониторинг
pm2 monit
```

## 🔧 Troubleshooting

### Проблемы с HTTPS:
- Убедитесь, что домен правильно настроен
- Проверьте SSL сертификат
- Telegram требует HTTPS для WebApp

### Проблемы с базой данных:
- Проверьте подключение к PostgreSQL
- Убедитесь, что переменные окружения настроены
- Проверьте логи приложения

### Проблемы с Telegram Bot:
- Проверьте токен бота
- Убедитесь, что WebApp URL настроен правильно
- Проверьте, что домен доступен по HTTPS

## 📝 Чек-лист деплоя

- [ ] GitHub репозиторий создан
- [ ] Код загружен в репозиторий
- [ ] Хостинг выбран (Railway/Render/VPS)
- [ ] Переменные окружения настроены
- [ ] База данных настроена (если нужно)
- [ ] Домен настроен в REG.RU
- [ ] SSL сертификат установлен
- [ ] Telegram Bot настроен
- [ ] WebApp URL обновлен
- [ ] Приложение протестировано

---

**Успешного деплоя! 🚀**
