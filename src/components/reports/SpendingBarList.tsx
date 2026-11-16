"use client";

import React from "react";
import { formatVND } from "@/lib/utils/currency";

interface SpendingDayItem {
  dateKey: string;
  totalAmount: number;
  purchaseCount: number;
  itemCount: number;
}

interface SpendingBarListProps {
  days: SpendingDayItem[];
}

export function SpendingBarList({ days }: SpendingBarListProps) {
  if (!days || days.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        Chưa có dữ liệu chi tiêu trong tháng này
      </div>
    );
  }

  const maxDailyAmount = Math.max(...days.map((d) => d.totalAmount), 1);

  return (
    <div className="space-y-2">
      {days.map((day) => {
        const percentage = Math.max(4, Math.round((day.totalAmount / maxDailyAmount) * 100));
        const dayNumber = day.dateKey.slice(8); // Lấy "14" từ "2026-11-14"

        return (
          <div key={day.dateKey} className="flex items-center gap-3 text-xs">
            {/* Ngày */}
            <span className="w-8 shrink-0 font-mono font-bold text-slate-600 text-right">
              {dayNumber}
            </span>

            {/* Thanh Bar CSS Thuần (Zero-Bloat, không giật lag) */}
            <div className="flex-1 h-7 bg-emerald-50/70 border border-emerald-100 rounded-lg overflow-hidden flex items-center p-0.5 relative">
              <div
                style={{ width: `${percentage}%` }}
                className="h-full bg-emerald-500 rounded-md transition-all duration-300"
              />
              <span className="absolute left-2.5 text-[11px] font-bold font-mono tabular-nums text-slate-900">
                {formatVND(day.totalAmount)}
              </span>
            </div>

            {/* Số phiếu */}
            <span className="w-12 shrink-0 text-right text-[11px] text-slate-500 font-mono tabular-nums font-medium">
              {day.purchaseCount} đợt
            </span>
          </div>
        );
      })}
    </div>
  );
}
