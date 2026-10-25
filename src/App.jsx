import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProgressPanel from './components/ProgressPanel';
import Dashboard from './pages/Dashboard';
import OrganizeFiles from './pages/OrganizeFiles';
import FileExplorer from './pages/FileExplorer';
import History from './pages/History';
import Settings from './pages/Settings';
import About from './pages/About';
import { desktopApi } from './services/desktopApi';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [scanData, setScanData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [history, setHistory] = useState([]);
  const [appInfo, setAppInfo] = useState(null);
  const [progress, setProgress] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Load initial settings, app info and operation history
  useEffect(() => {
    desktopApi.getSettings().then((s) => {
      if (s?.theme) {
        setTheme(s.theme);
      }
    });

    desktopApi.getAppInfo().then((info) => {
      setAppInfo(info);
    });

    loadHistory();

    // Subscribe to IPC progress events
    const unsubscribe = desktopApi.onOperationProgress((progressData) => {
      setProgress(progressData);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    const metaColorScheme = document.querySelector('meta[name="color-scheme"]');

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      if (metaColorScheme) metaColorScheme.content = 'light dark';
    } else if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      if (metaColorScheme) metaColorScheme.content = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      if (metaColorScheme) metaColorScheme.content = 'light';
    }
  }, [theme]);

  const loadHistory = async () => {
    const list = await desktopApi.getOperationHistory();
    setHistory(list || []);
  };

  // Scan folder
  const handleScanFolder = useCallback(async (folderPath, options = {}) => {
    if (!folderPath) return;
    setIsScanning(true);
    try {
      const result = await desktopApi.scanFolder(folderPath, options);
      setScanData(result);
      setSelectedFolder(folderPath);
    } catch (err) {
      alert(`Scanning error: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Select folder via native dialog
  const handleSelectFolder = async () => {
    const res = await desktopApi.selectFolder({
      title: 'Select Folder to Organize',
      defaultPath: selectedFolder || undefined,
    });

    if (!res.canceled && res.folderPath) {
      setSelectedFolder(res.folderPath);
      // Automatically scan the newly selected directory
      await handleScanFolder(res.folderPath);
    }
  };

  // Undo move operation
  const handleUndoOperation = async (operationRecord) => {
    try {
      await desktopApi.undoOperation(operationRecord);
      await loadHistory();
      // Re-scan current folder to reflect restored files
      if (selectedFolder) {
        await handleScanFolder(selectedFolder);
      }
    } catch (err) {
      alert(`Undo operation failed: ${err.message}`);
    }
  };

  // Clear history
  const handleClearHistory = async () => {
    await desktopApi.clearOperationHistory();
    await loadHistory();
  };

  // Organization complete callback
  const handleOrganizeComplete = async () => {
    await loadHistory();
    if (selectedFolder) {
      await handleScanFolder(selectedFolder);
    }
  };

  const titles = {
    dashboard: 'Dashboard',
    organize: 'Organize Files',
    explorer: 'File Explorer',
    history: 'Operation History',
    settings: 'Settings',
    about: 'About Project',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedFolder={selectedFolder}
        onSelectFolder={handleSelectFolder}
        scannedFilesCount={scanData?.stats?.totalFiles || 0}
        appInfo={appInfo}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-900/30">
        <Header
          activeTabTitle={titles[activeTab] || 'Smart File Organizer'}
          selectedFolder={selectedFolder}
          onSelectFolder={handleSelectFolder}
          theme={theme}
          setTheme={setTheme}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              scanData={scanData}
              history={history}
              onSelectFolder={handleSelectFolder}
              onNavigate={setActiveTab}
              onUndoOperation={handleUndoOperation}
            />
          )}

          {activeTab === 'organize' && (
            <OrganizeFiles
              selectedFolder={selectedFolder}
              onSelectFolder={handleSelectFolder}
              scanData={scanData}
              onScanFolder={handleScanFolder}
              isScanning={isScanning}
              onOrganizeComplete={handleOrganizeComplete}
            />
          )}

          {activeTab === 'explorer' && (
            <FileExplorer scanData={scanData} />
          )}

          {activeTab === 'history' && (
            <History
              history={history}
              onUndoOperation={handleUndoOperation}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              theme={theme}
              setTheme={setTheme}
              appInfo={appInfo}
            />
          )}

          {activeTab === 'about' && (
            <About appInfo={appInfo} />
          )}
        </main>
      </div>

      {/* Live Floating Progress Panel */}
      <ProgressPanel
        progress={progress}
        onClose={() => setProgress(null)}
      />
    </div>
  );
}
