"use client";

import React from "react";
import { Coffee, RotateCw } from "lucide-react";
import { formatDateVN } from "@/lib/utils/date";
import { formatVND } from "@/lib/utils/currency";

interface MobileTopHeaderProps {
  todayTotal?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MobileTopHeader({
  todayTotal = 0,
  onRefresh,
  isRefreshing = false,
}: MobileTopHeaderProps) {
  const todayStr = formatDateVN(new Date());

  return (
    <header className="lg:hidden sticky top-0 z-40 h-14 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between select-none">
      {/* Brand & Date */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 flex items-center justify-center shrink-0">
          <Coffee className="w-4 h-4" />
        </div>
        <div>
          <span className="block text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            Sổ Nhập Hàng
          </span>
          <span className="block text-[11px] text-zinc-400 font-mono leading-tight">
            {todayStr}
          </span>
        </div>
      </div>

      {/* Today Total & Refresh */}
      <div className="flex items-center gap-2">
        <div className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-right">
          <span className="block text-[10px] text-zinc-400 uppercase tracking-wider leading-none">
            Chi hôm nay
          </span>
          <span className="block text-xs font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 leading-tight mt-0.5">
            {formatVND(todayTotal)}
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 active:scale-95 transition-all"
            aria-label="Tải lại dữ liệu"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>
    </header>
  );
}
