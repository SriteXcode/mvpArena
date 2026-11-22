import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export function TeamsRosterSkeleton() {
  return (
    <div className="space-y-6 select-none">
      {/* 4 Summary Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2"
          >
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-7 w-24 rounded" />
            <Skeleton className="h-2.5 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Search & Filter Bar Skeleton */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <Skeleton className="h-9 w-full sm:flex-1 rounded-lg" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Team Roster Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs space-y-4 p-5"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-8 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-44 rounded" />
                  <Skeleton className="h-3.5 w-32 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>

            {/* Captain Bar */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-6 w-24 rounded" />
            </div>

            {/* Squad Members Roster Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
              {[1, 2, 3, 4].map((slot) => (
                <div
                  key={slot}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-12 rounded" />
                    <Skeleton className="h-3 w-10 rounded" />
                  </div>
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              ))}
            </div>

            {/* Action Footer */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeamsRosterSkeleton;
