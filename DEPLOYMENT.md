# 🚀 Руководство по деплою KЁLTISON Mini App

Подробное руководство по развертыванию приложения в различных средах.

## 📋 Предварительные требования

### Системные требования
- **Node.js** 18+ 
- **PostgreSQL** 13+
- **Docker** и **Docker Compose** (опционально)
- **Nginx** (для продакшн)
- **SSL сертификат** (для Telegram WebApp)

### Облачные платформы
- **VPS/Server**: DigitalOcean, Linode, AWS EC2, Google Cloud
- **Контейнеры**: Docker Hub, AWS ECS, Google Cloud Run
- **База данных**: AWS RDS, Google Cloud SQL, DigitalOcean Managed Database

## 🌐 Деплой на VPS

### 1. Подготовка сервера

```bash
# Обновление системы (Ubuntu/Debian)
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Установка Nginx
sudo apt install nginx -y

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Установка Git
sudo apt install git -y
```

### 2. Настройка PostgreSQL

```bash
# Переход к пользователю postgres
sudo -u postgres psql

# Создание базы данных и пользователя
CREATE DATABASE keltison_db;
CREATE USER keltison_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE keltison_db TO keltison_user;
\q
```

### 3. Развертывание приложения

```bash
# Клонирование репозитория
git clone <your-repository-url> /var/www/keltison-miniapp
cd /var/www/keltison-miniapp

# Установка зависимостей
npm install --production

# Настройка переменных окружения
cp env.example .env
nano .env
```

### 4. Настройка .env для продакшна

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=keltison_db
DB_USER=keltison_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your-very-long-random-jwt-secret-key-here

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
WEBAPP_URL=https://your-domain.com

# OpenAI Configuration (optional)
OPENAI_API_KEY=your-openai-api-key

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
```

### 5. Инициализация базы данных

```bash
# Импорт схемы
psql -h localhost -U keltison_user -d keltison_db -f database/keltison_schema.sql

# Импорт тестовых данных
node scripts/import-sample-data.js
```

### 6. Настройка Nginx

```bash
# Создание конфигурации сайта
sudo nano /etc/nginx/sites-available/keltison-miniapp
```

Содержимое файла:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=admin:10m rate=5r/s;
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Admin panel with stricter rate limiting
    location /admin {
        limit_req zone=admin burst=10 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /uploads/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

### 7. Активация конфигурации Nginx

```bash
# Активация сайта
sudo ln -s /etc/nginx/sites-available/keltison-miniapp /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### 8. Настройка SSL сертификата

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавьте строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 9. Запуск приложения с PM2

```bash
# Создание ecosystem файла
nano ecosystem.config.js
```

Содержимое файла:

```javascript
module.exports = {
  apps: [{
    name: 'keltison-miniapp',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

```bash
# Создание директории для логов
mkdir logs

# Запуск приложения
pm2 start ecosystem.config.js

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

## 🐳 Деплой с Docker

### 1. Подготовка

```bash
# Клонирование репозитория
git clone <your-repository-url> keltison-miniapp
cd keltison-miniapp

# Настройка переменных окружения
cp env.example .env
nano .env
```

### 2. Запуск с Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f app
```

### 3. Настройка Nginx для Docker

```bash
# Создание конфигурации
sudo nano /etc/nginx/sites-available/keltison-docker
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## ☁️ Деплой на облачных платформах

### AWS EC2

1. **Создание EC2 инстанса**
   - Выберите Ubuntu 20.04 LTS
   - Минимум t3.small (2 vCPU, 2GB RAM)
   - Откройте порты 22, 80, 443

2. **Подключение и настройка**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   # Следуйте инструкциям для VPS
   ```

3. **RDS для базы данных**
   - Создайте PostgreSQL RDS инстанс
   - Обновите DB_HOST в .env

### Google Cloud Platform

1. **Создание VM инстанса**
   ```bash
   gcloud compute instances create keltison-app \
     --image-family=ubuntu-2004-lts \
     --image-project=ubuntu-os-cloud \
     --machine-type=e2-small \
     --zone=us-central1-a
   ```

2. **Cloud SQL для базы данных**
   - Создайте Cloud SQL PostgreSQL инстанс
   - Настройте приватный IP

### DigitalOcean

1. **Создание Droplet**
   - Ubuntu 20.04 LTS
   - Минимум 2GB RAM
   - Включите мониторинг

2. **Managed Database**
   - Создайте PostgreSQL кластер
   - Настройте подключение

## 🔄 Обновление приложения

### Обновление кода

```bash
# Остановка приложения
pm2 stop keltison-miniapp

