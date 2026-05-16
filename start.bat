@echo off
echo ====================================
echo   Rice Mill Management System
echo   Pakistan Rice Mill Software
echo ====================================
echo.
echo Starting Backend Server...
start "Rice Mill - Backend" cmd /k "cd /d "%~dp0server" && npm run dev"

echo Starting Frontend...
timeout /t 2 /nobreak >nul
start "Rice Mill - Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ====================================
echo   App is starting!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ====================================
echo.
echo Login Credentials:
echo   Admin   : admin@ricemill.pk / admin123
echo   Staff   : staff@ricemill.pk / password123
echo   Customer: buyer@example.pk  / password123
echo   Supplier: farmer@example.pk / password123
echo.
timeout /t 4 /nobreak >nul
start http://localhost:3000
