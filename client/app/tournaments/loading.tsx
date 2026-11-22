import React from "react";
import Skeleton from "@/components/ui/Skeleton";
import TournamentCardSkeleton from "@/components/skeletons/TournamentCardSkeleton";

export default function TournamentsLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-72 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Skeleton className="h-9 w-20 rounded-lg shrink-0" />
            <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
            <Skeleton className="h-9 w-28 rounded-lg shrink-0" />
            <Skeleton className="h-9 w-24 rounded-lg shrink-0" />
          </div>
          <Skeleton className="h-9 w-full sm:w-72 rounded-lg" />
        </div>

        {/* Tournaments Grid Skeleton */}
        <TournamentCardSkeleton count={6} />
      </div>
    </div>
  );
}
