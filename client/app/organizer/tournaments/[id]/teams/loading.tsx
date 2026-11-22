import React from "react";
import TeamsRosterSkeleton from "@/components/skeletons/TeamsRosterSkeleton";
import Skeleton from "@/components/ui/Skeleton";

export default function OrganizerTeamsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-8 w-64 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>
      <TeamsRosterSkeleton />
    </div>
  );
}
