import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export interface TournamentCardSkeletonProps {
  count?: number;
}

export function TournamentCardSkeletonSingle() {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs flex flex-col h-full select-none">
      {/* Banner Skeleton */}
      <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden animate-shimmer">
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-md bg-slate-200/90" />
          <Skeleton className="h-5 w-14 rounded-md bg-slate-200/90" />
        </div>
        <div className="absolute top-3 right-3">
          <Skeleton className="h-5 w-24 rounded-full bg-slate-200/90" />
        </div>
        {/* Bottom stream tag placeholder */}
        <div className="absolute bottom-3 left-3">
          <Skeleton className="h-4 w-28 rounded bg-slate-200/80" />
        </div>
      </div>

      {/* Card Content Skeleton */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Date & Format Tag Row */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>

          {/* Title Lines */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-11/12 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>

          {/* Organizer Row */}
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-3.5 w-28 rounded" />
          </div>
        </div>

        {/* Progress Bar & Slots */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Prize Pool & Entry Fee */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <Skeleton className="h-2.5 w-14 rounded mb-1.5" />
            <Skeleton className="h-5 w-20 rounded" />
          </div>
          <div>
            <Skeleton className="h-2.5 w-14 rounded mb-1.5" />
            <Skeleton className="h-5 w-16 rounded" />
          </div>
        </div>

        {/* Buttons Footer */}
        <div className="pt-1 flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function TournamentCardSkeleton({ count = 6 }: TournamentCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <TournamentCardSkeletonSingle key={i} />
      ))}
    </div>
  );
}

export default TournamentCardSkeleton;
