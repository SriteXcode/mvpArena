import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      {/* Organizer Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-80 rounded" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* 4 Metric KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2"
          >
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-7 w-32 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        ))}
      </div>

      {/* Tabs Navigation Bar Skeleton */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-10 w-36 rounded-lg shrink-0" />
        ))}
      </div>

      {/* Filter / Search Strip Skeleton */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-full sm:w-72 rounded-lg" />
      </div>

      {/* Matches / Tournaments Fixture Rows Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 rounded" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;
