import React from 'react';
import { DesignAsset } from '../data/assets';
import { X, Bookmark, Download, Trash2, ArrowRight, ExternalLink } from 'lucide-react';

interface MoodboardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedAssets: DesignAsset[];
  onRemovePin: (assetId: string) => void;
  onClearPins: () => void;
  onSelectAsset: (asset: DesignAsset) => void;
}

export const MoodboardDrawer: React.FC<MoodboardDrawerProps> = ({
  isOpen,
  onClose,
  pinnedAssets,
  onRemovePin,
  onClearPins,
  onSelectAsset,
}) => {
  if (!isOpen) return null;

  const exportCSV = () => {
    if (pinnedAssets.length === 0) return;
    const headers = ['SKU', 'Title', 'Category', 'Season', 'Material', 'GSM', 'Origin', 'Certification', 'Designer', 'Colorway'];
    const rows = pinnedAssets.map(a => [
      `"${a.sku}"`,
      `"${a.title.replace(/"/g, '""')}"`,
      `"${a.category}"`,
      `"${a.season}"`,
      `"${a.material}"`,
      a.gsm,
      `"${a.origin}"`,
      `"${a.sustainabilityCert}"`,
      `"${a.designer}"`,
      `"${a.colorway}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `designlens_moodboard_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 h-full shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Design Pinboard & Moodboard
              </h3>
              <p className="text-xs text-stone-500">
                {pinnedAssets.length} saved {pinnedAssets.length === 1 ? 'spec' : 'specs'} for tech pack review
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {pinnedAssets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-stone-400">
              <Bookmark className="w-8 h-8 stroke-[1.5]" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-stone-700 dark:text-stone-300">
                  Your Pinboard is Empty
                </p>
                <p className="text-xs max-w-xs text-stone-500">
                  Bookmark garments and textiles across keyword and semantic search results to compile collection tech packs.
                </p>
              </div>
            </div>
          ) : (
            pinnedAssets.map(asset => (
              <div
                key={asset.id}
                className="group p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 flex items-center gap-3 transition-colors hover:border-stone-300 dark:hover:border-stone-700"
              >
                <img
                  src={asset.image}
                  alt={asset.title}
                  className="w-14 h-14 rounded-lg object-cover bg-stone-200 dark:bg-stone-700 flex-shrink-0 cursor-pointer"
                  onClick={() => onSelectAsset(asset)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-stone-400 font-semibold">{asset.sku}</span>
                    <span className="text-[10px] text-stone-400 font-mono">·</span>
                    <span className="text-[10px] text-stone-500 font-medium">{asset.material}</span>
                  </div>
                  <h4
                    onClick={() => onSelectAsset(asset)}
                    className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer"
                  >
                    {asset.title}
                  </h4>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                    {asset.origin} · {asset.gsm} GSM
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemovePin(asset.id)}
                  title="Remove from board"
                  className="p-1.5 text-stone-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {pinnedAssets.length > 0 && (
          <div className="p-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
            <button
              type="button"
              onClick={exportCSV}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Tech Pack Spec Sheet (CSV)</span>
            </button>

            <button
              type="button"
              onClick={onClearPins}
              className="w-full py-2 px-3 text-stone-500 hover:text-red-600 dark:hover:text-red-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Pinboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
