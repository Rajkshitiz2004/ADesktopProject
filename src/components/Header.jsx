import React, { useState } from 'react';
import {
  FolderOpen,
  FolderCheck,
  ExternalLink,
  Copy,
  Check,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { desktopApi } from '../services/desktopApi';

export default function Header({
  activeTabTitle,
  selectedFolder,
  onSelectFolder,
  theme,
  setTheme,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyPath = async () => {
    if (!selectedFolder) return;
    await desktopApi.copyPathToClipboard(selectedFolder);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenFolder = async () => {
    if (!selectedFolder) return;
    await desktopApi.openFolder(selectedFolder);
  };

  const cycleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none">
      {/* Title / Breadcrumb */}
      <div>
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <span>{activeTabTitle}</span>
        </h2>
        <p className="text-[11px] text-slate-400">
          Desktop File Categorization & Organization Engine
        </p>
      </div>

      {/* Central / Right Actions */}
      <div className="flex items-center gap-3">
        {/* Selected Folder Banner */}
        {selectedFolder ? (
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-300">
            <FolderCheck size={14} className="text-emerald-400 shrink-0" />
            <span className="max-w-[260px] truncate font-mono text-[11px]" title={selectedFolder}>
              {selectedFolder}
            </span>
            <div className="flex items-center gap-1 border-l border-slate-700 pl-2 ml-1">
              <button
                onClick={handleCopyPath}
                title="Copy full directory path"
                className="p-1 hover:text-white rounded hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
              <button
                onClick={handleOpenFolder}
                title="Open in System File Manager"
                className="p-1 hover:text-white rounded hover:bg-slate-700 transition-colors"
              >
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onSelectFolder}
            className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <FolderOpen size={14} />
            <span>Select Directory</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
          className="p-2 rounded-lg border border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 text-xs"
        >
          {theme === 'dark' ? (
            <Moon size={15} className="text-indigo-400" />
          ) : theme === 'light' ? (
            <Sun size={15} className="text-amber-400" />
          ) : (
            <Laptop size={15} className="text-cyan-400" />
          )}
          <span className="capitalize text-[11px] font-medium hidden sm:inline">{theme}</span>
        </button>
      </div>
    </header>
  );
}
