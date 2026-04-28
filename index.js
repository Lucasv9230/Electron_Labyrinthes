const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 1000,
    icon: path.join(__dirname, 'build/icon.ico')
  });

  win.loadFile(path.join(__dirname, 'front-end/html/index.html'));
}

app.whenReady().then(createWindow);
