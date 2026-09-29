import React, { useState } from 'react';
import { SearchResultItem, SearchMode } from '../lib/types';
import { HighlightText } from './HighlightText';
import { Sparkles, Binary, Compass, Eye, Bookmark, Check, Copy } from 'lucide-react';

interface ResultCardProps {
  item: SearchResultItem;
  searchMode: SearchMode;
  onFindSimilar: (assetId: string) => void;
  onOpenDetails: (item: SearchResultItem) => void;
  onTogglePin?: (assetId: string) => void;
  isPinned?: boolean;
  highlightDifference?: 'only-keyword' | 'only-semantic' | 'both';
  rankInfo?: {
    keywordRank?: number;
    semanticRank?: number;
  };
}

export const ResultCard: React.FC<ResultCardProps> = ({
  item,
  searchMode,
  onFindSimilar,
  onOpenDetails,
  onTogglePin,
  isPinned = false,
  highlightDifference,
  rankInfo,
}) => {
  const { asset, score, rawScore, matchedTerms, rank } = item;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1200);
  };

  return (
    <article
      className={`group relative flex flex-col justify-between bg-white dark:bg-stone-900 border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        highlightDifference === 'only-keyword'
          ? 'border-blue-300 dark:border-blue-800/80 ring-1 ring-blue-500/20'
          : highlightDifference === 'only-semantic'
          ? 'border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-500/20'
          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
      }`}
    >
      {/* Top Banner for Compare Highlights */}
      {highlightDifference && (
        <div
          className={`px-3 py-1 text-[11px] font-semibold flex items-center justify-between border-b ${
            highlightDifference === 'only-keyword'
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60'
              : highlightDifference === 'only-semantic'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
          }`}
        >
          <span>
            {highlightDifference === 'only-keyword' && 'Keyword Only Hit'}
            {highlightDifference === 'only-semantic' && 'Semantic Only Hit'}
            {highlightDifference === 'both' && 'Present in Both Engines'}
          </span>
          {rankInfo && (
            <span className="font-mono text-[10px]">
              {rankInfo.keywordRank && `K:#${rankInfo.keywordRank}`}
              {rankInfo.keywordRank && rankInfo.semanticRank && ' · '}
              {rankInfo.semanticRank && `S:#${rankInfo.semanticRank}`}
            </span>
          )}
        </div>
      )}

      {/* Image container */}
      <div className="relative aspect-4/3 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
        {/* Placeholder skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 animate-pulse flex items-center justify-center">
            <span className="text-xs text-stone-400 font-mono">Loading studio image...</span>
          </div>
        )}

        <img
          src={asset.image}
          alt={asset.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Fallback pattern */}
        {imageError && (
          <div className="absolute inset-0 bg-stone-200 dark:bg-stone-800 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{asset.title}</span>
            <span className="text-[10px] text-stone-400 font-mono mt-1">{asset.sku} · {asset.material}</span>
          </div>
        )}

        {/* Floating Quick Action Overlays */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
            #{rank}
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Relevance Score Badge */}
            {searchMode === 'keyword' ? (
              <span
                title={`BM25 Raw Score: ${rawScore}`}
                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-blue-600/90 text-white backdrop-blur-md shadow-sm"
              >
                BM25: {score}
              </span>
            ) : (
              <span
                title={`Cosine Sim: ${rawScore}`}
                className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-500/95 text-stone-950 backdrop-blur-md shadow-sm"
              >
                {score}% match
              </span>
            )}

            {/* Pin to moodboard button */}
            {onTogglePin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(asset.id);
                }}
                aria-label={isPinned ? 'Remove from pinboard' : 'Add to pinboard'}
                className={`p-1.5 rounded-md backdrop-blur-md transition-all cursor-pointer shadow-sm ${
                  isPinned
                    ? 'bg-amber-500 text-white'
                    : 'bg-black/50 text-white hover:bg-black/80'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* Quick view button overlay */}
        <button
          type="button"
          onClick={() => onOpenDetails(item)}
          className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-1.5 text-white font-medium text-xs cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Inspect Specifications</span>
        </button>
      </div>

      {/* Body content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Quiet Typographic Metadata Row (Anti-Slop Zero-Pill) */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-mono">
            <span className="font-semibold text-stone-700 dark:text-stone-300">{asset.sku}</span>
            <span aria-hidden="true">·</span>
            <span>{asset.category}</span>
            <span aria-hidden="true">·</span>
            <span>{asset.season}</span>
            <span aria-hidden="true">·</span>
            <span>{asset.gsm} GSM</span>
          </div>

          {/* Title */}
          <h4
            onClick={() => onOpenDetails(item)}
            className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 line-clamp-1 leading-snug cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            {searchMode === 'keyword' ? (
              <HighlightText text={asset.title} terms={matchedTerms} />
            ) : (
              asset.title
            )}
          </h4>

          {/* Description */}
          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
            {searchMode === 'keyword' ? (
              <HighlightText text={asset.description} terms={matchedTerms} />
            ) : (
              asset.description
            )}
          </p>

          {/* Sourcing & Sustainability unboxed line */}
          <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate pt-0.5">
            <span className="font-medium text-stone-700 dark:text-stone-300">{asset.origin}</span>
            <span className="mx-1.5 text-stone-300 dark:text-stone-600">|</span>
            <span className="italic">{asset.sustainabilityCert}</span>
          </div>
        </div>

        {/* Colorway Swatches & Designer */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              {asset.paletteHex.map((hex, idx) => (
                <button
                  key={idx}
                  type="button"
                  title={`Copy hex ${hex}`}
                  onClick={(e) => copyHex(hex, e)}
                  style={{ backgroundColor: hex }}
                  className="w-4 h-4 rounded-full border border-white dark:border-stone-800 shadow-xs hover:scale-125 transition-transform cursor-pointer relative"
                />
              ))}
            </div>
            {copiedHex ? (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                Copied!
              </span>
            ) : (
              <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[120px]">
                {asset.colorway.split('&')[0]}
              </span>
            )}
          </div>

          <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono truncate">
            {asset.designer}
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => onFindSimilar(asset.id)}
          className="w-full mt-2 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800/80 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Find Semantically Similar Assets</span>
        </button>
      </div>
    </article>
  );
};
