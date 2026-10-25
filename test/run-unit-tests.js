const path = require('path');
const fs = require('fs');
const assert = require('assert');

const { getCategoryForFile, getAllCategories } = require('../electron/services/fileCategorizer');
const { scanDirectory } = require('../electron/services/fileScanner');
const { organizeFiles, undoOperation, getUniqueDestination } = require('../electron/services/fileOrganizer');
const { getHistory, addOperation, updateOperation, clearHistory } = require('../electron/services/historyService');
const { getSettings, saveSettings, resetSettings } = require('../electron/services/settingsService');

async function runTests() {
  console.log('🧪 Starting Smart File Organizer Unit & Integration Tests...\n');

  // Test 1: File Categorization
  console.log('Test 1: File Categorization');
  assert.strictEqual(getCategoryForFile('photo.jpg').category, 'Images');
  assert.strictEqual(getCategoryForFile('SCREENSHOT.PNG').category, 'Images'); // Uppercase
  assert.strictEqual(getCategoryForFile('report.pdf').category, 'Documents');
  assert.strictEqual(getCategoryForFile('PROJECT_SPEC.DOCX').category, 'Documents');
  assert.strictEqual(getCategoryForFile('budget.xlsx').category, 'Spreadsheets');
  assert.strictEqual(getCategoryForFile('slides.pptx').category, 'Presentations');
  assert.strictEqual(getCategoryForFile('video.mp4').category, 'Videos');
  assert.strictEqual(getCategoryForFile('song.mp3').category, 'Audio');
  assert.strictEqual(getCategoryForFile('backup.zip').category, 'Archives');
  assert.strictEqual(getCategoryForFile('server.js').category, 'Code');
  assert.strictEqual(getCategoryForFile('setup.exe').category, 'Executables');
  assert.strictEqual(getCategoryForFile('Dockerfile').category, 'Code'); // No extension, known special
  assert.strictEqual(getCategoryForFile('LICENSE').category, 'Documents'); // No extension, known special
  assert.strictEqual(getCategoryForFile('random_file').category, 'Other'); // No extension, unknown
  console.log('✅ File Categorization passed!\n');

  // Test 2: File Scanner
  console.log('Test 2: File Scanner');
  const sampleDir = path.join(__dirname, 'sample-messy-folder');
  
  // Non-recursive scan
  const flatScan = await scanDirectory(sampleDir, { includeSubdirectories: false });
  assert(flatScan.files.length >= 28, `Expected at least 28 files, got ${flatScan.files.length}`);
  assert.strictEqual(flatScan.stats.totalFolders, 1);
  console.log(`Flat scan found ${flatScan.files.length} files and ${flatScan.stats.totalFolders} folder.`);

  // Recursive scan
  const recursiveScan = await scanDirectory(sampleDir, { includeSubdirectories: true });
  assert(recursiveScan.files.length >= 30, `Expected at least 30 files, got ${recursiveScan.files.length}`);
  console.log(`Recursive scan found ${recursiveScan.files.length} files.`);
  assert(recursiveScan.stats.categoryCounts.Images >= 4);
  assert(recursiveScan.stats.categoryCounts.Documents >= 4);
  console.log('✅ File Scanner passed!\n');

  // Test 3: Collision Handling (Duplicate filename)
  console.log('Test 3: Duplicate Filename Collision Handling');
  const testCollisionDir = path.join(__dirname, 'collision-test');
  if (fs.existsSync(testCollisionDir)) fs.rmSync(testCollisionDir, { recursive: true, force: true });
  fs.mkdirSync(testCollisionDir, { recursive: true });

  fs.writeFileSync(path.join(testCollisionDir, 'document.pdf'), 'first version');
  const uniqueName1 = await getUniqueDestination(testCollisionDir, 'document.pdf');
  assert.strictEqual(path.basename(uniqueName1), 'document (1).pdf');

  fs.writeFileSync(uniqueName1, 'second version');
  const uniqueName2 = await getUniqueDestination(testCollisionDir, 'document.pdf');
  assert.strictEqual(path.basename(uniqueName2), 'document (2).pdf');
  console.log('✅ Collision handling passed!\n');

  // Test 4: Copy Mode Organization
  console.log('Test 4: Copy Mode Organization');
  const copyTargetDir = path.join(__dirname, 'copy-target');
  if (fs.existsSync(copyTargetDir)) fs.rmSync(copyTargetDir, { recursive: true, force: true });

  const filesToCopy = flatScan.files.slice(0, 5);
  let progressEvents = [];
  const copySummary = await organizeFiles(
    {
      files: filesToCopy,
      destinationDir: copyTargetDir,
      mode: 'copy',
    },
    (prog) => progressEvents.push(prog)
  );

  assert.strictEqual(copySummary.successCount, 5);
  assert.strictEqual(copySummary.failedCount, 0);
  assert(progressEvents.length >= 5, 'Should emit progress events');
  console.log(`✅ Copy Mode organized ${copySummary.successCount} files with ${progressEvents.length} progress updates!\n`);

  // Test 5: Move Mode & Reversible Undo
  console.log('Test 5: Move Mode and Undo Feature');
  const moveTestDir = path.join(__dirname, 'move-source');
  if (fs.existsSync(moveTestDir)) fs.rmSync(moveTestDir, { recursive: true, force: true });
  fs.mkdirSync(moveTestDir, { recursive: true });

  // Create two files to move
  const f1 = path.join(moveTestDir, 'temp1.txt');
  const f2 = path.join(moveTestDir, 'temp2.jpg');
  fs.writeFileSync(f1, 'test content 1');
  fs.writeFileSync(f2, 'test content 2');

  const moveScan = await scanDirectory(moveTestDir);
  const moveDestDir = path.join(__dirname, 'move-dest');
  if (fs.existsSync(moveDestDir)) fs.rmSync(moveDestDir, { recursive: true, force: true });

  const moveSummary = await organizeFiles({
    files: moveScan.files,
    destinationDir: moveDestDir,
    mode: 'move',
  });

  assert.strictEqual(moveSummary.successCount, 2);
  assert(!fs.existsSync(f1), 'Original temp1.txt should have moved');
  assert(!fs.existsSync(f2), 'Original temp2.jpg should have moved');
  assert(fs.existsSync(path.join(moveDestDir, 'Documents', 'temp1.txt')), 'temp1.txt should be in Documents');
  assert(fs.existsSync(path.join(moveDestDir, 'Images', 'temp2.jpg')), 'temp2.jpg should be in Images');
  console.log('Move verified. Now testing Undo...');

  const undoResult = await undoOperation(moveSummary);
  assert.strictEqual(undoResult.totalRestored, 2);
  assert(fs.existsSync(f1), 'temp1.txt should be restored to original folder');
  assert(fs.existsSync(f2), 'temp2.jpg should be restored to original folder');
  console.log('✅ Move and Undo passed!\n');

  // Clean up temporary test artifacts
  fs.rmSync(testCollisionDir, { recursive: true, force: true });
  fs.rmSync(copyTargetDir, { recursive: true, force: true });
  fs.rmSync(moveTestDir, { recursive: true, force: true });
  fs.rmSync(moveDestDir, { recursive: true, force: true });

  console.log('🎉 ALL UNIT AND INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
