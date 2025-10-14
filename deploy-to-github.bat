@echo off
echo 🚀 Подготовка к деплою KЁLTISON Mini App...
echo.

REM Проверка Git
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git не установлен. Установите Git с https://git-scm.com/
    pause
    exit /b 1
)

echo ✅ Git найден

REM Инициализация Git репозитория
if not exist .git (
    echo 📁 Инициализация Git репозитория...
    git init
    git branch -M main
)

REM Добавление файлов
echo 📦 Добавление файлов в Git...
git add .

REM Коммит
echo 💾 Создание коммита...
git commit -m "Deploy KЁLTISON Mini App to production"

echo.
echo 🎉 Готово! Теперь выполните следующие шаги:
echo.
echo 1. Создайте репозиторий на GitHub:
echo    https://github.com/new
echo.
echo 2. Добавьте remote origin:
echo    git remote add origin https://github.com/ВАШ_USERNAME/keltison-miniapp.git
echo.
echo 3. Загрузите код:
echo    git push -u origin main
echo.
echo 4. Задеплойте на Railway или Render
echo    См. DEPLOY_GUIDE.md для подробностей
echo.
pause
