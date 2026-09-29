import React from 'react';
import { SearchResultItem } from '../lib/types';
import { ResultCard } from './ResultCard';
import { Binary, Sparkles, SlidersHorizontal, ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface ComparePanelProps {
  keywordResults: SearchResultItem[];
  semanticResults: SearchResultItem[];
  onFindSimilar: (assetId: string) => void;
  onOpenDetails: (item: SearchResultItem) => void;
  keywordLatency: number;
  semanticLatency: number;
}

export const ComparePanel: React.FC<ComparePanelProps> = ({
  keywordResults,
  semanticResults,
  onFindSimilar,
  onOpenDetails,
  keywordLatency,
  semanticLatency,
}) => {
  const keywordIds = new Set(keywordResults.map(r => r.asset.id));
  const semanticIds = new Set(semanticResults.map(r => r.asset.id));

  // Top 10 overlap analysis
  const topKKeyword = keywordResults.slice(0, 10).map(r => r.asset.id);
  const topKSemantic = semanticResults.slice(0, 10).map(r => r.asset.id);
  const commonInTop10 = topKKeyword.filter(id => topKSemantic.includes(id));
  const overlapPct = Math.round((commonInTop10.length / 10) * 100);

  // Maps for ranks
  const keywordRankMap = new Map<string, number>();
  keywordResults.forEach((r, idx) => keywordRankMap.set(r.asset.id, idx + 1));

  const semanticRankMap = new Map<string, number>();
  semanticResults.forEach((r, idx) => semanticRankMap.set(r.asset.id, idx + 1));

  return (
    <div className="w-full space-y-6">
      {/* Comparison Diagnostics Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-stone-50 to-amber-50/70 dark:from-blue-950/20 dark:via-stone-900 dark:to-amber-950/20 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Retrieval Discrepancy & Overlap Analysis
            </h3>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Compare BM25 lexical token frequencies against high-dimensional dense vector embeddings.
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="text-stone-500">Top-10 Overlap:</span>
            <span className="font-mono font-bold text-sm px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {overlapPct}% ({commonInTop10.length}/10)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">BM25 Latency:</span>
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
              {keywordLatency} ms
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">Vector Latency:</span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {semanticLatency} ms
            </span>
          </div>
        </div>
      </div>

      {/* Side by side columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Keyword BM25 */}
        <div className="space-y-4">
          <div className="sticky top-20 z-10 p-3.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/60 backdrop-blur border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-sm text-blue-900 dark:text-blue-200">
                BM25 Keyword Search
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-200/60 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {keywordResults.length} hits
              </span>
            </div>
            <span className="text-[11px] text-blue-700 dark:text-blue-300 font-mono">
              Title x3, Tags x2, Desc x1
            </span>
          </div>

          {keywordResults.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-2xl">
              <p className="text-xs text-stone-500">No exact keyword matches found for this query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {keywordResults.map(item => {
                const inSemantic = semanticIds.has(item.asset.id);
                const diffType = inSemantic ? 'both' : 'only-keyword';
                return (
                  <ResultCard
                    key={`kw-${item.asset.id}`}
                    item={item}
                    searchMode="keyword"
                    onFindSimilar={onFindSimilar}
                    onOpenDetails={onOpenDetails}
                    highlightDifference={diffType}
                    rankInfo={{
                      keywordRank: item.rank,
                      semanticRank: semanticRankMap.get(item.asset.id),
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Semantic Vector Search */}
        <div className="space-y-4">
          <div className="sticky top-20 z-10 p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/60 backdrop-blur border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="font-bold text-sm text-amber-900 dark:text-amber-200">
                Semantic AI Embeddings
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                {semanticResults.length} hits
              </span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-mono">
              Cosine similarity &ge; threshold
            </span>
          </div>

          {semanticResults.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-stone-300 dark:border-stone-800 rounded-2xl">
              <p className="text-xs text-stone-500">No semantic results found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {semanticResults.map(item => {
                const inKeyword = keywordIds.has(item.asset.id);
                const diffType = inKeyword ? 'both' : 'only-semantic';
                return (
                  <ResultCard
                    key={`sem-${item.asset.id}`}
                    item={item}
                    searchMode="semantic"
                    onFindSimilar={onFindSimilar}
                    onOpenDetails={onOpenDetails}
                    highlightDifference={diffType}
                    rankInfo={{
                      keywordRank: keywordRankMap.get(item.asset.id),
                      semanticRank: item.rank,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
