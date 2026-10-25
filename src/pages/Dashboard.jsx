import React from 'react';
import {
  Files,
  FolderCheck,
  HardDrive,
  FolderSync,
  History,
  ArrowRight,
  FolderOpen,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import CategoryBadge from '../components/CategoryBadge';

export default function Dashboard({
  scanData,
  history,
  onSelectFolder,
  onNavigate,
  onUndoOperation,
}) {
  const stats = scanData?.stats || {
    totalFiles: 0,
    totalFolders: 0,
    formattedTotalSize: '0 B',
    categoryCounts: {},
  };

  // Calculate total organized files across all historical operations
  const totalOrganizedFiles = history.reduce(
    (acc, op) => acc + (op.successCount || 0),
    0
  );

  const categoryEntries = Object.entries(stats.categoryCounts || {}).sort(
    (a, b) => b[1] - a[1]
  );

  const recentOperations = history.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles size={12} />
              <span>Smart Automation Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Organize your cluttered files in seconds
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Categorizes images, documents, spreadsheets, videos, archives, and code files automatically into structured folders with zero data loss.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onSelectFolder}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
            >
              <FolderOpen size={15} />
              <span>{scanData ? 'Change Folder' : 'Select Folder'}</span>
            </button>
            <button
              onClick={() => onNavigate('organize')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <FolderSync size={15} />
              <span>Start Organizing</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Files Scanned"
          value={stats.totalFiles}
          subtitle={scanData?.scannedPath ? `In ${scanData.scannedPath.split(/[\\/]/).pop()}` : 'No active folder scanned'}
          icon={Files}
          color="indigo"
        />
        <StatCard
          title="Files Organized"
          value={totalOrganizedFiles}
          subtitle={`Across ${history.length} operations`}
          icon={FolderCheck}
          color="emerald"
        />
        <StatCard
          title="Folders Detected"
          value={stats.totalFolders}
          subtitle="Directory structure"
          icon={FolderOpen}
          color="blue"
        />
        <StatCard
          title="Storage Scanned"
          value={stats.formattedTotalSize}
          subtitle="Total volume of files"
          icon={HardDrive}
          color="purple"
        />
      </div>

      {/* Two Column Grid: Category Distribution & Recent Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">
              Category Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {stats.totalFiles} items
            </span>
          </div>

          {categoryEntries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
              <Files size={32} className="opacity-40 mb-2" />
              <span>Scan a directory to see category breakdown.</span>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {categoryEntries.map(([category, count]) => {
                const percent = stats.totalFiles > 0 ? Math.round((count / stats.totalFiles) * 100) : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <CategoryBadge category={category} size="xs" />
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                        <span>{count} files</span>
                        <span className="text-slate-500 font-bold">{percent}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Operations */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Recent Organization Runs
              </h3>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all ({history.length})
              </button>
            )}
          </div>

          {recentOperations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
              <FolderSync size={32} className="opacity-40 mb-2" />
              <span>No organization operations run yet.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60 flex-1 overflow-y-auto">
              {recentOperations.map((op) => (
                <div
                  key={op.id || op.operationId}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded border ${
                        op.mode === 'move'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      }`}>
                        {op.mode}
                      </span>
                      <span className="font-semibold text-slate-200 truncate">
                        {op.successCount} files organized
                      </span>
                      {op.undone && (
                        <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                          Undone
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate font-mono" title={op.destinationDir}>
                      {op.destinationDir}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(op.timestamp || op.createdAt).toLocaleDateString()}
                    </span>
                    {op.mode === 'move' && !op.undone && onUndoOperation && (
                      <button
                        onClick={() => onUndoOperation(op)}
                        title="Undo this move operation"
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors"
                      >
                        <RotateCcw size={12} />
                        <span>Undo</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
