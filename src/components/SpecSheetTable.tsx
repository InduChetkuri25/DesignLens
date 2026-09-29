import React from 'react';
import { SearchResultItem, SearchMode } from '../lib/types';
import { Bookmark, Compass, Eye, Sparkles, Binary, Check } from 'lucide-react';

interface SpecSheetTableProps {
  items: SearchResultItem[];
  searchMode: SearchMode;
  onFindSimilar: (assetId: string) => void;
  onOpenDetails: (item: SearchResultItem) => void;
  onTogglePin: (assetId: string) => void;
  pinnedIds: Set<string>;
}

export const SpecSheetTable: React.FC<SpecSheetTableProps> = ({
  items,
  searchMode,
  onFindSimilar,
  onOpenDetails,
  onTogglePin,
  pinnedIds,
}) => {
  return (
    <div className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">Pin</th>
              <th className="py-3 px-3 w-16">Preview</th>
              <th className="py-3 px-3">SKU & Title</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Material & Weight</th>
              <th className="py-3 px-3">Sourcing Origin</th>
              <th className="py-3 px-3">Certification</th>
              <th className="py-3 px-3 text-right">Relevance</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {items.map((item) => {
              const { asset, score, rawScore, rank } = item;
              const isPinned = pinnedIds.has(asset.id);

              return (
                <tr
                  key={asset.id}
                  className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group"
                >
                  {/* Pin checkbox */}
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onTogglePin(asset.id)}
                      aria-label={isPinned ? 'Remove from moodboard' : 'Add to moodboard'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isPinned
                          ? 'bg-amber-500 text-white'
                          : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </td>

                  {/* Thumbnail Image */}
                  <td className="py-3 px-3">
                    <div
                      onClick={() => onOpenDetails(item)}
                      className="w-11 h-11 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 cursor-pointer flex-shrink-0"
                    >
                      <img
                        src={asset.image}
                        alt={asset.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  </td>

                  {/* Title and SKU */}
                  <td className="py-3 px-3">
                    <div className="font-mono text-[10px] text-stone-400 font-semibold">
                      {asset.sku}
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenDetails(item)}
                      className="font-semibold text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 text-left line-clamp-1 cursor-pointer"
                    >
                      {asset.title}
                    </button>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 max-w-xs">
                      {asset.description}
                    </div>
                  </td>

                  {/* Category & Season */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-stone-800 dark:text-stone-200">
                      {asset.category}
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      {asset.season}
                    </div>
                  </td>

                  {/* Material & GSM */}
                  <td className="py-3 px-3">
                    <div className="font-medium text-stone-800 dark:text-stone-200">
                      {asset.material}
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      {asset.gsm} GSM
                    </div>
                  </td>

                  {/* Sourcing Origin */}
                  <td className="py-3 px-3 text-stone-600 dark:text-stone-300">
                    {asset.origin}
                  </td>

                  {/* Certification */}
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      {asset.sustainabilityCert}
                    </span>
                  </td>

                  {/* Relevance Score */}
                  <td className="py-3 px-3 text-right">
                    <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                      {score}%
                    </div>
                    <div className="text-[10px] font-mono text-stone-400">
                      {searchMode === 'keyword' ? `bm25: ${rawScore}` : `cos: ${rawScore}`}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onFindSimilar(asset.id)}
                        title="Find Similar by Vector"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                      >
                        <Compass className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenDetails(item)}
                        title="Inspect Specs"
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
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
};
