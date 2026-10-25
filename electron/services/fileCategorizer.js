const path = require('path');

// File category definitions with their supported extensions
const CATEGORY_MAP = {
  Images: [
    'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'tif',
    'heic', 'heif', 'raw', 'cr2', 'nef', 'psd', 'ai'
  ],
  Documents: [
    'pdf', 'doc', 'docx', 'txt', 'odt', 'rtf', 'md', 'markdown', 'pages',
    'tex', 'epub', 'mobi', 'log'
  ],
  Spreadsheets: [
    'xls', 'xlsx', 'csv', 'ods', 'tsv', 'numbers', 'xlsm'
  ],
  Presentations: [
    'ppt', 'pptx', 'odp', 'key', 'pps', 'ppsx'
  ],
  Videos: [
    'mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'mpg', 'mpeg'
  ],
  Audio: [
    'mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'aiff', 'alac', 'opus'
  ],
  Archives: [
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'tgz', 'tbz2', 'cab'
  ],
  Code: [
    'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs',
    'html', 'htm', 'css', 'scss', 'sass', 'json', 'xml', 'yaml', 'yml',
    'sh', 'bash', 'zsh', 'php', 'go', 'rs', 'rb', 'sql', 'vue', 'swift',
    'kt', 'dart', 'r', 'lua', 'pl'
  ],
  Executables: [
    'exe', 'msi', 'dmg', 'app', 'deb', 'rpm', 'pkg', 'bat', 'cmd', 'apk', 'jar'
  ],
};

// Known special files without extensions that belong to categories
const SPECIAL_FILES_MAP = {
  'dockerfile': 'Code',
  'makefile': 'Code',
  'license': 'Documents',
  'readme': 'Documents',
  'gemfile': 'Code',
  'procfile': 'Code',
  '.env': 'Code',
  '.gitignore': 'Code',
};

// Reverse map for O(1) extension lookup
const EXTENSION_LOOKUP = new Map();
for (const [category, extensions] of Object.entries(CATEGORY_MAP)) {
  for (const ext of extensions) {
    EXTENSION_LOOKUP.set(ext.toLowerCase(), category);
  }
}

/**
 * Categorize a file based on its filename
 * @param {string} filename 
 * @returns {{ category: string, extension: string }}
 */
function getCategoryForFile(filename) {
  if (!filename || typeof filename !== 'string') {
    return { category: 'Other', extension: '' };
  }

  const cleanName = filename.trim();
  const lowerName = cleanName.toLowerCase();

  // Check special filenames first
  if (SPECIAL_FILES_MAP[lowerName]) {
    return {
      category: SPECIAL_FILES_MAP[lowerName],
      extension: ''
    };
  }

  // Extract extension
  const rawExt = path.extname(cleanName);
  if (!rawExt) {
    return { category: 'Other', extension: '' };
  }

  // Remove leading dot and lowercase
  const extension = rawExt.slice(1).toLowerCase();

  if (EXTENSION_LOOKUP.has(extension)) {
    return {
      category: EXTENSION_LOOKUP.get(extension),
      extension
    };
  }

  return {
    category: 'Other',
    extension
  };
}

/**
 * Return list of all available categories with metadata
 */
function getAllCategories() {
  const categories = Object.keys(CATEGORY_MAP).concat('Other');
  return categories.map(cat => ({
    name: cat,
    color: getCategoryColor(cat),
    extensions: CATEGORY_MAP[cat] || []
  }));
}

/**
 * UI color styling hint for category badges
 */
function getCategoryColor(category) {
  switch (category) {
    case 'Images': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
    case 'Documents': return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
    case 'Spreadsheets': return { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' };
    case 'Presentations': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    case 'Videos': return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' };
    case 'Audio': return { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' };
    case 'Archives': return { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' };
    case 'Code': return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' };
    case 'Executables': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' };
    default: return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  }
}

module.exports = {
  getCategoryForFile,
  getAllCategories,
  getCategoryColor,
  CATEGORY_MAP,
};
