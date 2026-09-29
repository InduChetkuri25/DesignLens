import { DesignAsset, DESIGN_ASSETS } from '../data/assets';
import { SearchEngine, SearchParams, SearchResponse, SearchResultItem } from './types';
import { EmbeddingsManager, cosineSimilarity } from './embeddings';

export class SemanticSearchEngine implements SearchEngine {
  private assets: DesignAsset[];
  private embeddingsManager: EmbeddingsManager;

  constructor(assets: DesignAsset[] = DESIGN_ASSETS) {
    this.assets = assets;
    this.embeddingsManager = EmbeddingsManager.getInstance();
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    const startTime = performance.now();
    const { query, filters, limit = 60, customVector } = params;

    // Filter candidate assets
    const candidateAssets = this.assets.filter(asset => {
      if (filters.categories.length > 0 && !filters.categories.includes(asset.category)) return false;
      if (filters.seasons.length > 0 && !filters.seasons.includes(asset.season)) return false;
      if (filters.materials.length > 0 && !filters.materials.includes(asset.material)) return false;
      return true;
    });

    const cleanQuery = query.trim();

    // If no query and no customVector, return baseline list
    if (!cleanQuery && (!customVector || customVector.length === 0)) {
      const results: SearchResultItem[] = candidateAssets.slice(0, limit).map((asset, idx) => ({
        asset,
        score: 100,
        rawScore: 1.0,
        matchedTerms: [],
        rank: idx + 1,
      }));

      const endTime = performance.now();
      return {
        results,
        latencyMs: Math.round((endTime - startTime) * 100) / 100,
        totalMatches: candidateAssets.length,
        engine: 'semantic',
        modeUsed: this.embeddingsManager.getSource(),
      };
    }

    // Embed query or use custom vector (e.g. "Find similar")
    let targetVector: number[];
    let sourceUsed = this.embeddingsManager.getSource();

    if (customVector && customVector.length > 0) {
      targetVector = customVector;
    } else {
      const embedResult = await this.embeddingsManager.embedQuery(cleanQuery);
      targetVector = embedResult.vector;
      sourceUsed = embedResult.source;
    }

    // Cosine similarity over candidate vectors
    const scored: { asset: DesignAsset; sim: number }[] = [];

    for (const asset of candidateAssets) {
      const assetVec = this.embeddingsManager.getVector(asset.id);
      if (!assetVec) continue;

      const sim = cosineSimilarity(targetVector, assetVec);
      scored.push({ asset, sim });
    }

    // Sort descending by similarity
    scored.sort((a, b) => b.sim - a.sim);

    // Normalization / Percentage calculation:
    // Cosine similarity in positive embedding space ranges between ~0.3 and 0.95.
    // We normalize to a sensible 0-100% similarity score for product design asset matching.
    const maxSim = scored[0]?.sim ?? 1;
    const minSim = scored[scored.length - 1]?.sim ?? 0;

    const results: SearchResultItem[] = scored.slice(0, limit).map((item, idx) => {
      let percent: number;
      if (maxSim === minSim) {
        percent = Math.round(item.sim * 100);
      } else {
        // Map [0.2, 0.95] to [40%, 99%] for intuitive semantic relevance grading
        const raw = item.sim;
        percent = Math.min(99, Math.max(12, Math.round(raw * 100)));
      }

      return {
        asset: item.asset,
        score: percent,
        rawScore: Math.round(item.sim * 1000) / 1000,
        matchedTerms: [],
        rank: idx + 1,
      };
    });

    const endTime = performance.now();
    return {
      results,
      latencyMs: Math.round((endTime - startTime) * 100) / 100,
      totalMatches: results.length,
      engine: 'semantic',
      modeUsed: sourceUsed,
    };
  }
}
