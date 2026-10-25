import React, { useState } from 'react';
import {
  History as HistoryIcon,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { desktopApi } from '../services/desktopApi';

export default function History({ history = [], onUndoOperation, onClearHistory }) {
  const [expandedId, setExpandedId] = useState(null);
  const [isUndoing, setIsUndoing] = useState(false);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleUndo = async (op) => {
    const confirmed = await desktopApi.showConfirmDialog({
      title: 'Undo File Organization',
      message: `Restore ${op.successCount} files back to their original locations?`,
      detail: `This will move the files from ${op.destinationDir} back to ${op.sourceDirectory || 'their original folders'}.`,
      buttons: ['Cancel', 'Yes, Restore Files'],
      defaultId: 1,
    });

    if (!confirmed) return;

    setIsUndoing(true);
    try {
      await onUndoOperation(op);
    } catch (err) {
      alert(`Undo failed: ${err.message}`);
    } finally {
      setIsUndoing(false);
    }
  };

  const handleClear = async () => {
    const confirmed = await desktopApi.showConfirmDialog({
      title: 'Clear Operation History',
      message: 'Are you sure you want to clear all history records?',
      detail: 'This will erase the logs from local storage. Files on your computer will not be touched.',
      buttons: ['Cancel', 'Clear All History'],
      defaultId: 1,
    });

    if (confirmed) {
      await onClearHistory();
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 p-8 animate-in fade-in duration-200">
        <HistoryIcon size={44} className="text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">No Operations Recorded</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          When you organize files with Smart File Organizer, detailed logs and undo snapshots will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-200">
            Operation History ({history.length} operations)
          </h3>
          <p className="text-xs text-slate-400">
            Audit trail of file moves, copies, and reversible transactions
          </p>
        </div>

        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-900/40 bg-slate-900 hover:bg-rose-950/20 text-xs font-semibold text-rose-400 transition-colors"
        >
          <Trash2 size={13} />
          <span>Clear History</span>
        </button>
      </div>

      {/* Operations List */}
      <div className="space-y-3">
        {history.map((op) => {
          const isExpanded = expandedId === (op.id || op.operationId);
          const isMove = op.mode === 'move';
          const canUndo = isMove && !op.undone;

          return (
            <div
              key={op.id || op.operationId}
              className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
            >
              {/* Summary Bar */}
              <div className="p-4 flex items-center justify-between gap-4 select-none">
                <div
                  onClick={() => toggleExpand(op.id || op.operationId)}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                >
                  <button className="text-slate-400 hover:text-white p-0.5">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  <span
                    className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded border shrink-0 ${
                      isMove
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                    }`}
                  >
                    {op.mode}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {op.successCount} files organized
                      </span>
                      {op.undone && (
                        <span className="bg-slate-700/80 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                          Undone
                        </span>
                      )}
                      {op.failedCount > 0 && (
                        <span className="text-rose-400 text-[11px] font-medium">
                          ({op.failedCount} errors)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                      <span className="truncate" title={op.destinationDir}>
                        Target: {op.destinationDir}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(op.timestamp || op.createdAt).toLocaleString()}
                  </span>

                  {canUndo && (
                    <button
                      onClick={() => handleUndo(op)}
                      disabled={isUndoing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
                    >
                      <RotateCcw size={12} />
                      <span>Undo</span>
                    </button>
                  )}

                  <button
                    onClick={() => desktopApi.openFolder(op.destinationDir)}
                    title="Open destination folder in system file manager"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded File List */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                  <div className="pt-3 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">
                      Files Organized in this Batch:
                    </span>
                    <span className="font-mono text-[10px]">
                      Operation ID: {op.id || op.operationId}
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/80 divide-y divide-slate-800/50">
                    {(op.operations || []).map((fileOp, idx) => (
                      <div
                        key={fileOp.id || idx}
                        className="p-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-slate-200 truncate">
                            {fileOp.filename}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono truncate" title={fileOp.originalPath}>
                            From: {fileOp.originalPath}
                          </p>
                          <p className="text-[10px] text-indigo-400/90 font-mono truncate" title={fileOp.newPath}>
                            To: {fileOp.newPath}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-mono text-slate-400 block">
                            {fileOp.formattedSize || ''}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-medium">
                            ✓ {fileOp.category}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Errors if any */}
                    {(op.errors || []).map((errOp, idx) => (
                      <div
                        key={`err_${idx}`}
                        className="p-2.5 flex items-center justify-between gap-3 text-xs bg-rose-950/20"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-rose-300 truncate">
                            {errOp.filename}
                          </p>
                          <p className="text-[10px] text-rose-400 font-mono truncate">
                            Error: {errOp.error}
                          </p>
                        </div>
                        <span className="text-[10px] text-rose-400 font-bold shrink-0">
                          FAILED
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
