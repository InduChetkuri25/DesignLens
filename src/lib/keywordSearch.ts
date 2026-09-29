import { DesignAsset, DESIGN_ASSETS } from '../data/assets';
import { SearchEngine, SearchParams, SearchResponse, SearchResultItem } from './types';

// Standard English stop words
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren', 'arent', 'as', 'at', 'be', 'because', 'been', 'before',
  'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'couldn', 'did', 'didn', 'do', 'does', 'doesn', 'doing', 'don', 'dont', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn', 'has', 'hasn',
  'have', 'haven', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'isnt', 'it',
  'its', 'itself', 'just', 'll', 'm', 'ma', 'me', 'mightn', 'more', 'most',
  'mustn', 'my', 'myself', 'needn', 'no', 'nor', 'not', 'now', 'o', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 're', 's', 'same', 'shan', 'she', 'should', 'shouldn', 'so', 'some',
  'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 've', 'very', 'was', 'wasn', 'we', 'were', 'weren',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will',
  'with', 'won', 'would', 'wouldn', 'y', 'you', 'your', 'yours', 'yourself',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/[\s-]+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

// BM25 parameters
const K1 = 1.5;
const B = 0.75;
const TITLE_BOOST = 3.0;
const TAGS_BOOST = 2.0;
const DESC_BOOST = 1.0;
const META_BOOST = 1.5;

interface DocumentIndex {
  asset: DesignAsset;
  titleTokens: string[];
  descTokens: string[];
  tagTokens: string[];
  metaTokens: string[];
  docLength: number; // weighted
  termFrequencies: Map<string, number>;
}

export class BM25KeywordSearchEngine implements SearchEngine {
  private documents: DocumentIndex[] = [];
  private avgDocLength = 0;
  private idfMap = new Map<string, number>();

  constructor(assets: DesignAsset[] = DESIGN_ASSETS) {
    this.buildIndex(assets);
  }

