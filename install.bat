@echo off
echo Vérification de Node.js...

node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js n'est pas installé.
    echo Ouverture de la page officielle...
    start https://nodejs.org/en/download
    pause
    exit /b
)

echo Node.js détecté.
echo Installation des dépendances...

npm install
npm install express
npm install bcryptjs
npm install jsonwebtoken
npm install electron
npm install electron-builder

echo Installation terminée.
pause
