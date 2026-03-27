@echo off
SET BACKEND_DIR=backend
SET FRONTEND_DIR=frontend

IF "%1"=="setup" (
    echo Installing Backend dependencies...
    cd %BACKEND_DIR% && npm install && cd ..
    echo Installing Frontend dependencies...
    cd %FRONTEND_DIR% && npm install && cd ..
    goto end
)

IF "%1"=="dev" (
    echo Starting Backend and Frontend...
    npx concurrently "cd %BACKEND_DIR% && node server.js" "cd %FRONTEND_DIR% && npm run dev"
    goto end
)

IF "%1"=="build" (
    echo Building Frontend...
    cd %FRONTEND_DIR% && npm run build && cd ..
    goto end
)

echo Usage: manage.bat {setup^|dev^|build}

:end