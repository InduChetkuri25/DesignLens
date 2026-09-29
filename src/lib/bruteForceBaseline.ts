import { DesignAsset, DESIGN_ASSETS } from '../data/assets';
import { SearchParams } from './types';

export function runBruteForceBaseline(params: SearchParams, assets: DesignAsset[] = DESIGN_ASSETS): { latencyMs: number; count: number } {
  const startTime = performance.now();
  const q = params.query.toLowerCase().trim();
  const terms = q.split(/\s+/).filter(Boolean);

  let matchCount = 0;

  for (const asset of assets) {
    // Filter checks
    if (params.filters.categories.length > 0 && !params.filters.categories.includes(asset.category)) continue;
    if (params.filters.seasons.length > 0 && !params.filters.seasons.includes(asset.season)) continue;
    if (params.filters.materials.length > 0 && !params.filters.materials.includes(asset.material)) continue;

    if (!terms.length) {
      matchCount++;
      continue;
    }

    // Naive exhaustive regex scan over all fields without inverted index
    const fullText = (
      asset.title + ' ' +
      asset.description + ' ' +
      asset.category + ' ' +
      asset.season + ' ' +
      asset.material + ' ' +
      asset.colorway + ' ' +
      asset.designer + ' ' +
      asset.tags.join(' ')
    ).toLowerCase();

    let matched = true;
    for (const term of terms) {
      if (!fullText.includes(term)) {
        matched = false;
        break;
      }
    }

    if (matched) matchCount++;
  }

  const endTime = performance.now();
  return {
    latencyMs: Math.round((endTime - startTime) * 100) / 100,
    count: matchCount,
  };
}
