"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  subHeader?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  subHeader,
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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet / Dialog Container (Fresh & Free, rộng rãi trên Desktop) */}
      <div
        className={cn(
          "relative z-50 w-full max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto bg-white border-t sm:border border-[#D8EFE9] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] pb-safe animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 overflow-hidden",
          className
        )}
      >
        {/* Swipe Handle Bar (Chỉ hiện trên Mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden bg-[#F4FBF9]" onClick={onClose}>
          <div className="w-10 h-1.5 rounded-full bg-emerald-200 cursor-pointer" />
        </div>

        {/* Drawer Header cố định (shrink-0) */}
        <div className="shrink-0 px-5 pt-3.5 pb-3 border-b border-[#D8EFE9] bg-[#F4FBF9]/80">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] -mr-2 -mt-1 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SubHeader (Segmented Control không bao giờ bị che) */}
          {subHeader && <div className="mt-3">{subHeader}</div>}
        </div>

        {/* Content Body cuộn độc lập */}
        <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
