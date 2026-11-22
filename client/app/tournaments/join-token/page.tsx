"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function JoinTokenRedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token") || "";
    if (token) {
      router.replace(`/join?token=${encodeURIComponent(token)}`);
    } else {
      router.replace("/join");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        <p className="text-xs font-mono text-slate-500">Redirecting to team lobby join portal...</p>
      </div>
    </div>
  );
}

export default function JoinTokenRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <JoinTokenRedirectContent />
    </Suspense>
  );
}
