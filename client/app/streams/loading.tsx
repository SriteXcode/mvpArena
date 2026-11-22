import React from "react";
import StreamHubSkeleton, { StreamScheduleSkeleton } from "@/components/skeletons/StreamHubSkeleton";
import Skeleton from "@/components/ui/Skeleton";

export default function StreamsLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Banner Skeleton */}
      <div className="border-b border-slate-800 bg-slate-900/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Skeleton variant="dark" className="h-4 w-36 rounded" />
          <Skeleton variant="dark" className="h-4 w-44 rounded-full" />
        </div>
      </div>

      {/* Stream Stadium Player Skeleton */}
      <StreamHubSkeleton />

      {/* Schedule Skeleton */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton variant="dark" className="h-6 w-52 rounded" />
          <Skeleton variant="dark" className="h-9 w-64 rounded-lg" />
        </div>
        <StreamScheduleSkeleton count={4} />
      </div>
    </div>
  );
}
