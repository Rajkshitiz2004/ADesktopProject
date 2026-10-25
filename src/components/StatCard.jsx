import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400',
      glow: 'group-hover:from-indigo-500/5',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'group-hover:from-emerald-500/5',
    },
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400',
      glow: 'group-hover:from-blue-500/5',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      glow: 'group-hover:from-purple-500/5',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'group-hover:from-amber-500/5',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-slate-800/60 dark:bg-slate-800/60 light:bg-white/90 p-5 shadow-sm transition-all duration-300 hover:shadow-md ${scheme.border}`}
    >
      <div
        className={`pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br to-transparent ${scheme.glow}`}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${scheme.iconBg}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-100 dark:text-slate-100 light:text-slate-800">
          {value}
        </span>
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
