'use strict';

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// CP437 character map for Swedish characters and common extended ASCII
const CP437_MAP = {
  '\u00C7': 0x80, '\u00FC': 0x81, '\u00E9': 0x82, '\u00E2': 0x83,
  '\u00E4': 0x84, '\u00E0': 0x85, '\u00E5': 0x86, '\u00E7': 0x87,
  '\u00EA': 0x88, '\u00EB': 0x89, '\u00E8': 0x8A, '\u00EF': 0x8B,
  '\u00EE': 0x8C, '\u00EC': 0x8D, '\u00C4': 0x8E, '\u00C5': 0x8F,
  '\u00C9': 0x90, '\u00E6': 0x91, '\u00C6': 0x92, '\u00F4': 0x93,
  '\u00F6': 0x94, '\u00F2': 0x95, '\u00FB': 0x96, '\u00F9': 0x97,
  '\u00FF': 0x98, '\u00D6': 0x99, '\u00DC': 0x9A, '\u00A2': 0x9B,
  '\u00A3': 0x9C, '\u00A5': 0x9D, '\u20A7': 0x9E, '\u0192': 0x9F,
  '\u00E1': 0xA0, '\u00ED': 0xA1, '\u00F3': 0xA2, '\u00FA': 0xA3,
  '\u00F1': 0xA4, '\u00D1': 0xA5, '\u00AA': 0xA6, '\u00BA': 0xA7,
  '\u00BF': 0xA8, '\u2310': 0xA9, '\u00AC': 0xAA, '\u00BD': 0xAB,
  '\u00BC': 0xAC, '\u00A1': 0xAD, '\u00AB': 0xAE, '\u00BB': 0xAF,
};

function encodeCP437(str) {
  const bytes = [];
  for (const ch of str) {
    const code = ch.charCodeAt(0);
    if (code < 128) {
      bytes.push(code);
    } else if (CP437_MAP[ch] !== undefined) {
      bytes.push(CP437_MAP[ch]);
    } else {
      bytes.push(0x3F); // '?' fallback
    }
  }
  return Buffer.from(bytes);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: '#13111C',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'default',
    show: false,
  });

  win.loadFile('index.html');

  win.once('ready-to-show', () => {
    win.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Only check for updates when running as a packaged app, not in dev
  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch(() => {});
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('save-file', async (_event, { filename, content }) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    defaultPath: filename,
    filters: [
      { name: 'SIE-filer', extensions: ['se', 'si'] },
      { name: 'Alla filer', extensions: ['*'] },
    ],
  });
  if (canceled || !filePath) return { success: false, canceled: true };
  try {
    const buffer = encodeCP437(content);
    fs.writeFileSync(filePath, buffer);
    return { success: true, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
