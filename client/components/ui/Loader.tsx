import React from "react";

export interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "radar" | "dots" | "fullscreen";
  color?: "emerald" | "cyan" | "rose" | "amber" | "white";
  label?: string;
  className?: string;
}

export function Loader({
  size = "md",
  variant = "spinner",
  color = "emerald",
  label,
  className = "",
}: LoaderProps) {
  const sizeMap = {
    xs: { ring: "h-3.5 w-3.5 border-2", dot: "h-1 w-1", text: "text-[10px]" },
    sm: { ring: "h-4 w-4 border-2", dot: "h-1.5 w-1.5", text: "text-xs" },
    md: { ring: "h-7 w-7 border-2", dot: "h-2 w-2", text: "text-sm" },
    lg: { ring: "h-12 w-12 border-3", dot: "h-3 w-3", text: "text-base" },
    xl: { ring: "h-16 w-16 border-4", dot: "h-4 w-4", text: "text-lg" },
  };

  const colorMap = {
    emerald: {
      border: "border-emerald-200 border-t-emerald-600",
      accent: "text-emerald-600",
      bg: "bg-emerald-500",
      glow: "shadow-emerald-500/30",
    },
    cyan: {
      border: "border-sky-200 border-t-sky-500",
      accent: "text-sky-500",
      bg: "bg-sky-500",
      glow: "shadow-sky-500/30",
    },
    rose: {
      border: "border-rose-200 border-t-rose-600",
      accent: "text-rose-600",
      bg: "bg-rose-500",
      glow: "shadow-rose-500/30",
    },
    amber: {
      border: "border-amber-200 border-t-amber-600",
      accent: "text-amber-600",
      bg: "bg-amber-500",
      glow: "shadow-amber-500/30",
    },
    white: {
      border: "border-white/30 border-t-white",
      accent: "text-white",
      bg: "bg-white",
      glow: "shadow-white/20",
    },
  };

  const selectedSize = sizeMap[size];
  const selectedColor = colorMap[color];

  if (variant === "fullscreen") {
    return (
      <div className={`min-h-[60vh] w-full flex flex-col items-center justify-center p-6 ${className}`}>
        <div className="relative flex items-center justify-center mb-6">
          {/* Cyber outer radar pulse */}
          <div className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-ping opacity-60" />
          
          {/* Rotating radar ring */}
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-emerald-500/40 animate-radar" />
          
          {/* Inner spinning accent ring */}
          <div className="absolute inset-1.5 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          
          {/* Center Brand Emblem Hex */}
          <div className="absolute h-8 w-8 rounded-lg bg-slate-900 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-xs font-black font-mono text-emerald-400">M</span>
          </div>
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-xs font-mono font-bold tracking-widest text-slate-800 uppercase flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{label || "INITIALIZING ARENA SYSTEMS"}</span>
          </p>
          <p className="text-[11px] font-mono text-slate-400">
            Synchronizing live tournament data &amp; esports protocols...
          </p>
        </div>
      </div>
    );
  }

  if (variant === "radar") {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <div className="relative flex items-center justify-center">
          <div className={`absolute -inset-1 rounded-full ${selectedColor.bg}/20 animate-ping`} />
          <div
            className={`rounded-full ${selectedSize.ring} ${selectedColor.border} animate-spin`}
          />
        </div>
        {label && (
          <span className={`font-mono font-medium ${selectedSize.text} ${selectedColor.accent}`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className={`rounded-full ${selectedSize.dot} ${selectedColor.bg} animate-bounce [animation-delay:-0.3s]`} />
        <span className={`rounded-full ${selectedSize.dot} ${selectedColor.bg} animate-bounce [animation-delay:-0.15s]`} />
        <span className={`rounded-full ${selectedSize.dot} ${selectedColor.bg} animate-bounce`} />
        {label && (
          <span className={`ml-1.5 font-mono font-medium ${selectedSize.text} ${selectedColor.accent}`}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Default: Spinner
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`rounded-full ${selectedSize.ring} ${selectedColor.border} animate-spin`}
      />
      {label && (
        <span className={`font-mono font-semibold ${selectedSize.text} ${selectedColor.accent}`}>
          {label}
        </span>
      )}
    </div>
  );
}

export default Loader;
