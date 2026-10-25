const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function getHistoryFilePath() {
  const baseDir = app ? app.getPath('userData') : path.join(__dirname, '../../.data');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return path.join(baseDir, 'operation-history.json');
}

/**
 * Read history records from JSON file
 * @returns {Promise<Array>}
 */
async function getHistory() {
  const filePath = getHistoryFilePath();
  try {
    const data = await fs.promises.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    console.warn('Error reading history file, initializing empty history:', err.message);
    return [];
  }
}

/**
 * Add an operation record to history
 * @param {Object} record
 * @returns {Promise<Object>} The saved record
 */
async function addOperation(record) {
  const history = await getHistory();
  const enhancedRecord = {
    ...record,
    id: record.operationId || `op_${Date.now()}`,
    createdAt: new Date().toISOString(),
    undone: false,
  };

  history.unshift(enhancedRecord); // Add latest to front

  // Limit history length to last 100 operations to keep JSON file snappy
  if (history.length > 100) {
    history.length = 100;
  }

  const filePath = getHistoryFilePath();
  await fs.promises.writeFile(filePath, JSON.stringify(history, null, 2), 'utf-8');
  return enhancedRecord;
}

/**
 * Update an existing operation record (e.g. marking undone)
 * @param {string} operationId
 * @param {Object} updates
 * @returns {Promise<Object|null>}
 */
async function updateOperation(operationId, updates) {
  const history = await getHistory();
  const index = history.findIndex(op => op.id === operationId || op.operationId === operationId);
  if (index === -1) {
    return null;
  }

  history[index] = { ...history[index], ...updates, updatedAt: new Date().toISOString() };

  const filePath = getHistoryFilePath();
  await fs.promises.writeFile(filePath, JSON.stringify(history, null, 2), 'utf-8');
  return history[index];
}

/**
 * Clear all operation history
 */
async function clearHistory() {
  const filePath = getHistoryFilePath();
  await fs.promises.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
  return { success: true };
}

module.exports = {
  getHistory,
  addOperation,
  updateOperation,
  clearHistory,
  getHistoryFilePath,
};
