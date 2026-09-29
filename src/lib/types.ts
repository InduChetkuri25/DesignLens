import { DesignAsset, AssetCategory, AssetSeason, AssetMaterial } from '../data/assets';

export interface FilterState {
  categories: AssetCategory[];
  seasons: AssetSeason[];
  materials: AssetMaterial[];
}

export interface SearchParams {
  query: string;
  filters: FilterState;
  limit?: number;
  customVector?: number[]; // for "Find similar" directly using asset embedding
}

export interface SearchResultItem {
  asset: DesignAsset;
  score: number; // 0 to 100
  rawScore: number;
  matchedTerms: string[];
  rank: number;
}

export interface SearchResponse {
  results: SearchResultItem[];
  latencyMs: number;
  totalMatches: number;
  engine: 'keyword' | 'semantic';
  modeUsed?: 'gemini-embedding' | 'tfidf-fallback' | 'bm25';
}

export interface SearchEngine {
  search(params: SearchParams): Promise<SearchResponse>;
}

export interface LatencyRecord {
  id: string;
  query: string;
  timestamp: number;
  keywordMs: number;
  semanticMs: number;
  bruteForceMs: number;
}

export type SearchMode = 'keyword' | 'semantic' | 'compare';
