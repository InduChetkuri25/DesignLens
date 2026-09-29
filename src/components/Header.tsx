import React from 'react';
import { Sun, Moon, Sparkles, Activity, Database, Bookmark, LayoutGrid, TableProperties } from 'lucide-react';
import { EmbeddingSource } from '../lib/embeddings';

export type CatalogLayout = 'grid' | 'table';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  embeddingSource: EmbeddingSource;
  isIndexing: boolean;
  totalAssets: number;
  showPerfPanel: boolean;
  onTogglePerfPanel: () => void;
  catalogLayout: CatalogLayout;
  onLayoutChange: (layout: CatalogLayout) => void;
  pinnedCount: number;
  onOpenMoodboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  embeddingSource,
  isIndexing,
  totalAssets,
  showPerfPanel,
  onTogglePerfPanel,
  catalogLayout,
  onLayoutChange,
  pinnedCount,
  onOpenMoodboard,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-stone-900 dark:text-stone-50 font-sans">
                DesignLens
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                · Studio Catalog
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
              Textile & Apparel Semantic Retrieval Intelligence
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Index status indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-500 font-mono">
            <Database className="w-3.5 h-3.5 text-stone-400" />
            <span>{isIndexing ? 'Indexing...' : `${totalAssets} Vectors`}</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                embeddingSource === 'gemini-embedding' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>({embeddingSource === 'gemini-embedding' ? 'Gemini AI' : 'TF-IDF'})</span>
          </div>

          {/* Catalog View Mode Toggle (Grid vs Table) */}
          <div className="hidden sm:inline-flex p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => onLayoutChange('grid')}
              title="Lookbook Grid View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                catalogLayout === 'grid'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange('table')}
              title="Technical Spec Sheet View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                catalogLayout === 'table'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-2xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Moodboard Pinboard Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenMoodboard}
            aria-label="Open moodboard pinboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer border ${
              pinnedCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700/60'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${pinnedCount > 0 ? 'fill-current text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
            <span className="hidden sm:inline">Pinboard</span>
            {pinnedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pinnedCount}
              </span>
            )}
          </button>

          {/* Performance Benchmark Panel Toggle */}
          <button
            type="button"
            onClick={onTogglePerfPanel}
            aria-label="Toggle latency benchmark panel"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer border ${
              showPerfPanel
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Benchmark</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
