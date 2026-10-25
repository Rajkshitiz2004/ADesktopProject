import React from 'react';
import { AlertCircle, FolderSync, ShieldCheck, X } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  sourceDir,
  destinationDir,
  mode,
  fileCount,
  categories = [],
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${mode === 'move' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <FolderSync size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Confirm File Organization
              </h3>
              <p className="text-xs text-slate-400">
                Verify the operation details before modifying files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-slate-300">
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Operation Mode:</span>
              <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[10px] ${
                mode === 'move'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}>
                {mode === 'move' ? 'Move Mode' : 'Copy Mode'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Files to Process:</span>
              <span className="font-mono font-bold text-slate-200">{fileCount} files</span>
            </div>

            <div className="flex flex-col gap-1 pt-1 border-t border-slate-700/50">
              <span className="text-slate-400">Destination Directory:</span>
              <span className="font-mono text-[11px] text-indigo-400 break-all bg-slate-900/60 p-2 rounded border border-slate-800">
                {destinationDir}
              </span>
            </div>

            {categories.length > 0 && (
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-slate-400">Categories Included:</span>
                <span className="text-[11px] text-slate-300">
                  {categories.join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Safety Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/50 text-indigo-200">
            <ShieldCheck size={18} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Collision Protection Active:</strong> Files with identical names in target category folders will automatically be renamed with numeric suffixes (e.g., <code>report (1).pdf</code>) to prevent accidental overwriting.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-lg text-xs font-semibold text-white shadow-lg transition-all ${
              mode === 'move'
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {mode === 'move' ? 'Confirm & Move Files' : 'Confirm & Copy Files'}
          </button>
        </div>
      </div>
    </div>
  );
}
