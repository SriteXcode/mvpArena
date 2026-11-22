import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "default" | "dark" | "shimmer" | "dark-shimmer";
}

export function Skeleton({
  className = "",
  variant = "shimmer",
  ...props
}: SkeletonProps) {
  const baseClasses = "rounded-lg select-none pointer-events-none";

  const variantClasses = {
    default: "bg-slate-200 animate-pulse",
    dark: "bg-slate-800/80 animate-pulse",
    shimmer: "bg-slate-200/80 animate-shimmer",
    "dark-shimmer": "bg-slate-800/80 dark-shimmer",
  };

  return (
    <div
      aria-hidden="true"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
