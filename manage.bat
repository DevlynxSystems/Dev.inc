@echo off

SET BACKEND_DIR=Backend



IF "%1"=="setup" (

    echo Installing Backend dependencies...

    cd %BACKEND_DIR% && npm install && cd ..

    echo Installing Frontend dependencies 

    npm install

    goto end

)



IF "%1"=="dev" (

    echo Starting Backend and Frontend...



    start "DevLynx" npx concurrently "cd %BACKEND_DIR% && node server.js" "npm run dev"
    timeout /t 5 >nul
    start "" "http://localhost:5173/"





    goto end

)



IF "%1"=="build" (

    echo Building Frontend...

    npm run build

    goto end

)



echo Usage: manage.bat {setup^|dev^|build}



:end

