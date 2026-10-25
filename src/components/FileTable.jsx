import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  ExternalLink,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FolderOpen,
} from 'lucide-react';
import CategoryBadge, { CATEGORY_ICONS } from './CategoryBadge';
import { desktopApi } from '../services/desktopApi';

export default function FileTable({
  files = [],
  selectedFileIds,
  onToggleSelect,
  onSelectAll,
  showDestination = true,
  destinationDir = '',
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedFiles = useMemo(() => {
    const list = [...files];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [files, sortField, sortOrder]);

  const handleCopyPath = async (file) => {
    await desktopApi.copyPathToClipboard(file.path);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShowInFolder = async (file) => {
    await desktopApi.showItemInFolder(file.path);
  };

  const allSelected = files.length > 0 && selectedFileIds && selectedFileIds.size === files.length;
  const someSelected = selectedFileIds && selectedFileIds.size > 0 && !allSelected;

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 p-8">
        <FolderOpen size={40} className="text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">No files scanned yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Select a folder and click "Scan Directory" to inspect and categorize files.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-slate-800 rounded-xl bg-slate-900/50 overflow-hidden shadow-sm flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 select-none">
              {selectedFileIds && (
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={onSelectAll}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
              )}
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 font-semibold hover:text-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span>File Name</span>
                  {sortField === 'name' ? (
                    sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('category')}
                className="py-3 px-4 font-semibold hover:text-slate-200 cursor-pointer w-36"
              >
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  {sortField === 'category' ? (
                    sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('extension')}
                className="py-3 px-4 font-semibold hover:text-slate-200 cursor-pointer w-24"
              >
                <div className="flex items-center gap-1.5">
                  <span>Ext</span>
                  {sortField === 'extension' ? (
                    sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('size')}
                className="py-3 px-4 font-semibold hover:text-slate-200 cursor-pointer w-28"
              >
                <div className="flex items-center gap-1.5">
                  <span>Size</span>
                  {sortField === 'size' ? (
                    sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </div>
              </th>
              {showDestination && (
                <th className="py-3 px-4 font-semibold text-slate-400">
                  Proposed Target Folder
                </th>
              )}
              <th className="py-3 px-4 font-semibold text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {sortedFiles.map((file) => {
              const isSelected = selectedFileIds ? selectedFileIds.has(file.id) : false;
              const IconComp = CATEGORY_ICONS[file.category] || FileText;

              return (
                <tr
                  key={file.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isSelected ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  {selectedFileIds && (
                    <td className="py-2.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(file.id)}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="py-2.5 px-4 font-medium text-slate-200">
                    <div className="flex items-center gap-2 max-w-md truncate" title={file.name}>
                      <IconComp size={15} className="text-slate-400 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <CategoryBadge category={file.category} size="xs" />
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                    {file.extension}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {file.formattedSize}
                  </td>
                  {showDestination && (
                    <td className="py-2.5 px-4 font-mono text-[11px] text-indigo-400/90 truncate max-w-xs" title={`${destinationDir ? destinationDir + '/' : ''}${file.category}/${file.name}`}>
                      {file.category}/{file.name}
                    </td>
                  )}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-400">
                      <button
                        onClick={() => handleCopyPath(file)}
                        title="Copy full file path"
                        className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      >
                        {copiedId === file.id ? (
                          <Check size={13} className="text-emerald-400" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                      <button
                        onClick={() => handleShowInFolder(file)}
                        title="Reveal in System File Manager"
                        className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
