"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: DrawerProps) {
  // Khóa cuộn trang khi drawer đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 md:p-6">
      {/* Backdrop mờ nhẹ */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet / Dialog Container (Tối ưu hoàn hảo cả Mobile lẫn Laptop/Desktop) */}
      <div
        className={cn(
          "relative z-50 w-full max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] pb-safe animate-in slide-in-from-bottom sm:zoom-in-95 duration-200",
          className
        )}
      >
        {/* Swipe Handle Bar (Chỉ hiện trên Mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden" onClick={onClose}>
          <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 cursor-pointer" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div>
            {title && (
              <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-1 p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body cuộn độc lập */}
        <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