  public buildIndex(assets: DesignAsset[]) {
    let totalLength = 0;
    const docFrequency = new Map<string, number>();

    this.documents = assets.map(asset => {
      const titleTokens = tokenize(asset.title);
      const descTokens = tokenize(asset.description);
      const tagTokens = asset.tags.flatMap(tag => tokenize(tag));
      const metaTokens = tokenize(
        `${asset.category} ${asset.material} ${asset.season} ${asset.designer} ${asset.colorway} ${asset.origin} ${asset.sustainabilityCert} ${asset.sku}`
      );

      const termFrequencies = new Map<string, number>();

      const addTokens = (tokens: string[], boost: number) => {
        for (const token of tokens) {
          termFrequencies.set(token, (termFrequencies.get(token) || 0) + boost);
        }
      };

      addTokens(titleTokens, TITLE_BOOST);
      addTokens(tagTokens, TAGS_BOOST);
      addTokens(descTokens, DESC_BOOST);
      addTokens(metaTokens, META_BOOST);

      const weightedLength =
        titleTokens.length * TITLE_BOOST +
        tagTokens.length * TAGS_BOOST +
        descTokens.length * DESC_BOOST +
        metaTokens.length * META_BOOST;

      totalLength += weightedLength;

      // Track unique terms for IDF
      const uniqueTerms = new Set([...titleTokens, ...descTokens, ...tagTokens, ...metaTokens]);
      for (const term of uniqueTerms) {
        docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
      }

      return {
        asset,
        titleTokens,
        descTokens,
        tagTokens,
        metaTokens,
        docLength: weightedLength,
        termFrequencies,
      };
    });

    this.avgDocLength = totalLength / (this.documents.length || 1);

    // Calculate BM25 IDF for all terms
    const N = this.documents.length;
    this.idfMap.clear();
    for (const [term, df] of docFrequency.entries()) {
      // Lucene / BM25 standard IDF formula: ln(1 + (N - df + 0.5) / (df + 0.5))
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      this.idfMap.set(term, Math.max(0.1, idf));
    }
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    const startTime = performance.now();
    const { query, filters, limit = 60 } = params;
    const cleanQuery = query.trim();

    // 1. Filter out by category, season, material
    let candidateDocs = this.documents.filter(doc => {
      const a = doc.asset;
      if (filters.categories.length > 0 && !filters.categories.includes(a.category)) return false;
      if (filters.seasons.length > 0 && !filters.seasons.includes(a.season)) return false;
      if (filters.materials.length > 0 && !filters.materials.includes(a.material)) return false;
      return true;
    });

    // If query is empty, return all filtered items with score 100
    if (!cleanQuery) {
      const results: SearchResultItem[] = candidateDocs.slice(0, limit).map((doc, idx) => ({
        asset: doc.asset,
        score: 100,
        rawScore: 1,
        matchedTerms: [],
        rank: idx + 1,
      }));
      const endTime = performance.now();
      return {
        results,
        latencyMs: Math.round((endTime - startTime) * 100) / 100,
        totalMatches: candidateDocs.length,
        engine: 'keyword',
        modeUsed: 'bm25',
      };
    }

    const queryTokens = tokenize(cleanQuery);
    // Also include raw query words if tokens are empty (e.g. single letter or symbols)
    const activeTokens = queryTokens.length > 0
      ? queryTokens
      : cleanQuery.toLowerCase().split(/\s+/).filter(Boolean);

    const scoredItems: { doc: DocumentIndex; rawScore: number; matchedTerms: string[] }[] = [];

    for (const doc of candidateDocs) {
      let docScore = 0;
      const matched = new Set<string>();

      for (const qToken of activeTokens) {
        // Exact term match
        const exactTf = doc.termFrequencies.get(qToken) || 0;
        let idf = this.idfMap.get(qToken) || Math.log(this.documents.length);

        let effectiveTf = exactTf;

        // Also do prefix / subword check if exact is 0
        if (effectiveTf === 0) {
          for (const [term, freq] of doc.termFrequencies.entries()) {
            if (term.includes(qToken) || qToken.includes(term)) {
              effectiveTf += freq * 0.7; // partial match discount
              matched.add(term);
            }
          }
        } else {
          matched.add(qToken);
        }

        if (effectiveTf > 0) {
          // BM25 term weighting formula
          const numerator = effectiveTf * (K1 + 1);
          const denominator = effectiveTf + K1 * (1 - B + B * (doc.docLength / (this.avgDocLength || 1)));
          docScore += idf * (numerator / denominator);
        }
      }

      if (docScore > 0) {
        scoredItems.push({
          doc,
          rawScore: docScore,
          matchedTerms: Array.from(matched),
        });
      }
    }

    // Sort by rawScore descending
    scoredItems.sort((a, b) => b.rawScore - a.rawScore);

    const maxScore = scoredItems[0]?.rawScore || 1;

    const results: SearchResultItem[] = scoredItems.slice(0, limit).map((item, idx) => {
      // Normalize score to 0 - 100 range with non-linear scale for human readability
      const normalized = Math.min(100, Math.round((item.rawScore / maxScore) * 100));
      return {
        asset: item.doc.asset,
        score: Math.max(1, normalized),
        rawScore: Math.round(item.rawScore * 100) / 100,
        matchedTerms: item.matchedTerms,
        rank: idx + 1,
      };
    });

    const endTime = performance.now();
    return {
      results,
      latencyMs: Math.round((endTime - startTime) * 100) / 100,
      totalMatches: scoredItems.length,
      engine: 'keyword',
      modeUsed: 'bm25',
    };
  }
}

/**
 * ==============================================================================
 * EXAMPLE REMOTE REST BACKEND ADAPTER
 * (Elasticsearch / OpenSearch on AWS Lambda / ECS)
 * ==============================================================================
 *
 * export class RemoteElasticsearchSearchAdapter implements SearchEngine {
 *   private baseUrl: string;
 *
 *   constructor(baseUrl = '/api/search') {
 *     this.baseUrl = baseUrl;
 *   }
 *
 *   async search(params: SearchParams): Promise<SearchResponse> {
 *     const startTime = performance.now();
 *     const queryParams = new URLSearchParams({
 *       q: params.query,
 *       category: (params.filters.categories || []).join(','),
 *       season: (params.filters.seasons || []).join(','),
 *       material: (params.filters.materials || []).join(','),
 *       limit: String(params.limit || 60),
 *     });
 *
 *     const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
 *       headers: { 'Accept': 'application/json' },
 *     });
 *
 *     if (!response.ok) {
 *       throw new Error(`Elasticsearch REST gateway failed: ${response.statusText}`);
 *     }
 *
 *     const data = await response.json();
 *     const endTime = performance.now();
 *
 *     return {
 *       results: data.hits.map((hit: any, idx: number) => ({
 *         asset: hit._source,
 *         score: Math.round((hit._score / data.max_score) * 100),
 *         rawScore: hit._score,
 *         matchedTerms: hit.highlight ? Object.keys(hit.highlight) : [],
 *         rank: idx + 1,
 *       })),
 *       latencyMs: Math.round((endTime - startTime) * 100) / 100,
 *       totalMatches: data.total?.value || 0,
 *       engine: 'keyword',
 *       modeUsed: 'bm25',
 *     };
 *   }
 * }
 */
