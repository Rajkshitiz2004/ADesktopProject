import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  RefreshCw,
  FolderSync,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import FileTable from '../components/FileTable';
import ConfirmDialog from '../components/ConfirmDialog';
import CategoryBadge from '../components/CategoryBadge';
import { desktopApi } from '../services/desktopApi';

export default function OrganizeFiles({
  selectedFolder,
  onSelectFolder,
  scanData,
  onScanFolder,
  isScanning,
  onOrganizeComplete,
}) {
  const [destinationType, setDestinationType] = useState('inside'); // 'inside' | 'custom'
  const [customDestinationDir, setCustomDestinationDir] = useState('');
  const [mode, setMode] = useState('move'); // 'move' | 'copy'
  const [includeSubdirs, setIncludeSubdirs] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedFileIds, setSelectedFileIds] = useState(new Set());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);

  const effectiveDestinationDir = destinationType === 'inside'
    ? selectedFolder
    : customDestinationDir || selectedFolder;

  const files = scanData?.files || [];

  // Available categories in the scanned files
  const availableCategories = useMemo(() => {
    const set = new Set();
    files.forEach(f => set.add(f.category));
    return Array.from(set).sort();
  }, [files]);

  // Handle category chip toggles
  const toggleCategory = (cat) => {
    const updated = new Set(selectedCategories);
    if (updated.has(cat)) {
      updated.delete(cat);
    } else {
      updated.add(cat);
    }
    setSelectedCategories(updated);
  };

  const selectAllCategories = () => {
    if (selectedCategories.size === availableCategories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(availableCategories));
    }
  };

  // Filtered files to organize
  const filesToOrganize = useMemo(() => {
    let list = files;
    if (selectedCategories.size > 0) {
      list = list.filter(f => selectedCategories.has(f.category));
    }
    return list;
  }, [files, selectedCategories]);

  // Handle custom destination selection
  const handleSelectCustomDestination = async () => {
    const res = await desktopApi.selectFolder({ title: 'Select Destination Folder' });
    if (!res.canceled && res.folderPath) {
      setCustomDestinationDir(res.folderPath);
    }
  };

  // Initiate organization workflow
  const handleStartOrganize = () => {
    if (!selectedFolder) {
      alert('Please select a source folder first.');
      return;
    }
    if (filesToOrganize.length === 0) {
      alert('No files available to organize with the selected filters.');
      return;
    }
    if (destinationType === 'custom' && !customDestinationDir) {
      alert('Please choose a valid destination folder or select "Inside Source Folder".');
      return;
    }
    setIsConfirmOpen(true);
  };

  // Execute organization via IPC
  const executeOrganization = async () => {
    setIsConfirmOpen(false);
    setIsOrganizing(true);
    setSummaryResult(null);

    try {
      const summary = await desktopApi.organizeFiles({
        files: filesToOrganize,
        destinationDir: effectiveDestinationDir,
        mode,
        selectedCategories: selectedCategories.size > 0 ? Array.from(selectedCategories) : null,
      });

      setSummaryResult(summary);
      if (onOrganizeComplete) {
        onOrganizeComplete(summary);
      }
    } catch (err) {
      alert(`Organization failed: ${err.message}`);
    } finally {
      setIsOrganizing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Configuration Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Source Directory Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FolderOpen size={14} className="text-indigo-400" />
              Source Directory
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={selectedFolder || ''}
                placeholder="No folder chosen..."
                className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 truncate focus:outline-none"
              />
              <button
                onClick={onSelectFolder}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium shrink-0 transition-colors"
              >
                Browse...
              </button>
            </div>
          </div>

          {/* Destination Directory Option */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers size={14} className="text-indigo-400" />
              Destination Target
            </label>
            <div className="flex gap-2">
              <select
                value={destinationType}
                onChange={(e) => setDestinationType(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="inside">Inside Source Folder</option>
                <option value="custom">Separate Custom Folder</option>
              </select>
              {destinationType === 'custom' && (
                <button
                  onClick={handleSelectCustomDestination}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium truncate text-left transition-colors"
                  title={customDestinationDir || 'Choose destination'}
                >
                  {customDestinationDir ? customDestinationDir.split(/[\\/]/).pop() : 'Choose folder...'}
                </button>
              )}
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal size={14} className="text-indigo-400" />
              Operation Mode
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setMode('move')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'move'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Move Files
              </button>
              <button
                type="button"
                onClick={() => setMode('copy')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'copy'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Copy Files
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls & Subdirectories Toggle */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeSubdirs}
              onChange={(e) => setIncludeSubdirs(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <span>Include Subdirectories in Scan</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onScanFolder(selectedFolder, { includeSubdirectories: includeSubdirs })}
              disabled={!selectedFolder || isScanning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition-colors"
            >
              <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
              <span>{isScanning ? 'Scanning...' : 'Scan Directory'}</span>
            </button>

            <button
              onClick={handleStartOrganize}
              disabled={filesToOrganize.length === 0 || isOrganizing}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                mode === 'move'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              <FolderSync size={14} />
              <span>
                {mode === 'move' ? 'Organize (Move Files)' : 'Organize (Copy Files)'} ({filesToOrganize.length})
              </span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      {availableCategories.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">
              Filter by Category ({selectedCategories.size === 0 ? 'All included' : `${selectedCategories.size} selected`})
            </span>
            <button
              onClick={selectAllCategories}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {selectedCategories.size === availableCategories.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {availableCategories.map((cat) => {
              const isChecked = selectedCategories.has(cat);
              const count = files.filter(f => f.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`transition-all ${
                    isChecked
                      ? 'ring-2 ring-indigo-500 rounded-full'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <CategoryBadge category={cat} count={count} size="sm" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* File Preview Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Organization Preview ({filesToOrganize.length} Files Ready)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Destination: {effectiveDestinationDir ? effectiveDestinationDir.split(/[\\/]/).pop() : 'None'}/[Category]
          </span>
        </div>

        <div className="h-[420px]">
          <FileTable
            files={filesToOrganize}
            showDestination={true}
            destinationDir={effectiveDestinationDir}
          />
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeOrganization}
        sourceDir={selectedFolder}
        destinationDir={effectiveDestinationDir}
        mode={mode}
        fileCount={filesToOrganize.length}
        categories={Array.from(selectedCategories.size > 0 ? selectedCategories : availableCategories)}
      />

      {/* Completion Summary Modal */}
      {summaryResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Organization Finished!
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {(summaryResult.durationMs / 1000).toFixed(2)} seconds taken
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-800/60 p-4 rounded-xl border border-slate-800 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Processed:</span>
                <span className="font-bold text-slate-200">{summaryResult.totalFiles} files</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Successfully Organized:</span>
                <span className="font-bold text-emerald-400">{summaryResult.successCount} files</span>
              </div>
              {summaryResult.failedCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Failed:</span>
                  <span className="font-bold text-rose-400">{summaryResult.failedCount} files</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-700/50">
                <span className="text-slate-400">Target Folder:</span>
                <span className="font-mono text-[10px] text-indigo-400 truncate max-w-[200px]" title={summaryResult.destinationDir}>
                  {summaryResult.destinationDir}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => desktopApi.openFolder(summaryResult.destinationDir)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <ExternalLink size={13} />
                <span>Open in File Manager</span>
              </button>
              <button
                onClick={() => setSummaryResult(null)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
