import React from "react";
import Skeleton from "@/components/ui/Skeleton";

export function TournamentDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 select-none">
      {/* Top Breadcrumb & Nav Skeleton */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Hero Header Banner Skeleton */}
      <div className="relative bg-slate-900 border-b border-slate-800 text-white overflow-hidden py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-3xl flex-1">
              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <Skeleton variant="dark" className="h-6 w-20 rounded-md" />
                <Skeleton variant="dark" className="h-6 w-16 rounded-md" />
                <Skeleton variant="dark" className="h-6 w-28 rounded-full" />
                <Skeleton variant="dark" className="h-6 w-24 rounded-full" />
              </div>

              {/* Title Skeleton */}
              <div className="space-y-2">
                <Skeleton variant="dark" className="h-8 sm:h-10 w-11/12 rounded-lg" />
                <Skeleton variant="dark" className="h-5 w-2/3 rounded-lg" />
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-6 pt-2 flex-wrap">
                <div className="space-y-1">
                  <Skeleton variant="dark" className="h-3 w-16 rounded" />
                  <Skeleton variant="dark" className="h-6 w-24 rounded" />
                </div>
                <div className="space-y-1">
                  <Skeleton variant="dark" className="h-3 w-16 rounded" />
                  <Skeleton variant="dark" className="h-6 w-20 rounded" />
                </div>
                <div className="space-y-1">
                  <Skeleton variant="dark" className="h-3 w-16 rounded" />
                  <Skeleton variant="dark" className="h-6 w-28 rounded" />
                </div>
              </div>
            </div>

            {/* Stream Action Button Placeholder */}
            <div className="flex items-center gap-3">
              <Skeleton variant="dark" className="h-11 w-44 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Countdown / Lobby banner placeholder */}
            <Skeleton className="h-20 w-full rounded-2xl" />

            {/* Live Stream Broadcast Skeleton Player */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-48 rounded" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              {/* 16:9 Video Box Skeleton */}
              <div className="relative aspect-video w-full rounded-xl bg-slate-900 dark-shimmer flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full border-2 border-slate-700 flex items-center justify-center">
                    <div className="h-4 w-4 bg-slate-600 rounded-sm" />
                  </div>
                  <Skeleton variant="dark" className="h-3 w-32 rounded" />
                </div>
              </div>
            </div>

            {/* Prize Pool Rewards Matrix Skeleton */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-44 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-7 w-7 rounded-lg" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                    <Skeleton className="h-5 w-24 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Rules & Guidelines Skeleton */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-11/12 rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Sticky Registration Box Skeleton */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-7 w-28 rounded" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Organizer Card Skeleton */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <Skeleton className="h-4 w-28 rounded" />
              <div className="flex items-center gap-3 pt-1">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TournamentDetailSkeleton;
