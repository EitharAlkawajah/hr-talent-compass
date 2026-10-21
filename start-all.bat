@echo off
echo ========================================
echo 🚀 Starting HR Talent Compass Services
echo ========================================
echo.

REM Start Backend (Spring Boot)
start "Backend" cmd /k "cd backend && mvn spring-boot:run"

REM Wait a bit for backend to initialize
timeout /t 5 /nobreak >nul

REM Start AI Service (Python Flask) - Using global Python since venv was removed
start "AI Service" cmd /k "cd ai-service && python app.py"

REM Wait a bit for AI service
timeout /t 3 /nobreak >nul

REM Start Frontend (React)
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo ✅ All services are starting!
echo    Backend   : http://localhost:8080
echo    AI Service: http://localhost:5000
echo    Frontend  : http://localhost:3000
echo.
echo Close each terminal window to stop that service.
echo ========================================
pause