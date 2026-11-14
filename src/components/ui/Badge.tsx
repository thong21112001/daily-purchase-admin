import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "coffee" | "success";
  size?: "default" | "sm" | "lg";
}

export function Badge({
  className,
  variant = "default",
  size = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default:
      "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900",
    secondary:
      "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700",
    outline:
      "border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 bg-transparent",
    coffee:
      "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
    success:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60",
  };

  const sizes = {
    default: "text-xs px-2 py-0.5",
    sm: "text-[10px] px-1.5 py-0",
    lg: "text-sm px-2.5 py-1",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md font-medium transition-colors select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
