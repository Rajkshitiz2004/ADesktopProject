import React from 'react';
import { Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function ProgressPanel({ progress, onClose }) {
  if (!progress) return null;

  const isCompleted = progress.status === 'completed';
  const isFailed = progress.status === 'failed';

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-md p-4 shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : isFailed ? (
            <AlertTriangle size={18} className="text-rose-400" />
          ) : (
            <Loader2 size={18} className="text-indigo-400 animate-spin" />
          )}
          <span className="text-xs font-semibold text-slate-200">
            {isCompleted
              ? 'Operation Completed'
              : progress.status === 'undoing'
              ? 'Undoing Move Operation...'
              : 'Organizing Files...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-indigo-400">
            {progress.percent}%
          </span>
          {isCompleted && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full transition-all duration-150 rounded-full ${
            isCompleted
              ? 'bg-emerald-500'
              : isFailed
              ? 'bg-rose-500'
              : 'bg-indigo-500'
          }`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      {/* Details */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate max-w-[200px]" title={progress.currentFile}>
          {progress.currentFile ? progress.currentFile : 'Finishing up...'}
        </span>
        <span className="font-mono">
          {progress.current} of {progress.total} files
        </span>
      </div>

      {progress.summary && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-emerald-400 font-medium">
            ✓ {progress.summary.successCount} successful
          </span>
          {progress.summary.failedCount > 0 && (
            <span className="text-rose-400 font-medium">
              ✗ {progress.summary.failedCount} failed
            </span>
          )}
          <span className="text-slate-500 font-mono">
            {(progress.summary.durationMs / 1000).toFixed(1)}s
          </span>
        </div>
      )}
    </div>
  );
}
