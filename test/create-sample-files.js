const fs = require('fs');
const path = require('path');

const SAMPLE_DIR = path.join(__dirname, 'sample-messy-folder');

const SAMPLE_FILES = [
  // Images
  { name: 'vacation_photo.jpg', content: 'JPEG image mock binary data' },
  { name: 'SCREENSHOT_2026.PNG', content: 'PNG image mock data' }, // uppercase extension
  { name: 'logo_vector.svg', content: '<svg xmlns="http://www.w3.org/2000/svg"></svg>' },
  { name: 'banner_anim.gif', content: 'GIF image mock data' },

  // Documents
  { name: 'annual_report.pdf', content: '%PDF-1.4 Mock Annual Report content' },
  { name: 'meeting_notes.txt', content: 'Action items for sprint 12.' },
  { name: 'PROJECT_SPEC.DOCX', content: 'Project specifications document' }, // uppercase extension
  { name: 'research_paper.odt', content: 'OpenDocument text content' },

  // Spreadsheets
  { name: 'q4_financials.xlsx', content: 'Spreadsheet binary data' },
  { name: 'customer_contacts.csv', content: 'id,name,email\n1,Alice,alice@example.com\n2,Bob,bob@example.com' },

  // Presentations
  { name: 'pitch_deck.pptx', content: 'Presentation slides data' },

  // Videos
  { name: 'product_demo.mp4', content: 'MP4 mock video data' },
  { name: 'clip_recording.mov', content: 'QuickTime movie data' },

  // Audio
  { name: 'podcast_episode_01.mp3', content: 'MP3 audio mock binary' },
  { name: 'guitar_riff.wav', content: 'WAV sound data' },

  // Archives
  { name: 'project_source_v1.zip', content: 'ZIP compressed archive mock' },
  { name: 'system_logs.tar.gz', content: 'Tarball archive mock' },

  // Code
  { name: 'api_server.js', content: 'const http = require("http");\nconsole.log("running");' },
  { name: 'data_analysis.py', content: 'import pandas as pd\nprint("Analyzing data")' },
  { name: 'styles.css', content: 'body { margin: 0; background: #000; }' },
  { name: 'index.html', content: '<!DOCTYPE html><html><body><h1>Hello</h1></body></html>' },
  { name: 'algorithm.cpp', content: '#include <iostream>\nint main() { return 0; }' },

  // Executables
  { name: 'installer_package.dmg', content: 'macOS disk image mock' },
  { name: 'setup_wizard.exe', content: 'Windows executable mock' },

  // Files without extensions
  { name: 'Dockerfile', content: 'FROM node:20-alpine\nWORKDIR /app' },
  { name: 'LICENSE', content: 'MIT License Copyright (c) 2026' },
  { name: 'Makefile', content: 'all:\n\techo "building"' },

  // Collision duplicate test
  { name: 'duplicate_test.pdf', content: 'Original PDF file version 1' },
];

async function createSampleFiles() {
  console.log(`Creating sample messy folder at: ${SAMPLE_DIR}`);

  if (fs.existsSync(SAMPLE_DIR)) {
    fs.rmSync(SAMPLE_DIR, { recursive: true, force: true });
  }

  fs.mkdirSync(SAMPLE_DIR, { recursive: true });

  for (const item of SAMPLE_FILES) {
    const filePath = path.join(SAMPLE_DIR, item.name);
    fs.writeFileSync(filePath, item.content, 'utf-8');
  }

  // Also create a subfolder with files to test recursive scanning
  const subDir = path.join(SAMPLE_DIR, 'Subfolder_Archive');
  fs.mkdirSync(subDir, { recursive: true });
  fs.writeFileSync(path.join(subDir, 'nested_document.pdf'), 'Nested PDF document', 'utf-8');
  fs.writeFileSync(path.join(subDir, 'nested_photo.jpg'), 'Nested JPG photo', 'utf-8');

  console.log(`Successfully created ${SAMPLE_FILES.length + 2} sample files in ${SAMPLE_DIR}`);
}

createSampleFiles().catch(err => {
  console.error('Failed to create sample files:', err);
  process.exit(1);
});
