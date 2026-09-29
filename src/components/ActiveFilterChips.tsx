import React from 'react';
import { FilterState, SearchMode } from '../lib/types';
import { X, Sparkles, Binary, SlidersHorizontal } from 'lucide-react';

interface ActiveFilterChipsProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  totalResults: number;
  searchMode: SearchMode;
  query: string;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  onFilterChange,
  totalResults,
  searchMode,
  query,
}) => {
  const hasFilters =
    filters.categories.length > 0 ||
    filters.seasons.length > 0 ||
    filters.materials.length > 0;

  const removeCategory = (cat: string) => {
    onFilterChange({
      ...filters,
      categories: filters.categories.filter(c => c !== cat),
    });
  };

  const removeSeason = (season: string) => {
    onFilterChange({
      ...filters,
      seasons: filters.seasons.filter(s => s !== season),
    });
  };

  const removeMaterial = (mat: string) => {
    onFilterChange({
      ...filters,
      materials: filters.materials.filter(m => m !== mat),
    });
  };

  const clearAll = () => {
    onFilterChange({
      categories: [],
      seasons: [],
      materials: [],
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 py-1">
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="font-semibold text-stone-700 dark:text-stone-300">
          Showing <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{totalResults}</span> matches
        </span>

        {query && (
          <span className="text-stone-400 dark:text-stone-500">
            for &ldquo;<span className="text-stone-800 dark:text-stone-200 font-medium">{query}</span>&rdquo;
          </span>
        )}

        {/* Engine mode chip */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
            searchMode === 'semantic'
              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50'
              : searchMode === 'compare'
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50'
              : 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50'
          }`}
        >
          {searchMode === 'semantic' && <Sparkles className="w-3 h-3" />}
          {searchMode === 'compare' && <SlidersHorizontal className="w-3 h-3" />}
          {searchMode === 'keyword' && <Binary className="w-3 h-3" />}
          <span>
            {searchMode === 'semantic'
              ? 'Semantic Embeddings'
              : searchMode === 'compare'
              ? 'Dual Engine Compare'
              : 'BM25 Keyword Scoring'}
          </span>
        </span>

        {/* Filter chips */}
        {filters.categories.map(cat => (
          <span
            key={cat}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-700"
          >
            <span>Category: {cat}</span>
            <button
              type="button"
              onClick={() => removeCategory(cat)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 ml-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {filters.seasons.map(season => (
          <span
            key={season}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-700"
          >
            <span>Season: {season}</span>
            <button
              type="button"
              onClick={() => removeSeason(season)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 ml-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {filters.materials.map(mat => (
          <span
            key={mat}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-200/80 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-700"
          >
            <span>Material: {mat}</span>
            <button
              type="button"
              onClick={() => removeMaterial(mat)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 ml-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
        >
          Reset filters
        </button>
      )}
    </div>
  );
};
