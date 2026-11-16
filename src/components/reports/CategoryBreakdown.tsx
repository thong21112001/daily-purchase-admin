"use client";

import React from "react";
import { formatVND } from "@/lib/utils/currency";

export interface CategoryBreakdownItem {
  category: string;
  totalAmount: number;
  itemCount: number;
  totalQuantity: number;
  percentage: number;
}

interface CategoryBreakdownProps {
  categories: CategoryBreakdownItem[];
  grandTotal?: number;
}

export function CategoryBreakdown({ categories, grandTotal = 0 }: CategoryBreakdownProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-zinc-400">
        Chưa có dữ liệu phân loại chi tiêu
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {categories.map((cat) => (
        <div key={cat.category} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate pr-2">
              {cat.category}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                {formatVND(cat.totalAmount)}
              </span>
              <span className="w-11 text-right font-mono tabular-nums text-zinc-400 text-[11px]">
                {cat.percentage}%
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full bg-emerald-50 border border-emerald-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, Math.max(1, cat.percentage))}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{cat.itemCount} món đã mua</span>
            <span className="font-mono tabular-nums">Tổng SL: {cat.totalQuantity}</span>
          </div>
        </div>
      ))}

      {grandTotal > 0 && (
        <div className="pt-3 border-t border-[#D8EFE9] flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700">Tổng chi các nhóm:</span>
          <span className="font-mono tabular-nums text-sm text-emerald-700 font-extrabold">
            {formatVND(grandTotal)}
          </span>
        </div>
      )}
    </div>
  );
}
