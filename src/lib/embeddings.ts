import { DesignAsset, DESIGN_ASSETS } from '../data/assets';
import { tokenize } from './keywordSearch';

export type EmbeddingSource = 'gemini-embedding' | 'tfidf-fallback';

export interface EmbeddingProgress {
  current: number;
  total: number;
  status: string;
  source: EmbeddingSource;
}

const CACHE_KEY = 'designlens_asset_embeddings_v3';
const CACHE_SOURCE_KEY = 'designlens_embedding_source_v3';

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const len = Math.min(a.length, b.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ============================================================================
// Graceful Fallback: High-Dimensional TF-IDF & Semantic Concept Vectorizer
// ============================================================================
class TfIdfVectorizer {
  private vocabulary = new Map<string, number>();
  private idf = new Map<string, number>();
  private docVectors = new Map<string, number[]>();
  private isTrained = false;

  // Semantic concept expansions for rich fashion/design domain
  private semanticExpansions: Record<string, string[]> = {
    summer: ['breathable', 'airy', 'sunshine', 'resort', 'beach', 'coastal', 'heat', 'lightweight', 'cool', 'sand'],
    winter: ['warm', 'insulation', 'cold', 'snow', 'frost', 'thermal', 'heavyweight', 'arctic', 'fleece', 'shearling'],
    beach: ['coastal', 'seaside', 'ocean', 'linen', 'sarong', 'boardwalk', 'sand', 'resort', 'tunic', 'sun'],
    warm: ['insulation', 'thermal', 'fleece', 'wool', 'cozy', 'subzero', 'frost', 'shearling', 'heavy'],
    breathable: ['airy', 'open-weave', 'linen', 'ventilation', 'wicks', 'muslin', 'slub', 'cool'],
    rain: ['waterproof', 'stormproof', 'repels', 'downpours', 'poncho', 'trench', 'aquaguard', 'seam-taped'],
    waterproof: ['stormproof', 'repels', 'rainwear', 'seam-taped', 'waxed', 'aquaguard'],
    sustainable: ['recycled', 'circular', 'organic', 'eco-friendly', 'repurposed', 'post-consumer'],
    luxury: ['silk', 'cashmere', 'artisan', 'nappa', 'calfskin', 'hand-stitched', 'habotai', 'lustrous'],
    minimalist: ['clean', 'sleek', 'understated', 'slimline', 'refined', 'essential'],
    commute: ['messenger', 'backpack', 'cyclist', 'urban', 'roll-top', 'derby', 'trench'],
    cozy: ['hygge', 'cardigan', 'merino', 'blanket', 'mules', 'slippers', 'plush', 'hearth'],
  };

  public fit(assets: DesignAsset[]) {
    const docTokensList: { id: string; tokens: string[] }[] = [];
    const docFreq = new Map<string, number>();

    assets.forEach(asset => {
      const text = `${asset.title} ${asset.description} ${asset.category} ${asset.material} ${asset.gsm}gsm ${asset.origin} ${asset.sustainabilityCert} ${asset.sku} ${asset.season} ${asset.designer} ${asset.tags.join(' ')} ${asset.colorway}`;
      const tokens = tokenize(text);

      // Generate 2-grams
      for (let i = 0; i < tokens.length - 1; i++) {
        tokens.push(`${tokens[i]}_${tokens[i + 1]}`);
      }

      docTokensList.push({ id: asset.id, tokens });

      const unique = new Set(tokens);
      for (const t of unique) {
        docFreq.set(t, (docFreq.get(t) || 0) + 1);
      }
    });

    // Build vocabulary
    let index = 0;
    for (const [term, count] of docFreq.entries()) {
      if (count >= 1) {
        this.vocabulary.set(term, index++);
        this.idf.set(term, Math.log((assets.length + 1) / (count + 1)) + 1);
      }
    }

    // Embed all documents
    for (const { id, tokens } of docTokensList) {
      const vec = this.transformTokens(tokens);
      this.docVectors.set(id, vec);
    }

    this.isTrained = true;
  }

  private transformTokens(tokens: string[]): number[] {
    const vec = new Array(this.vocabulary.size).fill(0);
    const tf = new Map<string, number>();

    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }

    for (const [t, freq] of tf.entries()) {
      const idx = this.vocabulary.get(t);
      if (idx !== undefined) {
        const idfVal = this.idf.get(t) || 1;
        vec[idx] = (freq / tokens.length) * idfVal;
      }
    }

    // Normalize
    let norm = 0;
    for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
    if (norm > 0) {
      const sqrtNorm = Math.sqrt(norm);
      for (let i = 0; i < vec.length; i++) vec[i] /= sqrtNorm;
    }

    return vec;
  }

  public embedQuery(query: string): number[] {
    if (!this.isTrained) this.fit(DESIGN_ASSETS);
    const tokens = tokenize(query);

    // Expand query with semantic domain knowledge
    const expanded = [...tokens];
    for (const token of tokens) {
      if (this.semanticExpansions[token]) {
        expanded.push(...this.semanticExpansions[token]);
      }
    }

    for (let i = 0; i < tokens.length - 1; i++) {
      expanded.push(`${tokens[i]}_${tokens[i + 1]}`);
    }

    return this.transformTokens(expanded);
  }

  public getDocumentVector(id: string): number[] | undefined {
    return this.docVectors.get(id);
  }

  public getAllVectors(assets: DesignAsset[]): Map<string, number[]> {
    if (!this.isTrained) this.fit(assets);
    return this.docVectors;
  }
}

export const fallbackVectorizer = new TfIdfVectorizer();

// Embeddings manager class
export class EmbeddingsManager {
  private static instance: EmbeddingsManager;
  private vectors = new Map<string, number[]>();
  private activeSource: EmbeddingSource = 'gemini-embedding';
  private initialized = false;
  private initializingPromise: Promise<void> | null = null;

