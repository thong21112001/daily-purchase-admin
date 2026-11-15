"use client";

import React, { useState } from "react";
import { Calendar, ChevronRight, Check } from "lucide-react";
import { getPastDaysOptions, formatDateVN, getTodayKey, type PastDayOption } from "@/lib/utils/date";

interface PurchaseDateSelectorProps {
  selectedDateIso: string;
  selectedDateKey: string;
  onChangeDate: (dateIso: string, dateKey: string) => void;
}

export function PurchaseDateSelector({
  selectedDateIso,
  selectedDateKey,
  onChangeDate,
}: PurchaseDateSelectorProps) {
  // Lấy danh sách 8 ngày (Hôm nay + 7 ngày trước đó)
  const pastDays = getPastDaysOptions(8);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isToday = selectedDateKey === getTodayKey();
  const currentSelectedOption = pastDays.find((d) => d.dateKey === selectedDateKey);

  const handleSelectDay = (day: PastDayOption) => {
    onChangeDate(day.isoDate, day.dateKey);
  };

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "YYYY-MM-DD"
    if (!val) return;
    const iso = `${val}T12:00:00+07:00`;
    onChangeDate(iso, val);
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Thời gian ghi sổ</span>
        </div>
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-0.5"
        >
          <span>{showDatePicker ? "Thu gọn" : "Chọn ngày khác"}</span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showDatePicker ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Dãy Chip Chọn Nhanh 7 Ngày Qua (Cuộn ngang trên Mobile, trải đều trên Laptop/Desktop) */}
      <div className="flex items-center gap-1.5 overflow-x-auto sm:overflow-x-visible sm:flex-wrap pb-1 scrollbar-none overscroll-x-contain">
        {pastDays.map((day) => {
          const isSelected = day.dateKey === selectedDateKey;
          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => handleSelectDay(day)}
              className={`min-h-[44px] px-3 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-xs ring-2 ring-emerald-500/50"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-emerald-500 shrink-0" />}
              <span>{day.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Lịch thủ công khi bấm "Chọn ngày khác" */}
      {showDatePicker && (
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center gap-2">
          <label className="text-xs text-zinc-500 shrink-0">Chọn ngày từ lịch:</label>
          <input
            type="date"
            max={getTodayKey()}
            value={selectedDateKey}
            onChange={handleCustomDateChange}
            className="min-h-[44px] h-11 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-base font-mono"
          />
        </div>
      )}

      {/* Thông báo nếu ghi lùi ngày */}
      {!isToday && (
        <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
          <span>ℹ️</span>
          <span>
            Đang ghi lùi ngày cho{" "}
            <strong>{formatDateVN(selectedDateIso)}</strong>. Mã phiếu sẽ tự động sinh theo ngày này.
          </span>
        </div>
      )}
    </div>
  );
}
