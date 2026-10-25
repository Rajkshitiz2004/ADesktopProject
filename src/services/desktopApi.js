/**
 * Desktop API Service
 * Wraps window.fileOrganizer exposed by Electron preload script.
 */

const isElectron = typeof window !== 'undefined' && Boolean(window.fileOrganizer);

export const desktopApi = {
  isAvailable: () => isElectron,

  // Folder Selection
  selectFolder: async (options = {}) => {
    if (!isElectron) {
      console.warn('Running outside Electron environment');
      return { canceled: true, folderPath: null };
    }
    return await window.fileOrganizer.selectFolder(options);
  },

  // Scanning
  scanFolder: async (folderPath, options = {}) => {
    if (!isElectron) throw new Error('Desktop APIs unavailable in browser preview');
    return await window.fileOrganizer.scanFolder({ folderPath, options });
  },

  // Organizing & Undo
  organizeFiles: async (payload) => {
    if (!isElectron) throw new Error('Desktop APIs unavailable in browser preview');
    return await window.fileOrganizer.organizeFiles(payload);
  },

  undoOperation: async (operationRecord) => {
    if (!isElectron) throw new Error('Desktop APIs unavailable in browser preview');
    return await window.fileOrganizer.undoOperation(operationRecord);
  },

  // Categories Metadata
  getAllCategories: async () => {
    if (!isElectron) return [];
    return await window.fileOrganizer.getAllCategories();
  },

  // History
  getOperationHistory: async () => {
    if (!isElectron) return [];
    return await window.fileOrganizer.getOperationHistory();
  },

  clearOperationHistory: async () => {
    if (!isElectron) return { success: true };
    return await window.fileOrganizer.clearOperationHistory();
  },

  // Settings
  getSettings: async () => {
    if (!isElectron) {
      return {
        theme: 'dark',
        defaultMode: 'move',
        includeSubdirectories: false,
        defaultDestinationType: 'inside',
        enableNotifications: true,
      };
    }
    return await window.fileOrganizer.getSettings();
  },

  saveSettings: async (settings) => {
    if (!isElectron) return settings;
    return await window.fileOrganizer.saveSettings(settings);
  },

  resetSettings: async () => {
    if (!isElectron) return {};
    return await window.fileOrganizer.resetSettings();
  },

  // Shell and System
  openFolder: async (folderPath) => {
    if (!isElectron) return { success: false };
    return await window.fileOrganizer.openFolder(folderPath);
  },

  showItemInFolder: async (filePath) => {
    if (!isElectron) return { success: false };
    return await window.fileOrganizer.showItemInFolder(filePath);
  },

  copyPathToClipboard: async (filePath) => {
    if (!isElectron) {
      navigator.clipboard.writeText(filePath);
      return true;
    }
    return await window.fileOrganizer.copyPathToClipboard(filePath);
  },

  // Native Confirm Dialog
  showConfirmDialog: async (options) => {
    if (!isElectron) {
      return window.confirm(options.message || 'Are you sure?');
    }
    return await window.fileOrganizer.showConfirmDialog(options);
  },

  // App Info
  getAppInfo: async () => {
    if (!isElectron) {
      return {
        name: 'Smart File Organizer',
        version: '1.0.0 (Web Preview)',
        platform: 'web',
      };
    }
    return await window.fileOrganizer.getAppInfo();
  },

  // Progress Subscription
  onOperationProgress: (callback) => {
    if (!isElectron) return () => {};
    return window.fileOrganizer.onOperationProgress(callback);
  },
};
