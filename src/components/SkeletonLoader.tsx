import React from 'react';
import { EmbeddingProgress } from '../lib/embeddings';
import { Sparkles, Cpu, Layers } from 'lucide-react';

interface SkeletonLoaderProps {
  progress?: EmbeddingProgress | null;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ progress }) => {
  const percent = progress ? Math.round((progress.current / progress.total) * 100) : 40;

  return (
    <div className="w-full space-y-6">
      {/* Progress banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            <span className="font-bold text-stone-900 dark:text-stone-100">
              {progress?.status || 'Indexing 60 design assets...'}
            </span>
          </div>
          <span className="font-mono text-stone-500 dark:text-stone-400 font-semibold">
            {progress?.current ?? 0} / {progress?.total ?? 60} vectors ({percent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-amber-200/50 dark:bg-amber-900/40 overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Grid of skeleton cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden p-4 space-y-3 animate-pulse"
          >
            <div className="aspect-square w-full rounded-xl bg-stone-200 dark:bg-stone-800" />
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="h-4 w-12 bg-stone-200 dark:bg-stone-800 rounded-md" />
            </div>
            <div className="h-5 w-3/4 bg-stone-200 dark:bg-stone-800 rounded-md" />
            <div className="space-y-1.5 pt-1">
              <div className="h-3 w-full bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="h-3 w-4/5 bg-stone-200 dark:bg-stone-800 rounded-md" />
            </div>
            <div className="h-8 w-full bg-stone-200 dark:bg-stone-800 rounded-xl mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
};
