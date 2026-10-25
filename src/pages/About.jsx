import React from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  ShieldCheck,
  HardDrive,
  Terminal,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { desktopApi } from '../services/desktopApi';

export default function About({ appInfo }) {
  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
      {/* Hero Card */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 shrink-0">
            <Sparkles size={28} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold mb-2">
              Academic Minor Project
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Smart File Organizer
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              A native desktop application built with Electron.js, React.js, and Node.js for intelligent filesystem scanning, category classification, safe file relocation, and reversible organization.
            </p>
          </div>
        </div>
      </div>

      {/* Project Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Architecture & IPC */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers size={15} className="text-indigo-400" />
            Electron Process Architecture
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Implements Electron’s strict security model:
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li><span className="font-semibold text-slate-200">Main Process:</span> Window lifecycle, native dialogs, filesystem I/O, IPC routing.</li>
            <li><span className="font-semibold text-slate-200">Preload Script:</span> Exposes an isolated, restricted API via <code>contextBridge.exposeInMainWorld</code>.</li>
            <li><span className="font-semibold text-slate-200">Renderer Process:</span> React 18 UI isolated from direct Node.js execution (<code>nodeIntegration: false</code>).</li>
          </ul>
        </div>

        {/* Safety & Reliability Features */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-400" />
            Safety & Filesystem Integrity
          </h4>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li><span className="font-semibold text-slate-200">Collision Protection:</span> Files with duplicate names receive numeric suffixes <code>(1), (2)</code> to prevent overwriting.</li>
            <li><span className="font-semibold text-slate-200">Cross-Device Handling:</span> Gracefully handles <code>EXDEV</code> link errors across drives via copy-and-unlink.</li>
            <li><span className="font-semibold text-slate-200">Reversible Moves:</span> Full operation history with one-click safe Undo capability.</li>
          </ul>
        </div>
      </div>

      {/* Technology Stack & Runtimes */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Cpu size={15} className="text-indigo-400" />
          Runtime Environment & Technologies
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block font-sans">Electron Version</span>
            <span className="text-slate-200 font-semibold">{appInfo?.electronVersion || 'v34.2.0'}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block font-sans">Node.js Runtime</span>
            <span className="text-slate-200 font-semibold">{appInfo?.nodeVersion || 'v25.8.1'}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block font-sans">React & Tooling</span>
            <span className="text-slate-200 font-semibold">React 18 + Vite 6</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-slate-500 text-[10px] block font-sans">Packaging</span>
            <span className="text-slate-200 font-semibold">electron-builder</span>
          </div>
        </div>
      </div>
    </div>
  );
}
