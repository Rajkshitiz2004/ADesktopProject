import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  FileQuestion,
  Layers,
  HardDrive,
  Calendar,
} from 'lucide-react';
import FileTable from '../components/FileTable';
import CategoryBadge from '../components/CategoryBadge';

export default function FileExplorer({ scanData }) {
  const files = scanData?.files || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedExtension, setSelectedExtension] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL'); // 'ALL' | '<1MB' | '1-10MB' | '10-100MB' | '>100MB'

  // Extract distinct extensions
  const availableExtensions = useMemo(() => {
    const set = new Set();
    files.forEach((f) => {
      if (f.extension && f.extension !== 'NONE') {
        set.add(f.extension);
      }
    });
    return Array.from(set).sort();
  }, [files]);

  // Extract distinct categories
  const availableCategories = useMemo(() => {
    const set = new Set();
    files.forEach((f) => set.add(f.category));
    return Array.from(set).sort();
  }, [files]);

  // Filter logic
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!file.name.toLowerCase().includes(q)) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL' && file.category !== selectedCategory) {
        return false;
      }

      // 3. Extension Filter
      if (selectedExtension !== 'ALL' && file.extension !== selectedExtension) {
        return false;
      }

      // 4. File Size Filter
      if (sizeFilter !== 'ALL') {
        const mb = file.size / (1024 * 1024);
        if (sizeFilter === '<1MB' && mb >= 1) return false;
        if (sizeFilter === '1-10MB' && (mb < 1 || mb > 10)) return false;
        if (sizeFilter === '10-100MB' && (mb < 10 || mb > 100)) return false;
        if (sizeFilter === '>100MB' && mb <= 100) return false;
      }

      return true;
    });
  }, [files, searchQuery, selectedCategory, selectedExtension, sizeFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedExtension('ALL');
    setSizeFilter('ALL');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'ALL' ||
    selectedExtension !== 'ALL' ||
    sizeFilter !== 'ALL';

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Search & Filter Header Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search filenames in directory..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors shrink-0"
            >
              <X size={13} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns & Category Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Layers size={12} className="text-indigo-400" />
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="ALL">All Categories ({files.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({files.filter((f) => f.category === cat).length})
                </option>
              ))}
            </select>
          </div>

          {/* Extension Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Filter size={12} className="text-indigo-400" />
              Extension
            </label>
            <select
              value={selectedExtension}
              onChange={(e) => setSelectedExtension(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="ALL">All Extensions</option>
              {availableExtensions.map((ext) => (
                <option key={ext} value={ext}>
                  .{ext} ({files.filter((f) => f.extension === ext).length})
                </option>
              ))}
            </select>
          </div>

          {/* File Size Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <HardDrive size={12} className="text-indigo-400" />
              Size Range
            </label>
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="ALL">Any Size</option>
              <option value="<1MB">Small (&lt; 1 MB)</option>
              <option value="1-10MB">Medium (1 MB - 10 MB)</option>
              <option value="10-100MB">Large (10 MB - 100 MB)</option>
              <option value=">100MB">Very Large (&gt; 100 MB)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Explorer Results View */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">
            Showing {filteredFiles.length} of {files.length} scanned files
          </span>
          {scanData?.scannedPath && (
            <span className="font-mono text-[11px] text-slate-500 truncate max-w-sm">
              Path: {scanData.scannedPath}
            </span>
          )}
        </div>

        <div className="h-[520px]">
          <FileTable files={filteredFiles} showDestination={false} />
        </div>
      </div>
    </div>
  );
}