# Получение обновлений
git pull origin main

# Установка новых зависимостей
npm install --production

# Запуск приложения
pm2 start keltison-miniapp

# Проверка статуса
pm2 status
```

### Обновление Docker

```bash
# Остановка контейнеров
docker-compose down

# Обновление образов
docker-compose pull

# Пересборка и запуск
docker-compose up -d --build
```

## 📊 Мониторинг и логи

### PM2 мониторинг

```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs keltison-miniapp

# Мониторинг в реальном времени
pm2 monit

# Перезапуск приложения
pm2 restart keltison-miniapp
```

### Системные логи

```bash
# Nginx логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Системные логи
sudo journalctl -u nginx -f
```

### Мониторинг ресурсов

```bash
# Использование CPU и памяти
htop

# Использование диска
df -h

# Сетевые соединения
netstat -tulpn
```

## 🔒 Безопасность

### Firewall настройка

```bash
# Установка UFW
sudo ufw enable

# Разрешение SSH
sudo ufw allow 22

# Разрешение HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Проверка статуса
sudo ufw status
```

### Регулярные обновления

```bash
# Автоматические обновления безопасности
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Резервное копирование

```bash
# Скрипт резервного копирования
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/keltison"
mkdir -p $BACKUP_DIR

# Бэкап базы данных
pg_dump -h localhost -U keltison_user keltison_db > $BACKUP_DIR/db_$DATE.sql

# Бэкап файлов
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/keltison-miniapp/uploads

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Настройка cron для ежедневного бэкапа
crontab -e
# Добавьте:
# 0 2 * * * /path/to/backup.sh
```

## 🚨 Устранение неполадок

### Проверка статуса сервисов

```bash
# Статус PM2
pm2 status

# Статус Nginx
sudo systemctl status nginx

# Статус PostgreSQL
sudo systemctl status postgresql
```

### Проверка подключения к базе данных

```bash
# Подключение к PostgreSQL
psql -h localhost -U keltison_user -d keltison_db

# Проверка таблиц
\dt

# Выход
\q
```

### Проверка логов

```bash
# Логи приложения
pm2 logs keltison-miniapp --lines 100

# Логи Nginx
sudo tail -f /var/log/nginx/error.log

# Системные логи
sudo journalctl -xe
```

### Перезапуск сервисов

```bash
# Перезапуск приложения
pm2 restart keltison-miniapp

# Перезапуск Nginx
sudo systemctl restart nginx

# Перезапуск PostgreSQL
sudo systemctl restart postgresql
```

## 📈 Масштабирование

### Горизонтальное масштабирование

1. **Load Balancer**
   - Настройте Nginx как load balancer
   - Запустите несколько инстансов приложения

2. **База данных**
   - Настройте read replicas
   - Используйте connection pooling

### Вертикальное масштабирование

1. **Увеличение ресурсов сервера**
   - Больше CPU и RAM
   - SSD диски для базы данных

2. **Оптимизация приложения**
   - Кэширование запросов
   - Оптимизация SQL запросов

## 🎯 Чек-лист деплоя

- [ ] Сервер подготовлен (Node.js, PostgreSQL, Nginx)
- [ ] Домен настроен и указывает на сервер
- [ ] SSL сертификат установлен
- [ ] База данных создана и настроена
- [ ] Приложение развернуто и запущено
- [ ] Nginx настроен как reverse proxy
- [ ] PM2 настроен для автозапуска
- [ ] Telegram Bot создан и настроен
- [ ] WebApp URL установлен в боте
- [ ] Мониторинг настроен
- [ ] Резервное копирование настроено
- [ ] Firewall настроен
- [ ] Приложение протестировано

---

**Успешного деплоя! 🚀**
