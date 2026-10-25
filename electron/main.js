const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const { registerIpcHandlers } = require('./ipc/fileHandlers');

let mainWindow = null;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Smart File Organizer',
    width: 1260,
    height: 840,
    minWidth: 1060,
    minHeight: 700,
    backgroundColor: '#0f172a',
    show: false, // Show once ready-to-show to prevent visual flicker
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for preload contextBridge with Node-backed IPC handlers
      webSecurity: true,
    },
  });

  // Register all IPC communication channels
  registerIpcHandlers(mainWindow);

  // Build and attach application menu
  createApplicationMenu();

  // Load appropriate URL / file
  if (isDev) {
    const devServerUrl = 'http://localhost:5173';
    mainWindow.loadURL(devServerUrl).catch(err => {
      console.warn('Vite dev server not ready, retrying in 1s...', err.message);
      setTimeout(() => {
        mainWindow.loadURL(devServerUrl);
      }, 1000);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Graceful show on ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev && process.env.OPEN_DEVTOOLS === 'true') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac
      ? [{
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        }]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Select Folder...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            if (mainWindow) {
              const res = await dialog.showOpenDialog(mainWindow, {
                title: 'Select Folder to Organize',
                properties: ['openDirectory'],
              });
              if (!res.canceled && res.filePaths[0]) {
                mainWindow.webContents.send('menu:selected-folder', res.filePaths[0]);
              }
            }
          },
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Open App Data Folder',
          click: () => {
            shell.openPath(app.getPath('userData'));
          },
        },
        {
          label: 'Open System Downloads Folder',
          click: () => {
            shell.openPath(app.getPath('downloads'));
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Project Documentation',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Smart File Organizer',
              message: 'Smart File Organizer — College Academic Project',
              detail: 'Developed using Electron.js, React.js, and Node.js.\nDemonstrates OS interactions, IPC security, safe file categorization, and real filesystem operations.',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
