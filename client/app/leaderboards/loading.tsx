import React from "react";
import LeaderboardSkeleton from "@/components/skeletons/LeaderboardSkeleton";
import Skeleton from "@/components/ui/Skeleton";

export default function LeaderboardsLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <LeaderboardSkeleton />
      </div>
    </div>
  );
}
