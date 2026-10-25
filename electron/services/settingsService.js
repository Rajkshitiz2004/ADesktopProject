const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DEFAULT_SETTINGS = {
  theme: 'dark', // 'dark' | 'light' | 'system'
  defaultMode: 'move', // 'move' | 'copy'
  includeSubdirectories: false,
  defaultDestinationType: 'inside', // 'inside' | 'custom'
  customDestinationDir: '',
  enableNotifications: true,
  confirmBeforeOrganize: true,
  autoOpenDestination: false,
};

function getSettingsFilePath() {
  const baseDir = app ? app.getPath('userData') : path.join(__dirname, '../../.data');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return path.join(baseDir, 'user-settings.json');
}

/**
 * Get current application settings
 * @returns {Promise<Object>}
 */
async function getSettings() {
  const filePath = getSettingsFilePath();
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Create defaults
      await fs.promises.writeFile(filePath, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
      return { ...DEFAULT_SETTINGS };
    }
    console.warn('Error reading settings, using defaults:', err.message);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save updated application settings
 * @param {Object} newSettings
 * @returns {Promise<Object>}
 */
async function saveSettings(newSettings) {
  const current = await getSettings();
  const merged = { ...current, ...newSettings };
  const filePath = getSettingsFilePath();
  await fs.promises.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

/**
 * Reset settings to factory defaults
 * @returns {Promise<Object>}
 */
async function resetSettings() {
  const filePath = getSettingsFilePath();
  await fs.promises.writeFile(filePath, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  return { ...DEFAULT_SETTINGS };
}

module.exports = {
  getSettings,
  saveSettings,
  resetSettings,
  DEFAULT_SETTINGS,
  getSettingsFilePath,
};