  public static getInstance(): EmbeddingsManager {
    if (!EmbeddingsManager.instance) {
      EmbeddingsManager.instance = new EmbeddingsManager();
    }
    return EmbeddingsManager.instance;
  }

  public getSource(): EmbeddingSource {
    return this.activeSource;
  }

  public isReady(): boolean {
    return this.initialized && this.vectors.size > 0;
  }

  public getVector(assetId: string): number[] | undefined {
    return this.vectors.get(assetId);
  }

  public async initialize(
    onProgress?: (p: EmbeddingProgress) => void
  ): Promise<void> {
    if (this.initialized) return;
    if (this.initializingPromise) return this.initializingPromise;

    this.initializingPromise = (async () => {
      // 1. Check local storage cache
      try {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        const cachedSource = localStorage.getItem(CACHE_SOURCE_KEY) as EmbeddingSource | null;

        if (cachedStr) {
          const parsed = JSON.parse(cachedStr) as Record<string, number[]>;
          const keys = Object.keys(parsed);
          if (keys.length >= DESIGN_ASSETS.length) {
            for (const [k, v] of Object.entries(parsed)) {
              this.vectors.set(k, v);
            }
            this.activeSource = cachedSource || 'gemini-embedding';
            this.initialized = true;
            onProgress?.({
              current: DESIGN_ASSETS.length,
              total: DESIGN_ASSETS.length,
              status: `Loaded ${DESIGN_ASSETS.length} cached embeddings (${this.activeSource})`,
              source: this.activeSource,
            });
            return;
          }
        }
      } catch (cacheErr) {
        console.warn('Could not read cached embeddings from localStorage:', cacheErr);
      }

      // 2. Attempt server-side Gemini embeddings API call
      onProgress?.({
        current: 0,
        total: DESIGN_ASSETS.length,
        status: 'Connecting to Gemini embedding service...',
        source: 'gemini-embedding',
      });

      let geminiSuccess = false;
      try {
        const assetTexts = DESIGN_ASSETS.map(
          a => `Title: ${a.title}. Description: ${a.description}. Category: ${a.category}. Season: ${a.season}. Material: ${a.material} (${a.gsm} GSM). Origin: ${a.origin}. Sustainability: ${a.sustainabilityCert}. SKU: ${a.sku}. Designer: ${a.designer}. Colorway: ${a.colorway}. Tags: ${a.tags.join(', ')}.`
        );

        onProgress?.({
          current: 10,
          total: DESIGN_ASSETS.length,
          status: 'Batch-indexing 60 design assets with Gemini...',
          source: 'gemini-embedding',
        });

        const resp = await fetch('/api/embeddings/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: assetTexts }),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data.embeddings) && data.embeddings.length === DESIGN_ASSETS.length) {
            const cacheObj: Record<string, number[]> = {};
            DESIGN_ASSETS.forEach((asset, idx) => {
              const vec = data.embeddings[idx];
              this.vectors.set(asset.id, vec);
              cacheObj[asset.id] = vec;
            });

            this.activeSource = 'gemini-embedding';
            this.initialized = true;
            geminiSuccess = true;

            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
              localStorage.setItem(CACHE_SOURCE_KEY, 'gemini-embedding');
            } catch (err) {
              console.warn('Failed to save to localStorage:', err);
            }

            onProgress?.({
              current: DESIGN_ASSETS.length,
              total: DESIGN_ASSETS.length,
              status: `Indexed ${DESIGN_ASSETS.length} assets with Gemini Embeddings`,
              source: 'gemini-embedding',
            });
            return;
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini embedding endpoint unavailable or errored, falling back to TF-IDF:', geminiErr);
      }

      // 3. Fallback: High-precision TF-IDF Vectorizer
      if (!geminiSuccess) {
        onProgress?.({
          current: 30,
          total: DESIGN_ASSETS.length,
          status: 'Generating TF-IDF semantic vector space fallback...',
          source: 'tfidf-fallback',
        });

        fallbackVectorizer.fit(DESIGN_ASSETS);
        const vectorsMap = fallbackVectorizer.getAllVectors(DESIGN_ASSETS);
        const cacheObj: Record<string, number[]> = {};

        for (const [id, vec] of vectorsMap.entries()) {
          this.vectors.set(id, vec);
          cacheObj[id] = vec;
        }

        this.activeSource = 'tfidf-fallback';
        this.initialized = true;

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
          localStorage.setItem(CACHE_SOURCE_KEY, 'tfidf-fallback');
        } catch {
          // Ignore quota exceeded
        }

        onProgress?.({
          current: DESIGN_ASSETS.length,
          total: DESIGN_ASSETS.length,
          status: `Indexed ${DESIGN_ASSETS.length} assets with TF-IDF Vector Index`,
          source: 'tfidf-fallback',
        });
      }
    })();

    return this.initializingPromise;
  }

  public async embedQuery(query: string): Promise<{ vector: number[]; source: EmbeddingSource }> {
    const clean = query.trim();
    if (!clean) {
      return { vector: [], source: this.activeSource };
    }

    if (this.activeSource === 'gemini-embedding') {
      try {
        const resp = await fetch('/api/embeddings/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: clean }),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data.embedding) && data.embedding.length > 0) {
            return { vector: data.embedding, source: 'gemini-embedding' };
          }
        }
      } catch (err) {
        console.warn('Query embedding via Gemini failed, falling back to TF-IDF vector:', err);
      }
    }

    // Fallback to TF-IDF vector
    const fallbackVec = fallbackVectorizer.embedQuery(clean);
    return { vector: fallbackVec, source: 'tfidf-fallback' };
  }
}
