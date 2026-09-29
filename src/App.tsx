import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DESIGN_ASSETS, DesignAsset } from './data/assets';
import {
  FilterState,
  SearchMode,
  SearchParams,
  SearchResultItem,
  LatencyRecord,
} from './lib/types';
import { BM25KeywordSearchEngine } from './lib/keywordSearch';
import { SemanticSearchEngine } from './lib/semanticSearch';
import { EmbeddingsManager, EmbeddingProgress, EmbeddingSource } from './lib/embeddings';
import { runBruteForceBaseline } from './lib/bruteForceBaseline';

import { Header, CatalogLayout } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Filters } from './components/Filters';
import { ActiveFilterChips } from './components/ActiveFilterChips';
import { ResultCard } from './components/ResultCard';
import { SpecSheetTable } from './components/SpecSheetTable';
import { ComparePanel } from './components/ComparePanel';
import { LatencyChart } from './components/LatencyChart';
import { SkeletonLoader } from './components/SkeletonLoader';
import { EmptyState } from './components/EmptyState';
import { AssetDetailModal } from './components/AssetDetailModal';
import { MoodboardDrawer } from './components/MoodboardDrawer';
import { ConceptExplainabilityBanner } from './components/ConceptExplainabilityBanner';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('designlens_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('designlens_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('designlens_dark_mode', 'false');
    }
  }, [darkMode]);

  // Catalog Layout View (Grid vs Spec Table)
  const [catalogLayout, setCatalogLayout] = useState<CatalogLayout>('grid');

  // Pinned Moodboard State
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('designlens_pinned_ids');
        if (saved) return new Set(JSON.parse(saved));
      } catch {
        // Ignore JSON error
      }
    }
    return new Set<string>();
  });

  const [isMoodboardOpen, setIsMoodboardOpen] = useState(false);

  const togglePin = useCallback((assetId: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      try {
        localStorage.setItem('designlens_pinned_ids', JSON.stringify(Array.from(next)));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const clearPins = useCallback(() => {
    setPinnedIds(new Set());
    localStorage.removeItem('designlens_pinned_ids');
  }, []);

  const pinnedAssets = useMemo(() => {
    return DESIGN_ASSETS.filter((a) => pinnedIds.has(a.id));
  }, [pinnedIds]);

  // Engines instances
  const keywordEngine = useMemo(() => new BM25KeywordSearchEngine(DESIGN_ASSETS), []);
  const semanticEngine = useMemo(() => new SemanticSearchEngine(DESIGN_ASSETS), []);
  const embeddingsManager = useMemo(() => EmbeddingsManager.getInstance(), []);

  // Search & Filter State
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('semantic');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    seasons: [],
    materials: [],
  });

  // Indexing & Engine state
  const [isIndexing, setIsIndexing] = useState(true);
  const [indexProgress, setIndexProgress] = useState<EmbeddingProgress | null>(null);
  const [embeddingSource, setEmbeddingSource] = useState<EmbeddingSource>('gemini-embedding');

  // Results State
  const [keywordResults, setKeywordResults] = useState<SearchResultItem[]>([]);
  const [semanticResults, setSemanticResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Latency & Benchmark state
  const [currentKeywordMs, setCurrentKeywordMs] = useState(0.8);
  const [currentSemanticMs, setCurrentSemanticMs] = useState(1.4);
  const [currentBruteForceMs, setCurrentBruteForceMs] = useState(2.9);
  const [latencyHistory, setLatencyHistory] = useState<LatencyRecord[]>([]);
  const [showPerfPanel, setShowPerfPanel] = useState(false);

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);

  // Initialize embeddings on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      setIsIndexing(true);
      try {
        await embeddingsManager.initialize((p) => {
          if (isMounted) {
            setIndexProgress(p);
            setEmbeddingSource(p.source);
          }
        });
      } catch (err) {
        console.error('Failed to initialize embeddings:', err);
      } finally {
        if (isMounted) {
          setIsIndexing(false);
          setEmbeddingSource(embeddingsManager.getSource());
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [embeddingsManager]);

  // Execute search across engines
  const executeSearch = useCallback(
    async (
      q: string,
      currentFilters: FilterState,
      customVector?: number[]
    ) => {
      setIsSearching(true);
      const params: SearchParams = {
        query: q,
        filters: currentFilters,
        limit: 60,
        customVector,
      };

      try {
        // 1. Keyword search (BM25)
        const kwRes = await keywordEngine.search(params);
        setKeywordResults(kwRes.results);
        setCurrentKeywordMs(kwRes.latencyMs);

        // 2. Semantic search (Vector embeddings)
        const semRes = await semanticEngine.search(params);
        setSemanticResults(semRes.results);
        setCurrentSemanticMs(semRes.latencyMs);

        // 3. Brute-force baseline naive scan
        const bfRes = runBruteForceBaseline(params, DESIGN_ASSETS);
        setCurrentBruteForceMs(bfRes.latencyMs);

        // Record benchmark history (up to last 20 queries)
        const newRecord: LatencyRecord = {
          id: Math.random().toString(36).substring(2, 9),
          query: q.trim(),
          timestamp: Date.now(),
          keywordMs: kwRes.latencyMs,
          semanticMs: semRes.latencyMs,
          bruteForceMs: bfRes.latencyMs,
        };

        setLatencyHistory((prev) => [...prev.slice(-19), newRecord]);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [keywordEngine, semanticEngine]
  );

  // Run search when query, filters, or indexing state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(query, filters);
    }, 150);

    return () => clearTimeout(timer);
  }, [query, filters, isIndexing, executeSearch]);

  // "Find similar" handler: uses asset embedding vector directly
  const handleFindSimilar = useCallback(
    async (assetId: string) => {
      const asset = DESIGN_ASSETS.find((a) => a.id === assetId);
      if (!asset) return;

      const vector = embeddingsManager.getVector(assetId);
      if (vector && vector.length > 0) {
        setQuery(`Similar to: ${asset.title}`);
        if (searchMode === 'keyword') setSearchMode('semantic');
        await executeSearch('', filters, vector);
        window.scrollTo({ top: 140, behavior: 'smooth' });
      }
    },
    [embeddingsManager, executeSearch, filters, searchMode]
  );

  // Displayed items based on active search mode
  const displayedItems = searchMode === 'keyword' ? keywordResults : semanticResults;

  // Filtered assets for counting
  const candidateAssets = useMemo(() => {
    return DESIGN_ASSETS.filter((asset) => {
      if (filters.categories.length > 0 && !filters.categories.includes(asset.category)) return false;
      if (filters.seasons.length > 0 && !filters.seasons.includes(asset.season)) return false;
      if (filters.materials.length > 0 && !filters.materials.includes(asset.material)) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-150">
      {/* Top Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        embeddingSource={embeddingSource}
        isIndexing={isIndexing}
        totalAssets={DESIGN_ASSETS.length}
        showPerfPanel={showPerfPanel}
        onTogglePerfPanel={() => setShowPerfPanel((prev) => !prev)}
        catalogLayout={catalogLayout}
        onLayoutChange={setCatalogLayout}
        pinnedCount={pinnedIds.size}
        onOpenMoodboard={() => setIsMoodboardOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Search Bar & Mode Switcher */}
        <SearchBar
          query={query}
          onQueryChange={(newQuery) => setQuery(newQuery)}
          searchMode={searchMode}
          onSearchModeChange={(newMode) => setSearchMode(newMode)}
          isIndexing={isIndexing}
          totalResults={displayedItems.length}
        />

        {/* Semantic Concept Explainability Banner */}
        <ConceptExplainabilityBanner query={query} searchMode={searchMode} />

        {/* Performance Benchmark Panel */}
        {showPerfPanel && (
          <LatencyChart
            history={latencyHistory}
            currentKeywordMs={currentKeywordMs}
            currentSemanticMs={currentSemanticMs}
            currentBruteForceMs={currentBruteForceMs}
          />
        )}

        {/* Content Layout: Filters Sidebar + Results Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Sidebar Filters */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Filters
              filters={filters}
              onFilterChange={setFilters}
              filteredAssets={candidateAssets}
            />
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-5">
            {/* Active Filter Chips & Feedback Bar */}
            <ActiveFilterChips
              filters={filters}
              onFilterChange={setFilters}
              totalResults={
                searchMode === 'compare'
                  ? Math.max(keywordResults.length, semanticResults.length)
                  : displayedItems.length
              }
              searchMode={searchMode}
              query={query}
            />

            {/* Skeleton Loading State during Vector Indexing */}
            {isIndexing ? (
              <SkeletonLoader progress={indexProgress} />
            ) : searchMode === 'compare' ? (
              /* Compare Mode: Side-by-side view */
              <ComparePanel
                keywordResults={keywordResults}
                semanticResults={semanticResults}
                onFindSimilar={handleFindSimilar}
                onOpenDetails={setSelectedItem}
                keywordLatency={currentKeywordMs}
                semanticLatency={currentSemanticMs}
              />
            ) : displayedItems.length === 0 ? (
              /* Empty state */
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 sm:p-10 shadow-sm">
                <EmptyState
                  onSelectQuery={(q) => {
                    setQuery(q);
                    setSearchMode('semantic');
                  }}
                  isNoResults={candidateAssets.length === 0 || query.length > 0}
                />
              </div>
            ) : catalogLayout === 'table' ? (
              /* Professional Sourcing Spec Sheet Table View */
              <SpecSheetTable
                items={displayedItems}
                searchMode={searchMode}
                onFindSimilar={handleFindSimilar}
                onOpenDetails={setSelectedItem}
                onTogglePin={togglePin}
                pinnedIds={pinnedIds}
              />
            ) : (
              /* Editorial Lookbook Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {displayedItems.map((item) => (
                  <ResultCard
                    key={`${searchMode}-${item.asset.id}`}
                    item={item}
                    searchMode={searchMode}
                    onFindSimilar={handleFindSimilar}
                    onOpenDetails={setSelectedItem}
                    onTogglePin={togglePin}
                    isPinned={pinnedIds.has(item.asset.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Asset Specifications Detail Modal */}
      <AssetDetailModal
        item={selectedItem}
        searchMode={searchMode}
        onClose={() => setSelectedItem(null)}
        onFindSimilar={handleFindSimilar}
        onTogglePin={togglePin}
        isPinned={selectedItem ? pinnedIds.has(selectedItem.asset.id) : false}
      />

      {/* Slide-over Moodboard Pinboard Drawer */}
      <MoodboardDrawer
        isOpen={isMoodboardOpen}
        onClose={() => setIsMoodboardOpen(false)}
        pinnedAssets={pinnedAssets}
        onRemovePin={togglePin}
        onClearPins={clearPins}
        onSelectAsset={(asset) => {
          setSelectedItem({
            asset,
            score: 100,
            rawScore: 1.0,
            matchedTerms: [],
            rank: 1,
          });
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-950/50 py-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700 dark:text-stone-300">DesignLens</span>
            <span>&bull;</span>
            <span>Fashion & Textile Semantic Sourcing Intelligence</span>
          </div>
          <div className="font-mono text-[11px] text-stone-400">
            Gemini Embeddings · BM25 Inverted Index · FAISS Simulation
          </div>
        </div>
      </footer>
    </div>
  );
}
