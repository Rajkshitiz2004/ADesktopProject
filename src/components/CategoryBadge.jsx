import React from 'react';
import {
  Image,
  FileText,
  Table,
  Presentation,
  Video,
  Music,
  Archive,
  Code,
  Terminal,
  FileQuestion,
} from 'lucide-react';

export const CATEGORY_ICONS = {
  Images: Image,
  Documents: FileText,
  Spreadsheets: Table,
  Presentations: Presentation,
  Videos: Video,
  Audio: Music,
  Archives: Archive,
  Code: Code,
  Executables: Terminal,
  Other: FileQuestion,
};

export const CATEGORY_STYLES = {
  Images: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Documents: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Spreadsheets: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  Presentations: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Videos: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  Audio: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  Archives: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  Code: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  Executables: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export default function CategoryBadge({ category, count, size = 'sm', className = '' }) {
  const IconComponent = CATEGORY_ICONS[category] || FileQuestion;
  const styleClass = CATEGORY_STYLES[category] || CATEGORY_STYLES.Other;

  const sizeClasses = size === 'xs'
    ? 'text-xs px-2 py-0.5 gap-1'
    : size === 'md'
    ? 'text-sm px-3 py-1 gap-2'
    : 'text-xs px-2.5 py-1 gap-1.5';

  const iconSizes = size === 'xs' ? 12 : size === 'md' ? 16 : 14;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeClasses} ${styleClass} ${className}`}
    >
      <IconComponent size={iconSizes} className="shrink-0" />
      <span>{category}</span>
      {count !== undefined && (
        <span className="ml-1 opacity-75 font-mono text-[10px]">({count})</span>
      )}
    </span>
  );
}
