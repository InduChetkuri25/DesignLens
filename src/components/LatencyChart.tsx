import React from 'react';
import { LatencyRecord } from '../lib/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Activity, Zap, Cpu, Clock, Info } from 'lucide-react';

interface LatencyChartProps {
  history: LatencyRecord[];
  currentKeywordMs: number;
  currentSemanticMs: number;
  currentBruteForceMs: number;
}

function calculateP95(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(0.95 * (sorted.length - 1)));
  return Math.round(sorted[index] * 100) / 100;
}

function calculateAvg(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / numbers.length) * 100) / 100;
}

export const LatencyChart: React.FC<LatencyChartProps> = ({
  history,
  currentKeywordMs,
  currentSemanticMs,
  currentBruteForceMs,
}) => {
  // Last 20 queries
  const recentHistory = history.slice(-20);

  const keywordLatencies = recentHistory.map(h => h.keywordMs);
  const semanticLatencies = recentHistory.map(h => h.semanticMs);
  const bruteForceLatencies = recentHistory.map(h => h.bruteForceMs);

  const avgKeyword = calculateAvg(keywordLatencies);
  const avgSemantic = calculateAvg(semanticLatencies);
  const avgBrute = calculateAvg(bruteForceLatencies);

  const p95Keyword = calculateP95(keywordLatencies);
  const p95Semantic = calculateP95(semanticLatencies);
  const p95Brute = calculateP95(bruteForceLatencies);

  // Format data for Recharts
  const chartData = recentHistory.map((item, idx) => {
    const qShort = item.query ? `"${item.query.slice(0, 10)}..."` : `Q#${idx + 1}`;
    return {
      name: qShort,
      fullQuery: item.query || 'All assets',
      Keyword: item.keywordMs,
      Semantic: item.semanticMs,
      BruteForce: item.bruteForceMs,
    };
  });

  return (
    <div className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-sm space-y-5">
      {/* Header with simulation disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
            Retrieval Engine Latency Benchmark
          </h3>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-400 font-mono">
          <Info className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
          <span>In-browser simulation of Elasticsearch vs FAISS</span>
        </div>
      </div>

      {/* Latency Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Keyword BM25 */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              BM25 Inverted Index
            </span>
            <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
              {currentKeywordMs} ms (now)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-blue-200/60 dark:border-blue-900/40">
            <div>
              <span className="text-stone-500 dark:text-stone-400">Mean: </span>
              <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{avgKeyword || currentKeywordMs} ms</span>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">P95: </span>
              <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{p95Keyword || currentKeywordMs} ms</span>
            </div>
          </div>
        </div>

        {/* Semantic Vector Search */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
              Vector Index (FAISS/Cosine)
            </span>
            <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold">
              {currentSemanticMs} ms (now)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
            <div>
              <span className="text-stone-500 dark:text-stone-400">Mean: </span>
              <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{avgSemantic || currentSemanticMs} ms</span>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">P95: </span>
              <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{p95Semantic || currentSemanticMs} ms</span>
            </div>
          </div>
        </div>

        {/* Brute-force Baseline */}
        <div className="p-3.5 rounded-xl bg-stone-100/80 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              Brute-Force Baseline
            </span>
            <span className="font-mono text-[11px] text-stone-500 dark:text-stone-400 font-bold">
              {currentBruteForceMs} ms (now)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-stone-200 dark:border-stone-700/60">
            <div>
              <span className="text-stone-500 dark:text-stone-400">Mean: </span>
              <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{avgBrute || currentBruteForceMs} ms</span>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">P95: </span>
              <span className="font-mono font-bold text-stone-800 dark:text-stone-200">{p95Brute || currentBruteForceMs} ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="w-full h-48 sm:h-56 pt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#888" />
              <YAxis
                unit="ms"
                tick={{ fontSize: 10 }}
                stroke="#888"
                domain={[0, 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-stone-900 text-white rounded-xl shadow-xl text-xs space-y-1 border border-stone-700">
                        <div className="font-bold text-stone-200 truncate max-w-xs">
                          Query: {data.fullQuery}
                        </div>
                        <div className="flex items-center justify-between gap-4 text-blue-400">
                          <span>BM25:</span>
                          <span className="font-mono">{data.Keyword} ms</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-amber-400">
                          <span>FAISS/Vector:</span>
                          <span className="font-mono">{data.Semantic} ms</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-stone-400">
                          <span>Brute-force:</span>
                          <span className="font-mono">{data.BruteForce} ms</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
              />
              <Bar dataKey="Keyword" name="Keyword (BM25)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Semantic" name="Semantic (Vector)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="BruteForce" name="Brute-Force Baseline" fill="#78716c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-stone-400">
            No queries logged yet. Search to view latency benchmark comparison.
          </div>
        )}
      </div>
    </div>
  );
};
