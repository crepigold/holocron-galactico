/* Ibn al-Haddad — envoltorio de escritorio (Electron) para distribuir en Steam.
 *
 *   npm install        (una vez)
 *   npm start          (abre el juego en una ventana)
 *   npm run dist:win   (genera la versión de Windows en dist/)
 *
 * Steam: si se instala "steamworks.js" y existe steam_appid.txt junto al ejecutable,
 * se inicializa la API de Steam (logros, nube…). Sin Steam, el juego funciona igual.
 */
'use strict';
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let steam = null;
try {
  const steamworks = require('steamworks.js');
  const fs = require('fs');
  const idArchivo = path.join(process.cwd(), 'steam_appid.txt');
  if (fs.existsSync(idArchivo)) {
    steam = steamworks.init(parseInt(fs.readFileSync(idArchivo, 'utf8'), 10));
    steamworks.electronEnableSteamOverlay();
  }
} catch (e) {
  steam = null; // sin Steam: modo independiente
}

function crearVentana() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    backgroundColor: '#000000',
    title: 'Ibn al-Haddad',
    autoHideMenuBar: true,
    fullscreenable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, '..', 'index.html'));

  ipcMain.on('pantalla-completa', (_e, activa) => win.setFullScreen(!!activa));
  ipcMain.on('salir', () => app.quit());
  ipcMain.on('logro', (_e, id) => {
    if (steam && steam.achievement) {
      try {
        steam.achievement.activate(String(id));
      } catch (e) {
        /* logro desconocido en Steamworks */
      }
    }
  });
}

app.whenReady().then(crearVentana);
app.on('window-all-closed', () => app.quit());
