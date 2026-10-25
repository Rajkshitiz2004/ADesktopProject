// Syntax and module require check
console.log('Testing electron module resolution...');

try {
  require('../electron/services/fileCategorizer');
  require('../electron/services/fileScanner');
  require('../electron/services/fileOrganizer');
  require('../electron/services/historyService');
  require('../electron/services/settingsService');
  console.log('All Electron services load cleanly.');
} catch (e) {
  console.error('Error loading electron modules:', e);
  process.exit(1);
}
