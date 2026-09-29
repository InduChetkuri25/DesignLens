import React from 'react';
import { Sparkles, Search, Lightbulb, ArrowUpRight } from 'lucide-react';

interface EmptyStateProps {
  onSelectQuery: (query: string) => void;
  isNoResults?: boolean;
}

const EXAMPLE_QUERIES = [
  {
    query: 'breathable summer fabric for beach',
    explanation: 'Matches linen tunics, espadrilles & gauze throws without requiring exact word "beach"',
    tag: 'Semantic Concept',
  },
  {
    query: 'warm winter outerwear',
    explanation: 'Finds heavy shearling parkas, alpaca coats, and thermal merino fleece',
    tag: 'Seasonal Climatology',
  },
  {
    query: 'lightweight linen for summer',
    explanation: 'Highlights airy open-weave chore jackets and relaxed slub pillows',
    tag: 'Material Specific',
  },
  {
    query: 'sustainable winter jacket',
    explanation: 'Retrieves recycled plastic fleece vests and insulated storm macs',
    tag: 'Eco-Craft',
  },
  {
    query: 'minimal leather accessories',
    explanation: 'Uncovers hand-burnished cardholders, braided belts, and lambskin bags',
    tag: 'Aesthetic Silhouette',
  },
  {
    query: 'waterproof rainy day commuting',
    explanation: 'Finds seam-sealed roll-top packs, mac trenches, and Aquaguard bags',
    tag: 'Functional Utility',
  },
  {
    query: 'artisan heritage craftsmanship',
    explanation: 'Ranks shuttle-loomed selvedge denim and Goodyear welted leather boots',
    tag: 'Artisanal Technique',
  },
  {
    query: 'cozy indoor hygge comfort',
    explanation: 'Pulls boiled wool mules, Imabari honeycomb bath sheets, and hearth throws',
    tag: 'Sensory Mood',
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectQuery, isNoResults }) => {
  return (
    <div className="w-full py-10 px-4 text-center max-w-2xl mx-auto space-y-6">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
        {isNoResults ? <Search className="w-7 h-7 text-stone-400" /> : <Sparkles className="w-7 h-7" />}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
          {isNoResults
            ? 'No design assets matched all current criteria'
            : 'Explore Semantic & BM25 Catalog Retrieval'}
        </h3>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
          {isNoResults
            ? 'Try broadening your search query or removing facet filters from the sidebar.'
            : 'Click any sample query below to test semantic retrieval across 60 fashion and product design assets:'}
        </p>
      </div>

      {/* Example Query Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
        {EXAMPLE_QUERIES.map(item => (
          <button
            key={item.query}
            type="button"
            onClick={() => onSelectQuery(item.query)}
            className="group p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-500/80 hover:shadow-md transition-all duration-150 text-left flex flex-col justify-between cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                &ldquo;{item.query}&rdquo;
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 leading-snug line-clamp-2">
              {item.explanation}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
