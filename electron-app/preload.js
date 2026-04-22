'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile:        (data) => ipcRenderer.invoke('save-file', data),
  getAppVersion:   ()     => ipcRenderer.invoke('get-app-version'),
  getReleaseNotes: ()     => ipcRenderer.invoke('get-release-notes'),
});
