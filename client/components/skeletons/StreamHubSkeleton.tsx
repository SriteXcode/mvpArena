import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export function StreamHubSkeleton() {
  return (
    <div className="w-full bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-white select-none">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton variant="dark" className="h-5 w-24 rounded-full" />
              <Skeleton variant="dark" className="h-5 w-32 rounded-full" />
            </div>
            <Skeleton variant="dark" className="h-8 w-64 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="dark" className="h-9 w-28 rounded-lg" />
            <Skeleton variant="dark" className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Stadium Video Player & Live Chat Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 16:9 Video Box (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="relative aspect-video w-full rounded-2xl bg-slate-900 border border-slate-800 dark-shimmer overflow-hidden flex flex-col items-center justify-center p-6">
              <div className="h-16 w-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3">
                <div className="h-6 w-6 rounded bg-slate-600" />
              </div>
              <Skeleton variant="dark" className="h-4 w-48 rounded" />
              <Skeleton variant="dark" className="h-3 w-36 rounded mt-1 opacity-70" />
            </div>

            {/* Video details strip */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div className="space-y-1.5 flex-1">
                <Skeleton variant="dark" className="h-5 w-3/4 rounded" />
                <Skeleton variant="dark" className="h-3.5 w-1/2 rounded" />
              </div>
              <Skeleton variant="dark" className="h-9 w-28 rounded-lg" />
            </div>
          </div>

          {/* Interactive Live Chat Box (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col h-[400px] lg:h-auto justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <Skeleton variant="dark" className="h-4 w-28 rounded" />
              <Skeleton variant="dark" className="h-4 w-12 rounded" />
            </div>

            {/* Chat message skeletons */}
            <div className="space-y-3 flex-1 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Skeleton variant="dark" className="h-6 w-6 rounded-full shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton variant="dark" className="h-3 w-20 rounded" />
                    <Skeleton variant="dark" className="h-3.5 w-11/12 rounded" />
                  </div>
                </div>
              ))}
            </div>

            {/* Chat input placeholder */}
            <Skeleton variant="dark" className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Channels row */}
        <div className="space-y-3 pt-4">
          <Skeleton variant="dark" className="h-4 w-36 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2.5"
              >
                <div className="aspect-video w-full rounded-lg bg-slate-800/80 dark-shimmer" />
                <Skeleton variant="dark" className="h-3.5 w-full rounded" />
                <Skeleton variant="dark" className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StreamScheduleSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
        >
          <div className="space-y-2.5 flex-1">
            <div className="flex items-center gap-2">
              <Skeleton variant="dark" className="h-4 w-16 rounded" />
              <Skeleton variant="dark" className="h-4 w-14 rounded" />
              <Skeleton variant="dark" className="h-4 w-28 rounded" />
              <Skeleton variant="dark" className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton variant="dark" className="h-5 w-3/4 rounded" />
            <div className="flex items-center gap-4">
              <Skeleton variant="dark" className="h-3 w-24 rounded" />
              <Skeleton variant="dark" className="h-3 w-20 rounded" />
              <Skeleton variant="dark" className="h-3 w-24 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <Skeleton variant="dark" className="h-9 w-28 rounded-lg" />
            <Skeleton variant="dark" className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default StreamHubSkeleton;
