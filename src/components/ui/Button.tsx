import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "peach" | "sky";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * NÚT BẤM FRESH & FREE (GALAXY A35 5G OPTIMIZED)
 * Vùng chạm tối thiểu bắt buộc >= 44px x 44px (Hard Lock #4)
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none";

    const variants = {
      default:
        "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20",
      peach:
        "bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-500/20",
      sky:
        "bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-500/20",
      secondary:
        "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80",
      outline:
        "border border-[#D8EFE9] bg-white text-slate-800 hover:bg-[#F4FBF9] hover:border-emerald-300 shadow-xs",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 shadow-xs",
      ghost:
        "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800",
    };

    const sizes = {
      default: "min-h-[44px] h-11 px-4 py-2 text-base sm:text-sm",
      sm: "min-h-[44px] h-11 px-3 text-base sm:text-xs",
      lg: "min-h-[48px] h-12 px-6 text-base font-semibold",
      icon: "min-h-[44px] min-w-[44px] h-11 w-11 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{children}</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
