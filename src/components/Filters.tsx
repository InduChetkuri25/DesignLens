import React from 'react';
import { FilterState } from '../lib/types';
import { AssetCategory, AssetSeason, AssetMaterial, DESIGN_ASSETS, DesignAsset } from '../data/assets';
import { Filter, RotateCcw, Check, Sparkles, Tag, Calendar, Layers } from 'lucide-react';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  filteredAssets: DesignAsset[];
}

const ALL_CATEGORIES: AssetCategory[] = ['Apparel', 'Footwear', 'Accessories', 'Home Textile', 'Bags'];
const ALL_SEASONS: AssetSeason[] = ['SS25', 'FW25', 'SS26', 'FW26'];
const ALL_MATERIALS: AssetMaterial[] = ['Cotton', 'Linen', 'Wool', 'Leather', 'Recycled Polyester', 'Silk', 'Denim'];

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  filteredAssets,
}) => {
  const activeCount =
    filters.categories.length + filters.seasons.length + filters.materials.length;

  const toggleCategory = (cat: AssetCategory) => {
    const exists = filters.categories.includes(cat);
    onFilterChange({
      ...filters,
      categories: exists ? filters.categories.filter(c => c !== cat) : [...filters.categories, cat],
    });
  };

  const toggleSeason = (season: AssetSeason) => {
    const exists = filters.seasons.includes(season);
    onFilterChange({
      ...filters,
      seasons: exists ? filters.seasons.filter(s => s !== season) : [...filters.seasons, season],
    });
  };

  const toggleMaterial = (mat: AssetMaterial) => {
    const exists = filters.materials.includes(mat);
    onFilterChange({
      ...filters,
      materials: exists ? filters.materials.filter(m => m !== mat) : [...filters.materials, mat],
    });
  };

  const clearAll = () => {
    onFilterChange({
      categories: [],
      seasons: [],
      materials: [],
    });
  };

  // Calculate live counts based on total asset collection with other filters preserved
  const getCategoryCount = (cat: AssetCategory) => {
    return DESIGN_ASSETS.filter(a => {
      if (a.category !== cat) return false;
      if (filters.seasons.length > 0 && !filters.seasons.includes(a.season)) return false;
      if (filters.materials.length > 0 && !filters.materials.includes(a.material)) return false;
      return true;
    }).length;
  };

  const getSeasonCount = (season: AssetSeason) => {
    return DESIGN_ASSETS.filter(a => {
      if (a.season !== season) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(a.category)) return false;
      if (filters.materials.length > 0 && !filters.materials.includes(a.material)) return false;
      return true;
    }).length;
  };

  const getMaterialCount = (mat: AssetMaterial) => {
    return DESIGN_ASSETS.filter(a => {
      if (a.material !== mat) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(a.category)) return false;
      if (filters.seasons.length > 0 && !filters.seasons.includes(a.season)) return false;
      return true;
    }).length;
  };

  return (
    <aside className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
            Facet Filters
          </h3>
          {activeCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-500 text-white text-[11px] font-bold">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Category Section */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          <Tag className="w-3 h-3" />
          <span>Category</span>
        </div>
        <div className="space-y-1">
          {ALL_CATEGORIES.map(cat => {
            const isChecked = filters.categories.includes(cat);
            const count = getCategoryCount(cat);
            return (
              <label
                key={cat}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors duration-100 select-none ${
                  isChecked
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-950 dark:text-amber-200 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{cat}</span>
                </div>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    isChecked
                      ? 'bg-amber-200/50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300'
                      : 'text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800/80'
                  }`}
                >
                  {count}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggleCategory(cat)}
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Season Section */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          <Calendar className="w-3 h-3" />
          <span>Season / Drop</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_SEASONS.map(season => {
            const isChecked = filters.seasons.includes(season);
            const count = getSeasonCount(season);
            return (
              <label
                key={season}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors duration-100 select-none ${
                  isChecked
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 border border-stone-200 dark:border-stone-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                      isChecked ? 'bg-amber-500 text-white' : 'border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <span>{season}</span>
                </div>
                <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                  {count}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggleSeason(season)}
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Material Section */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          <Layers className="w-3 h-3" />
          <span>Material Composition</span>
        </div>
        <div className="space-y-1">
          {ALL_MATERIALS.map(mat => {
            const isChecked = filters.materials.includes(mat);
            const count = getMaterialCount(mat);
            return (
              <label
                key={mat}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors duration-100 select-none ${
                  isChecked
                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-950 dark:text-amber-200 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{mat}</span>
                </div>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    isChecked
                      ? 'bg-amber-200/50 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300'
                      : 'text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800/80'
                  }`}
                >
                  {count}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggleMaterial(mat)}
                />
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
