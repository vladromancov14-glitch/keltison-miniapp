# ⚡ Быстрый деплой KЁLTISON Mini App

## 🎯 Самый простой способ - Railway (5 минут)

### 1. Загрузите код на GitHub

```bash
# Запустите скрипт (Windows)
deploy-to-github.bat

# Или вручную:
git init
git add .
git commit -m "Deploy KЁLTISON Mini App"
git branch -M main
```

### 2. Создайте репозиторий на GitHub

1. Перейдите на https://github.com/new
2. Название: `keltison-miniapp`
3. Создайте репозиторий
4. Скопируйте URL репозитория

### 3. Загрузите код

```bash
git remote add origin https://github.com/ВАШ_USERNAME/keltison-miniapp.git
git push -u origin main
```

### 4. Задеплойте на Railway

1. Перейдите на https://railway.app
2. Войдите через GitHub
3. New Project > Deploy from GitHub repo
4. Выберите `keltison-miniapp`
5. Нажмите Deploy

### 5. Настройте переменные окружения

В Railway Dashboard > Variables добавьте:

```bash
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
TELEGRAM_BOT_TOKEN=8491782314:AAG9CyFRCMlNbQCCFwPy6w5a86mmLdkqoOU
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecureAdminPass2024!
```

### 6. Получите URL

Railway создаст URL типа: `https://keltison-miniapp-production-xxxx.up.railway.app`

### 7. Настройте домен REG.RU

В панели управления REG.RU:

1. DNS управление
2. Добавьте CNAME запись:
   ```
   Type: CNAME
   Name: www
   Value: keltison-miniapp-production-xxxx.up.railway.app
   ```

### 8. Настройте Telegram Bot

В @BotFather:

```
/setmenubutton
Выберите вашего бота
URL: https://ВАШ_ДОМЕН.com
```

## 🎉 Готово!

Ваш KЁLTISON Mini App теперь доступен по адресу:
- **WebApp**: https://ВАШ_ДОМЕН.com
- **Админка**: https://ВАШ_ДОМЕН.com/admin
- **Health Check**: https://ВАШ_ДОМЕН.com/health

## 🔧 Что работает:

- ✅ Telegram WebApp интерфейс
- ✅ ИИ-мастер (локальная версия)
- ✅ Админ-панель
- ✅ Все API endpoints
- ✅ HTTPS автоматически

## 📊 Для полного функционала:

Добавьте PostgreSQL в Railway:
1. Railway Dashboard > New > Database > PostgreSQL
2. Подключите к вашему проекту
3. Обновите переменные окружения:
   ```bash
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   ```

---

**Время деплоя: ~5 минут! 🚀**
