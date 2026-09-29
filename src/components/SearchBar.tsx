import React, { useState, useEffect, useRef, useId } from 'react';
import { Search, X, Sparkles, Binary, Columns3, ArrowRight, CornerDownLeft, Tag, Layers, Feather } from 'lucide-react';
import { SearchMode } from '../lib/types';
import { DESIGN_ASSETS } from '../data/assets';

interface SuggestionItem {
  id: string;
  text: string;
  type: 'title' | 'tag' | 'material' | 'category';
  detail?: string;
}

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  isIndexing: boolean;
  totalResults: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  searchMode,
  onSearchModeChange,
  isIndexing,
  totalResults,
}) => {
  const [inputValue, setInputValue] = useState(query);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Sync external query if updated (e.g. from sample queries or find similar)
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  // Debounced typeahead suggestion generation (200ms)
  useEffect(() => {
    const trimmed = inputValue.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      const results: SuggestionItem[] = [];
      const seen = new Set<string>();

      // 0. Check SKUs
      for (const asset of DESIGN_ASSETS) {
        if (asset.sku.toLowerCase().includes(trimmed) && !seen.has(asset.sku)) {
          seen.add(asset.sku);
          results.push({
            id: `sku-${asset.id}`,
            text: asset.sku,
            type: 'title',
            detail: asset.title,
          });
          if (results.length >= 2) break;
        }
      }

      // 1. Check Titles
      for (const asset of DESIGN_ASSETS) {
        if (asset.title.toLowerCase().includes(trimmed) && !seen.has(asset.title)) {
          seen.add(asset.title);
          results.push({
            id: `title-${asset.id}`,
            text: asset.title,
            type: 'title',
            detail: `${asset.category} • ${asset.material}`,
          });
          if (results.length >= 4) break;
        }
      }

      // 2. Check Tags
      for (const asset of DESIGN_ASSETS) {
        for (const tag of asset.tags) {
          const lowerTag = tag.toLowerCase();
          if (lowerTag.includes(trimmed) && !seen.has(lowerTag)) {
            seen.add(lowerTag);
            results.push({
              id: `tag-${tag}`,
              text: tag,
              type: 'tag',
              detail: 'Tag filter',
            });
            if (results.length >= 7) break;
          }
        }
        if (results.length >= 7) break;
      }

      // 3. Check Materials
      const materials = ['Cotton', 'Linen', 'Wool', 'Leather', 'Recycled Polyester', 'Silk', 'Denim'];
      for (const mat of materials) {
        if (mat.toLowerCase().includes(trimmed) && !seen.has(mat.toLowerCase())) {
          seen.add(mat.toLowerCase());
          results.push({
            id: `mat-${mat}`,
            text: mat,
            type: 'material',
            detail: 'Material spec',
          });
        }
      }

      // 4. Check Categories
      const categories = ['Apparel', 'Footwear', 'Accessories', 'Home Textile', 'Bags'];
      for (const cat of categories) {
        if (cat.toLowerCase().includes(trimmed) && !seen.has(cat.toLowerCase())) {
          seen.add(cat.toLowerCase());
          results.push({
            id: `cat-${cat}`,
            text: cat,
            type: 'category',
            detail: 'Category',
          });
        }
      }

      setSuggestions(results.slice(0, 8));
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    }, 200);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onQueryChange(val);
  };

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setInputValue(item.text);
    onQueryChange(item.text);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onQueryChange(inputValue);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else {
        onQueryChange(inputValue);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const clearQuery = () => {
    setInputValue('');
    onQueryChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full space-y-4">
      {/* Top bar with Search Mode toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            Catalog Retrieval
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              60 Assets
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Query across textile structures, seasons, silhouettes, and aesthetic concepts
          </p>
        </div>

        {/* Engine switcher toggle */}
        <div
          role="radiogroup"
          aria-label="Search Engine Mode"
          className="inline-flex p-1 rounded-xl bg-stone-200/80 dark:bg-stone-800/80 border border-stone-300/60 dark:border-stone-700/60 shadow-inner"
        >
          <button
            type="button"
            role="radio"
            aria-checked={searchMode === 'keyword'}
            onClick={() => onSearchModeChange('keyword')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              searchMode === 'keyword'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Keyword (BM25)</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={searchMode === 'semantic'}
            onClick={() => onSearchModeChange('semantic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              searchMode === 'semantic'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Semantic (AI)</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={searchMode === 'compare'}
            onClick={() => onSearchModeChange('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              searchMode === 'compare'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm border border-stone-200 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Compare</span>
          </button>
        </div>
      </div>

      {/* Main Search Input & Typeahead Container */}
      <div ref={containerRef} className="relative w-full">
        <div className="relative flex items-center">
          <div className="absolute left-4 pointer-events-none flex items-center text-stone-400 dark:text-stone-500">
            {searchMode === 'semantic' ? (
              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            ) : searchMode === 'compare' ? (
              <Columns3 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Search className="w-5 h-5 text-stone-400" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={
              highlightedIndex >= 0 ? `suggestion-${suggestions[highlightedIndex]?.id}` : undefined
            }
            aria-label="Search design catalog"
            placeholder={
              searchMode === 'semantic'
                ? 'Describe materials, moods, or scenarios (e.g., "breathable summer fabric for beach", "warm winter coat")...'
                : searchMode === 'compare'
                ? 'Compare Keyword BM25 vs Semantic retrieval for any query...'
                : 'Search title, tags, or description with BM25 keyword matching...'
            }
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            className="w-full pl-12 pr-28 py-3.5 text-sm sm:text-base bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-2xl shadow-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 dark:focus:border-amber-400 transition-all duration-150"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {inputValue && (
              <button
                type="button"
                onClick={clearQuery}
                aria-label="Clear search input"
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60 text-[11px] font-mono text-stone-500 dark:text-stone-400">
              <CornerDownLeft className="w-3 h-3" />
              <span>Search</span>
            </div>
          </div>
        </div>

        {/* Typeahead Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Typeahead suggestions"
            className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <div className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center justify-between border-b border-stone-100 dark:border-stone-800/80 mb-1">
              <span>Suggestions</span>
              <span className="font-normal font-mono text-[10px]">Use ↑↓ to navigate</span>
            </div>

            {suggestions.map((item, index) => {
              const isSelected = highlightedIndex === index;
              return (
                <div
                  key={item.id}
                  id={`suggestion-${item.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 mx-1.5 rounded-xl cursor-pointer transition-colors duration-100 ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-950 dark:text-amber-200'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex-shrink-0">
                      {item.type === 'title' && <Feather className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />}
                      {item.type === 'tag' && <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                      {item.type === 'material' && <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      {item.type === 'category' && <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </span>
                    <div className="truncate">
                      <span className="text-sm font-medium">{item.text}</span>
                      {item.detail && (
                        <span className="ml-2 text-xs text-stone-400 dark:text-stone-500 hidden sm:inline">
                          ({item.detail})
                        </span>
                      )}
                    </div>
                  </div>

                  <ArrowRight className={`w-3.5 h-3.5 transition-opacity ${isSelected ? 'opacity-100 text-amber-600 dark:text-amber-400' : 'opacity-0'}`} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
