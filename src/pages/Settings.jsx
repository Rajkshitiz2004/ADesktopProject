import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Bell,
  SlidersHorizontal,
  FolderOpen,
  FolderCheck,
  Moon,
  Sun,
  Laptop,
  Check,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { desktopApi } from '../services/desktopApi';

export default function Settings({ theme, setTheme, appInfo }) {
  const [settings, setSettings] = useState({
    theme: 'dark',
    defaultMode: 'move',
    includeSubdirectories: false,
    defaultDestinationType: 'inside',
    enableNotifications: true,
  });
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    desktopApi.getSettings().then((loaded) => {
      if (loaded) {
        setSettings(loaded);
      }
    });
  }, []);

  const handleChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    if (key === 'theme') {
      setTheme(value);
    }
  };

  const handleSave = async () => {
    await desktopApi.saveSettings(settings);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleReset = async () => {
    const confirmed = await desktopApi.showConfirmDialog({
      title: 'Reset Settings',
      message: 'Restore all settings to default values?',
      buttons: ['Cancel', 'Reset to Defaults'],
      defaultId: 1,
    });

    if (confirmed) {
      const defaults = await desktopApi.resetSettings();
      setSettings(defaults);
      setTheme(defaults.theme || 'dark');
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-sm font-bold text-slate-200">Application Settings</h3>
        <p className="text-xs text-slate-400">
          Configure your file organization rules and desktop application preferences
        </p>
      </div>

      <div className="space-y-4">
        {/* Appearance Section */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Moon size={14} className="text-indigo-400" />
            Appearance & Visual Theme
          </h4>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'system', label: 'System Default', icon: Laptop },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = settings.theme === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleChange('theme', option.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} className={isSelected ? 'text-indigo-400' : 'text-slate-400'} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Organization Defaults */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-indigo-400" />
            Organization Defaults
          </h4>

          <div className="space-y-3.5 text-xs">
            {/* Default Mode */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <p className="font-semibold text-slate-200">Default Action Mode</p>
                <p className="text-[11px] text-slate-400">
                  Select whether files should be moved or copied by default
                </p>
              </div>
              <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => handleChange('defaultMode', 'move')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    settings.defaultMode === 'move'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Move
                </button>
                <button
                  onClick={() => handleChange('defaultMode', 'copy')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    settings.defaultMode === 'copy'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Subdirectories Toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div>
                <p className="font-semibold text-slate-200">Include Subdirectories</p>
                <p className="text-[11px] text-slate-400">
                  Enable recursive folder scanning by default when choosing directories
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeSubdirectories}
                  onChange={(e) => handleChange('includeSubdirectories', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-200">System Desktop Notifications</p>
                <p className="text-[11px] text-slate-400">
                  Display native OS notifications when organization or undo tasks complete
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Local Storage & System Info */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <HardDrive size={14} className="text-indigo-400" />
            Storage Locations & Diagnostics
          </h4>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase font-sans">History Storage File</span>
              <span className="text-slate-300 text-[11px] break-all">{appInfo?.historyFilePath || 'userdata/operation-history.json'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-500 block text-[10px] uppercase font-sans">Settings Storage File</span>
              <span className="text-slate-300 text-[11px] break-all">{appInfo?.settingsFilePath || 'userdata/user-settings.json'}</span>
            </div>
          </div>
        </div>

        {/* Save / Reset Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            {savedStatus ? <Check size={14} className="text-white" /> : <Save size={14} />}
            <span>{savedStatus ? 'Settings Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
