import React from "react";
import Loader from "@/components/ui/Loader";

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center p-8">
      <Loader
        variant="fullscreen"
        size="lg"
        label="INITIALIZING ARENA BATTLE SYSTEMS"
      />
    </div>
  );
}
