const { contextBridge, ipcRenderer } = require('electron');

/**
 * Restricted bridge exposed to React renderer window
 */
contextBridge.exposeInMainWorld('fileOrganizer', {
  // Folder Selection
  selectFolder: (options) => ipcRenderer.invoke('dialog:selectFolder', options),

  // File Scanning
  scanFolder: (payload) => ipcRenderer.invoke('fs:scanFolder', payload),

  // File Organizing & Undo
  organizeFiles: (payload) => ipcRenderer.invoke('fs:organizeFiles', payload),
  undoOperation: (operationRecord) => ipcRenderer.invoke('fs:undoOperation', operationRecord),

  // Metadata & Categories
  getAllCategories: () => ipcRenderer.invoke('categories:getAll'),

  // History
  getOperationHistory: () => ipcRenderer.invoke('history:get'),
  clearOperationHistory: () => ipcRenderer.invoke('history:clear'),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  resetSettings: () => ipcRenderer.invoke('settings:reset'),

  // Shell and System Operations
  openFolder: (folderPath) => ipcRenderer.invoke('shell:openFolder', folderPath),
  showItemInFolder: (filePath) => ipcRenderer.invoke('shell:showItemInFolder', filePath),
  copyPathToClipboard: (filePath) => ipcRenderer.invoke('clipboard:writeText', filePath),

  // Native Confirm Dialog
  showConfirmDialog: (options) => ipcRenderer.invoke('dialog:confirm', options),

  // App System Info
  getAppInfo: () => ipcRenderer.invoke('app:getInfo'),

  // Controlled Progress Events
  onOperationProgress: (callback) => {
    if (typeof callback !== 'function') return;
    const subscription = (event, data) => callback(data);
    ipcRenderer.on('operation:progress', subscription);
    return () => {
      ipcRenderer.removeListener('operation:progress', subscription);
    };
  },
});
