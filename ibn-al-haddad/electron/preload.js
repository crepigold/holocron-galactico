/* Puente seguro entre el juego (página web) y Electron. */
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  pantallaCompleta: (activa) => ipcRenderer.send('pantalla-completa', activa),
  salir: () => ipcRenderer.send('salir'),
  logro: (id) => ipcRenderer.send('logro', id),
});
