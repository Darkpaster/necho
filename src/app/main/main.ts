import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'node:url';

if (process.platform === 'linux') {
  process.env.DISABLE_DBUS = 'true';
}

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

// Фикс для __dirname в ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      webPreferences: {
        // nodeIntegration: false,
        contextIsolation: true, // безопасность
        sandbox: false,
        preload: path.join(__dirname, 'preload.js'), // если нужен preload
      },
    });

    if (isDev) {
      mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools(); // опционально
    } else {
      mainWindow.loadFile(path.join(__dirname, 'public/index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  } catch (error) {
    console.error('Window creation failed:', error);
    app.quit();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
