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
    <div className="bg-[#F4FBF9] border border-[#D8EFE9] rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Thời gian ghi sổ</span>
        </div>
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer flex items-center gap-0.5"
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
              className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? "bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/25"
                  : "bg-white border border-[#D8EFE9] text-slate-700 hover:bg-emerald-50 hover:border-emerald-300"
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
              <span>{day.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Lịch thủ công khi bấm "Chọn ngày khác" */}
      {showDatePicker && (
        <div className="pt-2 border-t border-[#D8EFE9] flex items-center gap-2">
          <label className="text-xs text-slate-600 font-medium shrink-0">Chọn ngày từ lịch:</label>
          <input
            type="date"
            max={getTodayKey()}
            value={selectedDateKey}
            onChange={handleCustomDateChange}
            className="min-h-[44px] h-11 px-3 rounded-xl border border-[#D8EFE9] bg-white text-slate-900 text-base font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      )}

      {/* Thông báo nếu ghi lùi ngày */}
      {!isToday && (
        <div className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
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
