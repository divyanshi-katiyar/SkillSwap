/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-slate-200/50 dark:bg-slate-800/50 h-24 rounded-2xl p-4 flex flex-col justify-between">
          <div className="h-4 bg-slate-300 dark:bg-slate-700 w-1/2 rounded" />
          <div className="h-8 bg-slate-400 dark:bg-slate-600 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-6 animate-pulse space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-300 dark:bg-slate-700 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-400 dark:bg-slate-600 rounded w-1/3" />
          <div className="h-3 bg-slate-300 dark:bg-slate-700 rounded w-1/4" />
        </div>
      </div>
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-full" />
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-5/6" />
      <div className="flex space-x-2 pt-2">
        <div className="h-6 bg-slate-400 dark:bg-slate-600 w-16 rounded-full" />
        <div className="h-6 bg-slate-400 dark:bg-slate-600 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function CoachSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-slate-200/50 dark:bg-slate-800/50 h-32 rounded-2xl p-6 space-y-3">
        <div className="h-5 bg-slate-400 dark:bg-slate-600 w-1/3 rounded" />
        <div className="h-4 bg-slate-300 dark:bg-slate-700 w-2/3 rounded" />
        <div className="h-4 bg-slate-300 dark:bg-slate-700 w-1/2 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-200/50 dark:bg-slate-800/50 h-64 rounded-2xl p-6 space-y-4">
          <div className="h-5 bg-slate-400 dark:bg-slate-600 w-1/2 rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-300 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </div>
        <div className="bg-slate-200/50 dark:bg-slate-800/50 h-64 rounded-2xl p-6 space-y-4">
          <div className="h-5 bg-slate-400 dark:bg-slate-600 w-1/2 rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-300 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
