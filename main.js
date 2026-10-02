const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 900,
    minWidth: 400,
    minHeight: 700,
    title: 'Solo Leveling — Спортивная Система',
    autoHideMenuBar: true,
    backgroundColor: '#0a0a12',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true }
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
