"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PiggyBank, Flame, CheckCircle2, ArrowRight } from "lucide-react";
import { formatVND } from "@/lib/utils/currency";
import { getTodayKey, getMonthKey } from "@/lib/utils/date";
import { useToast } from "@/components/ui/Toast";

interface CheckinStats {
  monthTotal: number;
  allTimeTotal: number;
  monthCount: number;
  currentStreak: number;
  longestStreak: number;
}

export function SavingsCheckinWidget() {
  const { showToast } = useToast();
  const [todayCheckin, setTodayCheckin] = useState<any | null>(null);
  const [stats, setStats] = useState<CheckinStats>({
    monthTotal: 0,
    allTimeTotal: 0,
    monthCount: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [defaultAmount, setDefaultAmount] = useState<number>(200000);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayKey = getTodayKey();
  const currentMonthKey = getMonthKey();

  const loadCheckinData = useCallback(async () => {
    try {
      const res = await fetch(`/api/checkins?monthKey=${currentMonthKey}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTodayCheckin(json.data.todayCheckin || null);
        if (json.data.stats) setStats(json.data.stats);
        if (json.data.defaultAmount) setDefaultAmount(json.data.defaultAmount);
      }
    } catch {
      // Ignore background errors
    } finally {
      setIsLoading(false);
    }
  }, [currentMonthKey]);

  useEffect(() => {
    loadCheckinData();
  }, [loadCheckinData]);

  const handleCheckin = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: defaultAmount }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || `Đã điểm danh hôm nay! +${formatVND(defaultAmount)}`, "success");
        setTodayCheckin(json.data);
        // Refresh stats
        loadCheckinData();
      } else {
        showToast(json.message || "Điểm danh thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi điểm danh", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#D8EFE9] bg-white p-4 animate-pulse h-20 flex items-center justify-between">
        <div className="h-4 bg-slate-100 rounded w-48" />
        <div className="h-9 bg-slate-100 rounded w-32" />
      </div>
    );
  }

  const isCheckedIn = Boolean(todayCheckin);

  return (
    <div
      className={`rounded-2xl border transition-all p-3.5 sm:p-4.5 ${
        isCheckedIn
          ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white border-emerald-300 shadow-xs"
          : "bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-white border-orange-200 shadow-xs"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
              isCheckedIn
                ? "bg-emerald-600 text-white"
                : "bg-gradient-to-tr from-orange-500 to-amber-500 text-white"
            }`}
          >
            {isCheckedIn ? (
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <PiggyBank className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900">
                {isCheckedIn ? "Đã điểm danh hôm nay ✓" : "Quỹ Tiết Kiệm Mỗi Ngày"}
              </span>

              {stats.currentStreak > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono">
                  <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                  {stats.currentStreak} ngày
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5 flex-wrap">
              <span>
                Lũy kế quỹ:{" "}
                <strong className="font-mono tabular-nums text-slate-900 font-bold">
                  {formatVND(stats.allTimeTotal)}
                </strong>
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="text-[11px] text-slate-500">
                Tháng này: <strong className="font-mono text-emerald-700">{formatVND(stats.monthTotal)}</strong> ({stats.monthCount} ngày)
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {isCheckedIn ? (
            <Link
              href="/savings"
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-[#D8EFE9] hover:bg-emerald-50 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <span>Xem sổ quỹ</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleCheckin}
              disabled={isSubmitting}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-all shadow-sm shadow-orange-500/25 cursor-pointer disabled:opacity-50"
            >
              <PiggyBank className="w-4 h-4" />
              <span>
                {isSubmitting ? "Đang lưu..." : `+${formatVND(defaultAmount)} Điểm danh ngay`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
