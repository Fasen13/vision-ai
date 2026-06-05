@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  Установка Chromium для Playwright (одноразово)
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  [Ошибка] Node.js не найден. Установите с https://nodejs.org
    pause
    exit /b 1
)

if not exist node_modules (
    echo  Устанавливаю npm-зависимости...
    npm install
    if %errorlevel% neq 0 (
        echo  [Ошибка] npm install завершился с ошибкой.
        pause
        exit /b 1
    )
)

call npx playwright install chromium
if %errorlevel% neq 0 (
    echo  [Ошибка] Не удалось установить Chromium для Playwright.
    pause
    exit /b 1
)

echo.
echo  Готово. Теперь запускайте start.bat
echo.
pause
