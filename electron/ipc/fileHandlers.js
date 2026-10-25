const { ipcMain, dialog, shell, clipboard, Notification } = require('electron');
const path = require('path');
const { scanDirectory } = require('../services/fileScanner');
const { organizeFiles, undoOperation } = require('../services/fileOrganizer');
const { getHistory, addOperation, updateOperation, clearHistory, getHistoryFilePath } = require('../services/historyService');
const { getSettings, saveSettings, resetSettings, getSettingsFilePath } = require('../services/settingsService');
const { getAllCategories } = require('../services/fileCategorizer');

/**
 * Register all IPC handlers
 * @param {Electron.BrowserWindow} mainWindow
 */
function registerIpcHandlers(mainWindow) {
  // 1. Select Folder via Native Dialog
  ipcMain.handle('dialog:selectFolder', async (event, options = {}) => {
    const { title = 'Select Folder to Organize', defaultPath } = options;
    const result = await dialog.showOpenDialog(mainWindow, {
      title,
      defaultPath,
      properties: ['openDirectory', 'createDirectory'],
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { canceled: true, folderPath: null };
    }

    return { canceled: false, folderPath: result.filePaths[0] };
  });

  // 2. Scan Folder
  ipcMain.handle('fs:scanFolder', async (event, payload) => {
    const { folderPath, options = {} } = payload || {};
    if (!folderPath || typeof folderPath !== 'string') {
      throw new Error('Invalid folder path provided.');
    }

    return await scanDirectory(folderPath, options);
  });

  // 3. Organize Files with Real-time Progress Reporting & Native Notification
  ipcMain.handle('fs:organizeFiles', async (event, payload) => {
    const { files, destinationDir, mode, selectedCategories } = payload || {};

    if (!files || !Array.isArray(files)) {
      throw new Error('A valid list of files must be provided.');
    }
    if (!destinationDir || typeof destinationDir !== 'string') {
      throw new Error('A valid destination directory must be provided.');
    }

    const onProgress = (progressData) => {
      // Send progress event to renderer
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('operation:progress', progressData);
      }
    };

    const summary = await organizeFiles(
      { files, destinationDir, mode, selectedCategories },
      onProgress
    );

    // Persist to history
    await addOperation({
      ...summary,
      sourceDirectory: files[0] ? files[0].directory : destinationDir,
    });

    // Check settings for desktop notification
    const settings = await getSettings();
    if (settings.enableNotifications && Notification.isSupported()) {
      const notif = new Notification({
        title: 'Smart File Organizer',
        body: `Organization complete: ${summary.successCount} files organized successfully (${summary.mode} mode).`,
        silent: false,
      });
      notif.show();
    }

    return summary;
  });

  // 4. Undo Move Operation
  ipcMain.handle('fs:undoOperation', async (event, operationRecord) => {
    if (!operationRecord) {
      throw new Error('Operation record is required to undo.');
    }

    const onProgress = (progressData) => {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('operation:progress', progressData);
      }
    };

    const undoResult = await undoOperation(operationRecord, onProgress);

    // Update the operation in history to reflect undone status
    await updateOperation(operationRecord.id, {
      undone: true,
      undoneAt: new Date().toISOString(),
      undoSummary: undoResult,
    });

    // Send native notification
    const settings = await getSettings();
    if (settings.enableNotifications && Notification.isSupported()) {
      const notif = new Notification({
        title: 'Smart File Organizer',
        body: `Undo complete: ${undoResult.totalRestored} files restored to original locations.`,
        silent: false,
      });
      notif.show();
    }

    return undoResult;
  });

  // 5. Categories Meta
  ipcMain.handle('categories:getAll', async () => {
    return getAllCategories();
  });

  // 6. History Management
  ipcMain.handle('history:get', async () => {
    return await getHistory();
  });

  ipcMain.handle('history:clear', async () => {
    return await clearHistory();
  });

  // 7. Settings Management
  ipcMain.handle('settings:get', async () => {
    return await getSettings();
  });

  ipcMain.handle('settings:save', async (event, newSettings) => {
    return await saveSettings(newSettings);
  });

  ipcMain.handle('settings:reset', async () => {
    return await resetSettings();
  });

  // 8. Shell and System Operations
  ipcMain.handle('shell:openFolder', async (event, folderPath) => {
    if (!folderPath) return false;
    const errorMsg = await shell.openPath(folderPath);
    return { success: !errorMsg, error: errorMsg };
  });

  ipcMain.handle('shell:showItemInFolder', async (event, filePath) => {
    if (!filePath) return false;
    shell.showItemInFolder(filePath);
    return { success: true };
  });

  ipcMain.handle('clipboard:writeText', async (event, text) => {
    if (typeof text === 'string') {
      clipboard.writeText(text);
      return true;
    }
    return false;
  });

  // 9. Native Confirmation Dialog
  ipcMain.handle('dialog:confirm', async (event, options = {}) => {
    const {
      title = 'Confirmation',
      message = 'Are you sure you want to proceed?',
      detail = '',
      type = 'question',
      buttons = ['Cancel', 'Confirm'],
      defaultId = 1,
      cancelId = 0,
    } = options;

    const result = await dialog.showMessageBox(mainWindow, {
      type,
      title,
      message,
      detail,
      buttons,
      defaultId,
      cancelId,
    });

    return result.response === defaultId;
  });

  // 10. App Meta Information
  ipcMain.handle('app:getInfo', async () => {
    return {
      name: 'Smart File Organizer',
      version: '1.0.0',
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      platform: process.platform,
      arch: process.arch,
      historyFilePath: getHistoryFilePath(),
      settingsFilePath: getSettingsFilePath(),
    };
  });
}

module.exports = {
  registerIpcHandlers,
};
