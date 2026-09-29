import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent telemetry
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check & status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    geminiConfigured: !!ai,
    model: 'gemini-embedding-2-preview',
    status: 'ok',
  });
});

// Single text embedding endpoint
app.post('/api/embeddings/query', async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text query is required' });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured or invalid. Fallback will be used.',
      fallbackAvailable: true,
    });
  }

  try {
    // Try gemini-embedding-2-preview, fallback to text-embedding-004 if preview unavailable
    let result;
    try {
      result = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text,
      });
    } catch (modelErr) {
      console.warn('gemini-embedding-2-preview failed, attempting text-embedding-004 fallback:', modelErr);
      result = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
      });
    }

    const values = result?.embeddings?.[0]?.values || [];
    return res.json({ embedding: values });
  } catch (err: any) {
    console.error('Embedding query error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate embedding',
      fallbackAvailable: true,
    });
  }
});

// Batch text embeddings endpoint
app.post('/api/embeddings/batch', async (req, res) => {
  const { texts } = req.body;
  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'Array of texts is required' });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured or invalid. Client TF-IDF fallback will be used.',
      fallbackAvailable: true,
    });
  }

  try {
    const embeddings: number[][] = [];
    const BATCH_SIZE = 10;
    const targetModel = 'gemini-embedding-2-preview';

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const slice = texts.slice(i, i + BATCH_SIZE);
      const batchPromises = slice.map(async (contentStr) => {
        try {
          const resp = await ai!.models.embedContent({
            model: targetModel,
            contents: contentStr,
          });
          return resp?.embeddings?.[0]?.values || [];
        } catch {
          // Fallback to text-embedding-004
          const resp = await ai!.models.embedContent({
            model: 'text-embedding-004',
            contents: contentStr,
          });
          return resp?.embeddings?.[0]?.values || [];
        }
      });

      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);
    }

    return res.json({ embeddings });
  } catch (err: any) {
    console.error('Batch embedding error:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate batch embeddings',
      fallbackAvailable: true,
    });
  }
});

// Mock REST Search API endpoint as referenced in technical notes
// Demonstrates how an AWS Lambda / Elasticsearch REST backend adapter connects
app.get('/api/search', (req, res) => {
  const { q, category, season, material } = req.query;
  res.json({
    message: 'DesignLens Remote REST Adapter endpoint template',
    params: { q, category, season, material },
    documentation: 'Swap in Elasticsearch / OpenSearch cluster endpoint here for production cloud deployment.',
  });
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DesignLens server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
