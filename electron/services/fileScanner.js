const fs = require('fs');
const path = require('path');
const { getCategoryForFile } = require('./fileCategorizer');

// Files or directories to ignore during scanning
const IGNORED_NAMES = new Set([
  '.ds_store',
  'thumbs.db',
  'desktop.ini',
  '.git',
  '.svn',
  '.hg',
  'node_modules',
  '.tmp',
  '$recycle.bin',
  'system volume information'
]);

/**
 * Format bytes to human readable format (KB, MB, GB)
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Recursively or flatly scan directory for files
 * @param {string} dirPath - Directory to scan
 * @param {Object} options - Scanning options
 * @param {boolean} options.includeSubdirectories - Whether to scan subdirectories
 * @param {string} options.targetBaseDir - Optional destination base directory for previewing target paths
 * @returns {Promise<{ files: Array, stats: Object, scannedPath: string, timestamp: string }>}
 */
async function scanDirectory(dirPath, options = {}) {
  const { includeSubdirectories = false, targetBaseDir = dirPath } = options;

  if (!dirPath || typeof dirPath !== 'string') {
    throw new Error('A valid directory path must be provided.');
  }

  // Resolve to absolute path
  const resolvedPath = path.resolve(dirPath);

  // Check directory exists and is a directory
  let stat;
  try {
    stat = await fs.promises.stat(resolvedPath);
  } catch (err) {
    throw new Error(`Directory cannot be accessed: ${err.message}`);
  }

  if (!stat.isDirectory()) {
    throw new Error('The specified path is not a directory.');
  }

  const files = [];
  let folderCount = 0;
  let totalBytes = 0;
  const categoryCounts = {};
  const categorySizes = {};

  async function traverse(currentDir, relativePath = '') {
    let entries;
    try {
      entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    } catch (err) {
      console.warn(`Could not read directory ${currentDir}:`, err.message);
      return;
    }

    for (const entry of entries) {
      const entryName = entry.name;
      const lowerName = entryName.toLowerCase();

      // Skip ignored and hidden files/directories
      if (IGNORED_NAMES.has(lowerName) || entryName.startsWith('.')) {
        continue;
      }

      // Do not follow symlinks
      if (entry.isSymbolicLink()) {
        continue;
      }

      const fullPath = path.join(currentDir, entryName);

      if (entry.isDirectory()) {
        folderCount++;
        if (includeSubdirectories) {
          await traverse(fullPath, path.join(relativePath, entryName));
        }
      } else if (entry.isFile()) {
        try {
          const fileStat = await fs.promises.stat(fullPath);
          const size = fileStat.size;
          totalBytes += size;

          const { category, extension } = getCategoryForFile(entryName);

          // Update category metrics
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          categorySizes[category] = (categorySizes[category] || 0) + size;

          // Proposed destination folder and full destination path
          const proposedCategoryDir = path.join(targetBaseDir, category);
          const proposedDestination = path.join(proposedCategoryDir, entryName);

          files.push({
            id: `file_${files.length + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: entryName,
            extension: extension ? extension.toUpperCase() : 'NONE',
            rawExtension: extension,
            category,
            size,
            formattedSize: formatFileSize(size),
            path: fullPath,
            directory: currentDir,
            relativePath: relativePath ? path.join(relativePath, entryName) : entryName,
            proposedDestination,
            proposedCategoryDir,
            modifiedAt: fileStat.mtime.toISOString(),
            createdAt: fileStat.birthtime ? fileStat.birthtime.toISOString() : fileStat.ctime.toISOString(),
          });
        } catch (fileErr) {
          console.warn(`Error stating file ${fullPath}:`, fileErr.message);
        }
      }
    }
  }

  await traverse(resolvedPath);

  const stats = {
    totalFiles: files.length,
    totalFolders: folderCount,
    totalSizeBytes: totalBytes,
    formattedTotalSize: formatFileSize(totalBytes),
    categoryCounts,
    categorySizes,
  };

  return {
    scannedPath: resolvedPath,
    timestamp: new Date().toISOString(),
    stats,
    files,
  };
}

module.exports = {
  scanDirectory,
  formatFileSize,
};
