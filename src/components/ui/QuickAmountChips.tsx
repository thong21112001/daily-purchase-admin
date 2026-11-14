"use client";

import React from "react";
import { formatVND } from "@/lib/utils/currency";

export interface QuickAmountChipsProps {
  currentInput?: string | number;
  onSelectAmount: (amount: number) => void;
  className?: string;
}

const COMMON_CASH_AMOUNTS = [10000, 20000, 30000, 50000, 100000, 150000, 200000, 350000, 500000];

export function QuickAmountChips({
  currentInput,
  onSelectAmount,
  className = "",
}: QuickAmountChipsProps) {
  // 1. Tính toán chip động khi gõ số (Ví dụ gõ 45 -> 45.000 và 450.000)
  const num = typeof currentInput === "number" ? currentInput : parseInt(String(currentInput || "").replace(/[^\d]/g, ""), 10);
  const dynamicChips: number[] = [];

  if (!isNaN(num) && num > 0 && num < 1000) {
    dynamicChips.push(num * 1000);
    dynamicChips.push(num * 10000);
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>Gợi ý 1 chạm đơn giá:</span>
        {dynamicChips.length > 0 && (
          <span className="text-[11px] text-zinc-400 italic">Khớp với số đang gõ</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none overscroll-x-contain">
        {/* Dynamic Chips (Hiện nổi bật lên đầu nếu có) */}
        {dynamicChips.map((amount) => (
          <button
            key={`dyn-${amount}`}
            type="button"
            onClick={() => onSelectAmount(amount)}
            className="min-h-[44px] px-3.5 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 text-sm font-semibold whitespace-nowrap shadow-xs active:scale-95 cursor-pointer flex items-center justify-center shrink-0 border border-transparent transition-all"
          >
            {formatVND(amount)}
          </button>
        ))}

        {/* Preset Cash Chips cố định khi đi chợ */}
        {COMMON_CASH_AMOUNTS.map((amount) => {
          // Tránh lặp chip nếu đã có trong dynamicChips
          if (dynamicChips.includes(amount)) return null;

          return (
            <button
              key={`fix-${amount}`}
              type="button"
              onClick={() => onSelectAmount(amount)}
              className="min-h-[44px] px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 text-sm font-medium whitespace-nowrap active:scale-95 cursor-pointer flex items-center justify-center shrink-0 transition-all font-mono tabular-nums"
            >
              {formatVND(amount)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
