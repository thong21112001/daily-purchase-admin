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

      <div className="flex flex-wrap gap-2">
        {/* Dynamic Chips (Hiện nổi bật lên đầu nếu có) */}
        {dynamicChips.map((amount) => (
          <button
            key={`dyn-${amount}`}
            type="button"
            onClick={() => onSelectAmount(amount)}
            className="min-h-[44px] px-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold whitespace-nowrap shadow-sm shadow-orange-500/25 active:scale-95 cursor-pointer flex items-center justify-center border border-orange-400 transition-all font-mono tabular-nums"
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
              className="min-h-[44px] px-3 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-[#D8EFE9] hover:border-emerald-400 text-sm font-semibold whitespace-nowrap active:scale-95 cursor-pointer flex items-center justify-center transition-all font-mono tabular-nums shadow-2xs"
            >
              {formatVND(amount)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
