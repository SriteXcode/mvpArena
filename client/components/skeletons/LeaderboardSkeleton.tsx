import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-8 select-none">
      {/* Top Filter & Search Controls Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-full sm:w-64 rounded-lg" />
      </div>

      {/* Top 3 Podium Columns Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-6 pb-2">
        {/* 2nd Place Podium */}
        <div className="order-2 md:order-1 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center space-y-3 h-64 justify-center">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-7 w-24 rounded-lg mt-2" />
        </div>

        {/* 1st Place Champion Podium (taller) */}
        <div className="order-1 md:order-2 p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-md flex flex-col items-center space-y-3 h-80 justify-center">
          <div className="relative">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="absolute -top-3 -right-2 h-7 w-7 rounded-full bg-amber-200 animate-pulse" />
          </div>
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-28 rounded-xl mt-2" />
        </div>

        {/* 3rd Place Podium */}
        <div className="order-3 md:order-3 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center space-y-3 h-56 justify-center">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-7 w-20 rounded-lg mt-2" />
        </div>
      </div>

      {/* Standings Table Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardSkeleton;
