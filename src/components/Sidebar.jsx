import React from 'react';
import {
  LayoutDashboard,
  FolderSync,
  Files,
  History,
  Settings,
  Info,
  FolderOpen,
  HardDrive,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'organize', label: 'Organize Files', icon: FolderSync },
  { id: 'explorer', label: 'File Explorer', icon: Files },
  { id: 'history', label: 'History & Undo', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'about', label: 'About Project', icon: Info },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  selectedFolder,
  onSelectFolder,
  scannedFilesCount,
  appInfo,
}) {
  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur-md h-full select-none">
      {/* App Branding */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Sparkles size={20} className="animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-white leading-tight">
            Smart File Organizer
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            Desktop Edition v1.0
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{item.label}</span>
              {item.id === 'organize' && scannedFilesCount > 0 && (
                <span className="ml-auto bg-indigo-500/30 text-indigo-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                  {scannedFilesCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Folder Status in Sidebar */}
      <div className="p-3 m-3 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5 font-medium">
            <HardDrive size={13} className="text-indigo-400" />
            Active Folder
          </span>
          {selectedFolder && (
            <span className="text-[10px] text-emerald-400 font-mono">Ready</span>
          )}
        </div>
        <p className="text-xs font-mono text-slate-300 truncate" title={selectedFolder || 'No folder chosen'}>
          {selectedFolder ? selectedFolder.split(/[\\/]/).pop() || selectedFolder : 'No folder chosen'}
        </p>
        <button
          onClick={onSelectFolder}
          className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          <FolderOpen size={13} />
          <span>{selectedFolder ? 'Change Folder' : 'Select Folder'}</span>
        </button>
      </div>

      {/* Footer System Details */}
      <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="font-mono">Node {appInfo?.nodeVersion || 'v25'}</span>
        <span className="font-mono">Electron {appInfo?.electronVersion || 'v34'}</span>
      </div>
    </aside>
  );
}
