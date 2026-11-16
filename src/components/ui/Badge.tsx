import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "coffee" | "success" | "mint" | "peach" | "sky";
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
      "bg-emerald-600 text-white",
    secondary:
      "bg-slate-100 text-slate-800 border border-slate-200",
    outline:
      "border border-[#D8EFE9] text-slate-700 bg-white",
    coffee:
      "bg-amber-100 text-amber-900 border border-amber-200",
    success:
      "bg-emerald-100 text-emerald-800 border border-emerald-200",
    mint:
      "bg-emerald-100 text-emerald-800 border border-emerald-200",
    peach:
      "bg-orange-100 text-orange-800 border border-orange-200",
    sky:
      "bg-sky-100 text-sky-800 border border-sky-200",
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
