"use client";

import React from "react";
import Link from "next/link";
import { Coffee, RotateCw, Package } from "lucide-react";
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
    <header className="lg:hidden sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-md border-b border-[#D8EFE9] px-3.5 flex items-center justify-between select-none shadow-xs">
      {/* Brand & Date */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Coffee className="w-4 h-4" />
        </div>
        <div>
          <span className="block text-xs font-bold tracking-tight text-slate-900 leading-tight">
            Sổ Nhập Hàng
          </span>
          <span className="block text-[11px] text-emerald-700 font-mono leading-tight">
            {todayStr}
          </span>
        </div>
      </div>

      {/* Today Total & Actions */}
      <div className="flex items-center gap-1.5">
        <Link
          href="/catalog"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
          title="Mặt hàng & Nơi mua"
          aria-label="Mặt hàng & Nơi mua"
        >
          <Package className="w-4 h-4" />
        </Link>

        <div className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200/80 text-right">
          <span className="block text-[10px] text-emerald-700 uppercase tracking-wider leading-none font-medium">
            Chi hôm nay
          </span>
          <span className="block text-xs font-bold font-mono tabular-nums text-slate-900 leading-tight mt-0.5">
            {formatVND(todayTotal)}
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
            aria-label="Tải lại dữ liệu"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        )}
      </div>
    </header>
  );
}
