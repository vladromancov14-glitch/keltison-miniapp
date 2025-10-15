@echo off
echo 🚀 Подготовка к деплою KЁLTISON Mini App...
echo.

echo ✅ Код уже загружен в GitHub:
echo    https://github.com/vladromancov14-glitch/keltison-miniapp
echo.

echo 🎯 Следующие шаги:
echo.
echo 1. Перейдите на https://render.com
echo 2. Войдите через GitHub
echo 3. New + > Web Service
echo 4. Connect GitHub repo > vladromancov14-glitch/keltison-miniapp
echo 5. Настройте переменные окружения:
echo.
echo    NODE_ENV=production
echo    JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
echo    TELEGRAM_BOT_TOKEN=8491782314:AAG9CyFRCMlNbQCCFwPy6w5a86mmLdkqoOU
echo    WEBAPP_URL=https://ВАШ_APP.onrender.com
echo    ADMIN_USERNAME=admin
echo    ADMIN_PASSWORD=SecureAdminPass2024!
echo.
echo 6. Create Web Service
echo 7. Получите URL и настройте домен в REG.RU
echo 8. Обновите Telegram Bot в @BotFather
echo.
echo 📋 Подробная инструкция в файле DEPLOY_TO_RENDER.md
echo.
pause
