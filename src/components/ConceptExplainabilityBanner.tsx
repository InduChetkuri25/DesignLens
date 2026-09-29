import React from 'react';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';

interface ConceptExplainabilityBannerProps {
  query: string;
  searchMode: string;
}

export const ConceptExplainabilityBanner: React.FC<ConceptExplainabilityBannerProps> = ({
  query,
  searchMode,
}) => {
  if (searchMode !== 'semantic' || !query.trim()) return null;

  const qLower = query.toLowerCase();

  // Concept extraction rules
  const mappings: { intent: string; concepts: string[] }[] = [];

  if (qLower.includes('summer') || qLower.includes('beach') || qLower.includes('sun') || qLower.includes('coastal')) {
    mappings.push({
      intent: 'Warm Weather & Coastal',
      concepts: ['French Flax Linen', 'Organic Muslin', 'Jute Espadrilles', 'Air-Permeable Popover'],
    });
  }

  if (qLower.includes('winter') || qLower.includes('warm') || qLower.includes('cold') || qLower.includes('frost')) {
    mappings.push({
      intent: 'Thermal Cold Climate',
      concepts: ['580 GSM Biella Shearling', 'ZQ Merino Base', 'Highland Cable Rib', 'Stormproof Parka'],
    });
  }

  if (qLower.includes('breathable') || qLower.includes('lightweight') || qLower.includes('airy')) {
    mappings.push({
      intent: 'Ventilation & Comfort',
      concepts: ['Open-Weave Geometry', 'Honeycomb Waffle', 'Unlined Silhouette', 'Sub-200 GSM Weaves'],
    });
  }

  if (qLower.includes('rain') || qLower.includes('waterproof') || qLower.includes('commute')) {
    mappings.push({
      intent: 'Inclement Weather Protection',
      concepts: ['Welded Tape Seams', 'Recycled SEAQUAL Membrane', 'Paraffin Wax Duck', 'Roll-Top Enclosure'],
    });
  }

  if (qLower.includes('sustainable') || qLower.includes('eco') || qLower.includes('recycled') || qLower.includes('organic')) {
    mappings.push({
      intent: 'Responsible Circularity',
      concepts: ['GOTS Certified Organic', 'Masters of Linen', '100% Post-Consumer Poly', 'Vegetable Tannage'],
    });
  }

  if (qLower.includes('artisan') || qLower.includes('heritage') || qLower.includes('leather') || qLower.includes('craft')) {
    mappings.push({
      intent: 'Artisanal Craftsmanship',
      concepts: ['Kojima Shuttle-Loomed Selvedge', 'Tuscan Saddle Leather', 'Goodyear Welt', 'Como Silk Foulard'],
    });
  }

  if (mappings.length === 0) {
    return (
      <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>
            <strong className="font-semibold text-amber-900 dark:text-amber-300">Vector Space Projection:</strong>{' '}
            Projecting &ldquo;{query}&rdquo; across high-dimensional semantic textile embeddings with cosine similarity.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50/80 to-stone-50 dark:from-amber-950/30 dark:to-stone-900 border border-amber-200/80 dark:border-amber-900/40 space-y-2 text-xs">
      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold">
        <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span>Semantic Projection Breakdown: &ldquo;{query}&rdquo;</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        {mappings.map((m, idx) => (
          <div key={idx} className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-stone-700 dark:text-stone-300">{m.intent}:</span>
            {m.concepts.map((c, cIdx) => (
              <span
                key={cIdx}
                className="font-mono text-[11px] px-2 py-0.5 rounded bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
              >
                {c}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
