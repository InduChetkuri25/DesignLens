# DesignLens 🔍

> **Semantic Search Interface & Dual Retrieval Benchmark for Product & Fashion Design Assets**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google%20GenAI-Gemini%20Embeddings-orange.svg)](https://ai.google.dev/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](LICENSE)

DesignLens is an intelligent product catalog search and sourcing interface built for fashion design houses, textile mills, and creative directors. It bridges the gap between lexical keyword search (**BM25 Inverted Index**) and neural semantic vector search (**Gemini Embeddings & Cosine Similarity**), allowing designers to discover garments and materials using atmospheric concepts, functional requirements, and tactile descriptors (e.g., *"breathable summer fabric for beach"* or *"warm winter outerwear"*).

---

## ✨ Key Features

- **Dual Retrieval Engine**:
  - **BM25 Inverted Index**: Exact term frequency scoring with weighted field boosting (Title $\times 3$, Tags $\times 2$, Description $\times 1$, Meta $\times 1.5$) and highlighted matched tokens.
  - **Semantic Vector Space**: High-dimensional dense embeddings powered by `@google/genai` (`gemini-embedding-2-preview` / `text-embedding-004`) with automatic client-side TF-IDF vector space fallback and `localStorage` vector caching.
  - **Compare Mode**: Real-time side-by-side comparative inspection highlighting hits exclusive to BM25, exclusive to Vector search, or present in both with rank tracking and Top-10 overlap metrics.
- **Production Sourcing Dataset (60 Assets)**:
  - Complete with realistic fashion studio photography, production SKUs (e.g., `LNN-25S-01`), mill origins (*Normandy, Biella, Okayama, Como, Limoges*), fabric weights (*GSM*), sustainability certs (*GOTS, Masters of Linen, Responsible Wool Standard*), and interactive colorway hex swatches.
- **Dual Catalog Layout**:
  - **Lookbook Grid**: High-resolution editorial view for creative and trend exploration.
  - **Technical Spec Sheet Table**: Dense, sorting-friendly list designed for apparel tech pack managers.
- **Interactive Tech Pack Moodboard**:
  - Pin items across keyword and semantic queries.
  - Slide-over pinboard drawer with **One-Click CSV Export** for production tech packs.
- **Performance & Latency Benchmark**:
  - Measures real-time execution speeds for **BM25**, **Vector Cosine (FAISS simulation)**, and unindexed **Brute-Force Baseline**.
  - Interactive Recharts bar graph displaying the last 20 queries, calculating Mean and $P_{95}$ latency percentiles.
- **Accessible & Responsive**:
  - Full keyboard navigation for debounced (200ms) typeahead combobox (`ArrowUp`, `ArrowDown`, `Enter`, `Esc`).
  - Dark mode and light mode with persistent settings.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Recharts
- **Backend / Proxy**: Express, Node.js (`tsx`)
- **AI & Vector Embeddings**: `@google/genai` (Google GenAI TypeScript SDK)
- **Bundler & Tooling**: Vite 8, TypeScript 7

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/InduChetkuri25/designlens.git
cd designlens
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Add your Gemini API key in `.env`:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

*(Note: If no API key is provided, the application automatically falls back to its built-in TF-IDF vector model without failing).*

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm run start
```

---

## 📁 Project Architecture

```
├── server.ts                  # Express backend proxy for Gemini embeddings + Vite middleware
├── src/
│   ├── App.tsx                # Main state machine, search orchestration, layout controls
│   ├── data/
│   │   └── assets.ts          # 60 curated fashion & textile assets with rich specs
│   ├── lib/
│   │   ├── types.ts           # SearchEngine interfaces, SearchParams, FilterState
│   │   ├── keywordSearch.ts   # BM25 engine with field boosts & Lucene scoring
│   │   ├── semanticSearch.ts  # Cosine similarity vector search engine
│   │   ├── embeddings.ts      # Gemini embedding manager, localStorage cache, TF-IDF fallback
│   │   └── bruteForceBaseline.ts # Unindexed naive scan benchmark
│   └── components/
│       ├── Header.tsx         # Brand header, layout toggler, pinboard count, dark mode
│       ├── SearchBar.tsx      # Debounced typeahead combobox with keyboard ARIA support
│       ├── Filters.tsx        # Multi-facet checkboxes with real-time result counts
│       ├── ActiveFilterChips.tsx # Removable filter pills
│       ├── ResultCard.tsx     # Editorial product card with swatch copying & Find Similar
│       ├── SpecSheetTable.tsx # Technical table layout for tech packs
│       ├── ComparePanel.tsx   # Side-by-side BM25 vs Vector comparison
│       ├── LatencyChart.tsx   # Recharts latency benchmark panel (BM25 vs FAISS vs Baseline)
│       ├── MoodboardDrawer.tsx# Tech pack pinboard with CSV export
│       ├── AssetDetailModal.tsx # Full spec sheet modal with swatch hex codes
│       └── EmptyState.tsx     # Clickable sample semantic queries
└── package.json
```

---

## 📄 License

Apache License 2.0.
