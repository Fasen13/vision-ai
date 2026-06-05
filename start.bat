@echo off
title Vision AI - Server
echo Запуск сервера Vision AI...

:: Запуск туннеля localtunnel в отдельном окне
start "Vision AI - Localtunnel" cmd /c "npx localtunnel --port 3000 --local-host 127.0.0.1 & pause"

:: Запуск основного сервера
node server.js
pause    exit /b 1
)

if not exist node_modules (
    echo  Первый запуск: устанавливаю npm-зависимости...
    npm install
    if %errorlevel% neq 0 (
        echo  [Ошибка] npm install завершился с ошибкой.
        pause
        exit /b 1
    )
)

if not exist node_modules\playwright (
    echo  [Внимание] Playwright не найден. Выполните install-chromium.bat
)

echo  Откройте в браузере: http://localhost:3000
echo.
node server.js
pause
