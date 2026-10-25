const fs = require('fs');
const path = require('path');

/**
 * Check if a file exists asynchronously
 */
async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a unique destination path if the target filename already exists.
 * E.g., 'report.pdf' -> 'report (1).pdf', 'report (2).pdf'
 */
async function getUniqueDestination(targetDir, originalFilename) {
  const ext = path.extname(originalFilename);
  const baseName = path.basename(originalFilename, ext);

  let targetPath = path.join(targetDir, originalFilename);
  let counter = 1;

  while (await fileExists(targetPath)) {
    const candidateName = `${baseName} (${counter})${ext}`;
    targetPath = path.join(targetDir, candidateName);
    counter++;
  }

  return targetPath;
}

/**
 * Move file safely across potential filesystem boundaries (EXDEV handling)
 */
async function safeMoveFile(src, dest) {
  try {
    await fs.promises.rename(src, dest);
  } catch (err) {
    if (err.code === 'EXDEV') {
      // Cross-device link fallback: copy then delete source
      await fs.promises.copyFile(src, dest);
      await fs.promises.unlink(src);
    } else {
      throw err;
    }
  }
}

/**
 * Execute file organization
 * @param {Object} options
 * @param {Array} options.files - List of file objects to organize
 * @param {string} options.destinationDir - Base destination folder
 * @param {string} options.mode - 'move' or 'copy'
 * @param {Array<string>} options.selectedCategories - Optional category filters
 * @param {Function} onProgress - Callback for real-time progress events
 * @returns {Promise<Object>} Operation report
 */
async function organizeFiles(options, onProgress = () => {}) {
  const {
    files = [],
    destinationDir,
    mode = 'move',
    selectedCategories = null,
  } = options;

  if (!destinationDir || typeof destinationDir !== 'string') {
    throw new Error('Destination directory is required.');
  }

  if (mode !== 'move' && mode !== 'copy') {
    throw new Error("Invalid operation mode. Must be 'move' or 'copy'.");
  }

  const resolvedDestDir = path.resolve(destinationDir);

  // Ensure base destination folder exists
  await fs.promises.mkdir(resolvedDestDir, { recursive: true });

  // Filter files by selected categories if provided
  const categorySet = selectedCategories ? new Set(selectedCategories) : null;
  const filesToProcess = categorySet
    ? files.filter(f => categorySet.has(f.category))
    : files;

  const total = filesToProcess.length;
  if (total === 0) {
    return {
      operationId: `op_${Date.now()}`,
      timestamp: new Date().toISOString(),
      mode,
      destinationDir: resolvedDestDir,
      totalFiles: 0,
      successCount: 0,
      failedCount: 0,
      operations: [],
      errors: [],
      durationMs: 0,
    };
  }

  const startTime = Date.now();
  const successfulOps = [];
  const errors = [];

  for (let i = 0; i < total; i++) {
    const file = filesToProcess[i];
    const currentNum = i + 1;
    const percent = Math.round((currentNum / total) * 100);

    onProgress({
      current: currentNum,
      total,
      percent,
      currentFile: file.name,
      status: 'processing',
    });

    try {
      // Validate source file exists
      const srcExists = await fileExists(file.path);
      if (!srcExists) {
        throw new Error(`Source file does not exist: ${file.path}`);
      }

      // Ensure category subfolder exists inside destination
      const categoryDir = path.join(resolvedDestDir, file.category);
      await fs.promises.mkdir(categoryDir, { recursive: true });

      // Generate unique destination to prevent overwrites
      const uniqueDestPath = await getUniqueDestination(categoryDir, file.name);

      // Skip if source and destination are identical
      if (path.resolve(file.path) === path.resolve(uniqueDestPath)) {
        continue;
      }

      if (mode === 'move') {
        await safeMoveFile(file.path, uniqueDestPath);
      } else {
        await fs.promises.copyFile(file.path, uniqueDestPath);
      }

      successfulOps.push({
        id: file.id,
        filename: file.name,
        originalPath: file.path,
        newPath: uniqueDestPath,
        category: file.category,
        size: file.size,
        formattedSize: file.formattedSize,
        mode,
        status: 'success',
      });
    } catch (err) {
      console.error(`Error processing file ${file.name}:`, err);
      errors.push({
        id: file.id,
        filename: file.name,
        originalPath: file.path,
        error: err.message,
        status: 'failed',
      });
    }
  }

  const durationMs = Date.now() - startTime;

  const summary = {
    operationId: `op_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    mode,
    destinationDir: resolvedDestDir,
    totalFiles: total,
    successCount: successfulOps.length,
    failedCount: errors.length,
    operations: successfulOps,
    errors,
    durationMs,
  };

  onProgress({
    current: total,
    total,
    percent: 100,
    currentFile: '',
    status: 'completed',
    summary,
  });

  return summary;
}

/**
 * Undo a previous MOVE operation by returning files to their original locations
 * @param {Object} operationRecord - The operation record saved in history
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>}
 */
async function undoOperation(operationRecord, onProgress = () => {}) {
  if (!operationRecord || operationRecord.mode !== 'move') {
    throw new Error('Only Move operations can be undone.');
  }

  if (operationRecord.undone) {
    throw new Error('This operation has already been undone.');
  }

  const { operations = [] } = operationRecord;
  const total = operations.length;
  const undoneOps = [];
  const errors = [];

  for (let i = 0; i < total; i++) {
    const op = operations[i];
    const currentNum = i + 1;
    const percent = Math.round((currentNum / total) * 100);

    onProgress({
      current: currentNum,
      total,
      percent,
      currentFile: op.filename,
      status: 'undoing',
    });

    try {
      // Check if file still exists in the moved location
      const existsAtNew = await fileExists(op.newPath);
      if (!existsAtNew) {
        throw new Error(`File no longer exists at ${op.newPath}`);
      }

      // Ensure original parent directory exists
      const originalDir = path.dirname(op.originalPath);
      await fs.promises.mkdir(originalDir, { recursive: true });

      // Destination in original location (avoid overwriting if something was placed there)
      const restoreDest = await getUniqueDestination(originalDir, op.filename);

      await safeMoveFile(op.newPath, restoreDest);

      undoneOps.push({
        id: op.id,
        filename: op.filename,
        restoredFrom: op.newPath,
        restoredTo: restoreDest,
        status: 'success',
      });
    } catch (err) {
      errors.push({
        id: op.id,
        filename: op.filename,
        error: err.message,
        status: 'failed',
      });
    }
  }

  return {
    undoneOperationId: operationRecord.operationId,
    timestamp: new Date().toISOString(),
    totalRestored: undoneOps.length,
    totalFailed: errors.length,
    restoredFiles: undoneOps,
    errors,
  };
}

module.exports = {
  organizeFiles,
  undoOperation,
  getUniqueDestination,
};
