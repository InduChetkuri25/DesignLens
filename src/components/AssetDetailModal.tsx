import React, { useEffect, useState } from 'react';
import { SearchResultItem, SearchMode } from '../lib/types';
import { X, Compass, Tag, Bookmark, Check, Copy, Factory, ShieldCheck, Weight, Globe } from 'lucide-react';

interface AssetDetailModalProps {
  item: SearchResultItem | null;
  searchMode: SearchMode;
  onClose: () => void;
  onFindSimilar: (assetId: string) => void;
  onTogglePin?: (assetId: string) => void;
  isPinned?: boolean;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  item,
  searchMode,
  onClose,
  onFindSimilar,
  onTogglePin,
  isPinned = false,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const { asset, score, rawScore, rank } = item;

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Asset High-Res Image */}
            <div className="aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 shadow-inner">
              <img
                src={asset.image}
                alt={asset.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Header Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{asset.sku}</span>
                  <span className="text-stone-400">·</span>
                  <span className="text-stone-500">Rank #{rank}</span>
                </div>

                {onTogglePin && (
                  <button
                    type="button"
                    onClick={() => onTogglePin(asset.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isPinned
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                    <span>{isPinned ? 'Pinned' : 'Pin to Moodboard'}</span>
                  </button>
                )}
              </div>

              <div>
                <h3 id="asset-title" className="text-xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
                  {asset.title}
                </h3>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Designed by <span className="font-medium text-stone-800 dark:text-stone-200">{asset.designer}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {asset.description}
              </p>

              {/* Retrieval Score Breakdown */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-1.5 text-xs">
                <div className="font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-between">
                  <span>{searchMode === 'keyword' ? 'BM25 Term Weighting' : 'Cosine Vector Similarity'}</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {score}% (raw: {rawScore})
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  {searchMode === 'keyword'
                    ? 'Evaluated across title (3x), tags (2x), and specs in the BM25 inverted index.'
                    : 'Evaluated via dot product over normalized dense embeddings in high-dimensional vector space.'}
                </div>
              </div>

              {/* Find Similar Action */}
              <button
                type="button"
                onClick={() => {
                  onFindSimilar(asset.id);
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Find Semantically Similar Assets</span>
              </button>
            </div>
          </div>

          {/* Technical Spec Sheet Grid */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3 font-mono">
              Production Specifications & Sourcing
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400">
                  <Factory className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase">Mill Origin</span>
                </div>
                <div className="font-semibold text-stone-800 dark:text-stone-200">{asset.origin}</div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400">
                  <Weight className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase">Fabric Weight</span>
                </div>
                <div className="font-semibold text-stone-800 dark:text-stone-200">{asset.gsm} GSM</div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase">Certification</span>
                </div>
                <div className="font-semibold text-stone-800 dark:text-stone-200 truncate">{asset.sustainabilityCert}</div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase">Drop Cycle</span>
                </div>
                <div className="font-semibold text-stone-800 dark:text-stone-200">{asset.season} · {asset.category}</div>
              </div>
            </div>
          </div>

          {/* Colorway & Swatch Palette */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">Colorway: <strong className="text-stone-900 dark:text-stone-100">{asset.colorway}</strong></span>
              {copiedHex && <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">Copied {copiedHex}</span>}
            </div>

            <div className="flex items-center gap-3">
              {asset.paletteHex.map((hex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => copyHex(hex)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 transition-colors cursor-pointer text-xs font-mono"
                >
                  <span className="w-5 h-5 rounded-lg border border-black/10 shadow-xs" style={{ backgroundColor: hex }} />
                  <span>{hex}</span>
                  <Copy className="w-3 h-3 text-stone-400 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Asset Tags & Keywords</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {asset.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
