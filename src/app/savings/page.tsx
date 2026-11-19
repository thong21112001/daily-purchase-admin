"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatVND } from "@/lib/utils/currency";
import { getTodayKey, getMonthKey } from "@/lib/utils/date";
import {
  PiggyBank,
  Flame,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Coins,
  Award,
} from "lucide-react";
import { CheckinDayDetailModal } from "@/components/savings/CheckinDayDetailModal";
import { CheckinSettingsModal } from "@/components/savings/CheckinSettingsModal";

interface CheckinItem {
  _id: string;
  dateKey: string;
  amount: number;
  isMakeup?: boolean;
  note?: string;
  checkedInAt?: string;
}

interface CheckinStats {
  monthTotal: number;
  allTimeTotal: number;
  monthCount: number;
  currentStreak: number;
  longestStreak: number;
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function SavingsContent() {
  const { showToast } = useToast();
  const todayKey = getTodayKey();
  const currentActualMonthKey = getMonthKey();

  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(currentActualMonthKey);
  const [checkins, setCheckins] = useState<CheckinItem[]>([]);
  const [todayCheckin, setTodayCheckin] = useState<CheckinItem | null>(null);
  const [stats, setStats] = useState<CheckinStats>({
    monthTotal: 0,
    allTimeTotal: 0,
    monthCount: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [defaultAmount, setDefaultAmount] = useState<number>(200000);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Tải dữ liệu điểm danh theo tháng
  const loadMonthData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/checkins?monthKey=${selectedMonthKey}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCheckins(json.data.checkins || []);
        setTodayCheckin(json.data.todayCheckin || null);
        if (json.data.stats) setStats(json.data.stats);
        if (json.data.defaultAmount) setDefaultAmount(json.data.defaultAmount);
      }
    } catch {
      showToast("Không thể tải sổ tiết kiệm", "error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonthKey, showToast]);

  useEffect(() => {
    loadMonthData();
  }, [loadMonthData]);

  // Map ngày -> checkin item để tra cứu O(1)
  const checkinMap = useMemo(() => {
    const map = new Map<string, CheckinItem>();
    for (const c of checkins) {
      map.set(c.dateKey, c);
    }
    return map;
  }, [checkins]);

  // Điều hướng tháng
  const handlePrevMonth = () => {
    const [y, m] = selectedMonthKey.split("-").map(Number);
    const prevDate = new Date(y, m - 2, 1);
    setSelectedMonthKey(
      `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonthKey.split("-").map(Number);
    const nextDate = new Date(y, m, 1);
    setSelectedMonthKey(
      `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const handleResetToCurrentMonth = () => {
    setSelectedMonthKey(currentActualMonthKey);
  };

  // Tính các ô trên lịch (Calendar Grid)
  const calendarCells = useMemo(() => {
    const [year, month] = selectedMonthKey.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 is Sun, 1 is Mon...
    const firstDayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const cells: Array<{
      dayNumber: number | null;
      dateKey: string | null;
      isToday: boolean;
      isPast: boolean;
      isFuture: boolean;
      checkin: CheckinItem | null;
    }> = [];

    // Ô trống đầu tháng
    for (let i = 0; i < firstDayOffset; i++) {
      cells.push({
        dayNumber: null,
        dateKey: null,
        isToday: false,
        isPast: false,
        isFuture: false,
        checkin: null,
      });
    }

    // Các ngày trong tháng
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${selectedMonthKey}-${String(d).padStart(2, "0")}`;
      const isToday = dateKey === todayKey;
      const isPast = dateKey < todayKey;
      const isFuture = dateKey > todayKey;
      const checkin = checkinMap.get(dateKey) || null;

      cells.push({
        dayNumber: d,
        dateKey,
        isToday,
        isPast,
        isFuture,
        checkin,
      });
    }

    return cells;
  }, [selectedMonthKey, todayKey, checkinMap]);

  // Điểm danh hôm nay nhanh từ trang này
  const handleQuickCheckinToday = async () => {
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: defaultAmount }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || `Đã điểm danh hôm nay! +${formatVND(defaultAmount)}`, "success");
        loadMonthData();
      } else {
        showToast(json.message || "Điểm danh thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    }
  };

  const selectedCellData = useMemo(() => {
    if (!selectedDateForModal) return null;
    const isToday = selectedDateForModal === todayKey;
    const isPast = selectedDateForModal < todayKey;
    const isFuture = selectedDateForModal > todayKey;
    const checkin = checkinMap.get(selectedDateForModal) || null;
    return { isToday, isPast, isFuture, checkin };
  }, [selectedDateForModal, todayKey, checkinMap]);

  const [selYear, selMonth] = selectedMonthKey.split("-");

  return (
    <div className="space-y-5">
      {/* 1. Header Trang & Thao Tác Cài Đặt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8EFE9] pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
              Điểm Danh Tiết Kiệm
            </h1>
            <Badge variant="mint" size="sm" className="font-semibold text-[11px]">
              +{formatVND(defaultAmount)}/ngày
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi ngày tích lũy một khoản nhỏ, kiên trì tạo dựng nguồn quỹ vững vàng
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsModalOpen(true)}
            className="min-h-[44px] px-3.5 text-xs font-semibold gap-1.5"
            title="Cài đặt mức tiền mặc định"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Mức tiền (+{formatVND(defaultAmount)})</span>
          </Button>

          {!todayCheckin && (
            <Button
              size="sm"
              variant="peach"
              onClick={handleQuickCheckinToday}
              className="min-h-[44px] px-4 text-xs font-bold gap-1.5 shadow-sm shadow-orange-500/20"
            >
              <PiggyBank className="w-4 h-4" />
              <span>Điểm danh hôm nay</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Bento 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Tổng quỹ tích lũy */}
        <Card className="p-3.5 sm:p-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none shadow-md shadow-emerald-600/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
              Tổng Quỹ Tích Lũy
            </span>
            <PiggyBank className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums tracking-tight">
              {formatVND(stats.allTimeTotal)}
            </span>
          </div>
          <span className="text-[10px] text-emerald-200">Toàn bộ lịch sử điểm danh</span>
        </Card>

        {/* Card 2: Tiết kiệm tháng này */}
        <Card className="p-3.5 sm:p-4 bg-white border border-[#D8EFE9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tháng {selMonth}/{selYear}
            </span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-emerald-800">
              {formatVND(stats.monthTotal)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Đã cộng trong tháng đang xem</span>
        </Card>

        {/* Card 3: Số ngày đã điểm danh */}
        <Card className="p-3.5 sm:p-4 bg-white border border-[#D8EFE9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Số Ngày Đã Lưu
            </span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="my-2">
            <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900">
              {stats.monthCount}{" "}
              <span className="text-xs font-normal text-slate-500">ngày</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Trong tháng {selMonth}/{selYear}</span>
        </Card>

        {/* Card 4: Chuỗi liên tiếp (Streak) */}
        <Card className="p-3.5 sm:p-4 bg-white border border-[#D8EFE9] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Chuỗi Liên Tiếp
            </span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-orange-600">
              {stats.currentStreak}
            </span>
            <span className="text-xs text-slate-500">ngày liên tục</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Award className="w-3 h-3 text-amber-500" />
            <span>Kỷ lục: {stats.longestStreak} ngày</span>
          </div>
        </Card>
      </div>

      {/* 3. Lịch Tháng Trực Quan (Calendar View) */}
      <Card className="bg-white border border-[#D8EFE9] p-3.5 sm:p-5 shadow-xs space-y-4">
        {/* Thanh Điều Hướng Tháng */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#D8EFE9] hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-[#D8EFE9] hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
              Tháng {selMonth} / {selYear}
            </h2>
            {selectedMonthKey !== currentActualMonthKey && (
              <button
                type="button"
                onClick={handleResetToCurrentMonth}
                className="text-[11px] text-emerald-700 hover:underline font-semibold"
              >
                Về tháng hiện tại
              </button>
            )}
          </div>

          <div className="text-right">
            <span className="block text-[10px] text-slate-400 uppercase font-medium">Đã tiết kiệm</span>
            <span className="text-xs sm:text-sm font-extrabold font-mono tabular-nums text-emerald-800">
              {formatVND(stats.monthTotal)}
            </span>
          </div>
        </div>

        {/* Tiêu Đề 7 Cột Ngày Trong Tuần */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center border-b border-[#D8EFE9] pb-2">
          {WEEKDAYS.map((w, idx) => (
            <div
              key={w}
              className={`text-[11px] sm:text-xs font-bold py-1 ${
                idx === 6 ? "text-red-500" : idx === 5 ? "text-amber-600" : "text-slate-500"
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Lưới Ngày 7 Cột Chuẩn Từng Pixel (360px - 412px không tràn) */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Đang tải lịch tháng...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarCells.map((cell, idx) => {
              if (cell.dayNumber === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[58px] sm:min-h-[72px] rounded-xl bg-slate-50/40 border border-transparent"
                  />
                );
              }

              const isCheckedIn = Boolean(cell.checkin);

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={cell.isFuture}
                  onClick={() => setSelectedDateForModal(cell.dateKey)}
                  className={`min-h-[58px] sm:min-h-[72px] p-1 sm:p-1.5 rounded-xl border text-left flex flex-col justify-between transition-all relative cursor-pointer select-none ${
                    isCheckedIn
                      ? "bg-emerald-50/90 border-emerald-300 hover:border-emerald-500 shadow-2xs"
                      : cell.isToday
                      ? "bg-orange-50/80 border-orange-400 ring-2 ring-orange-400/40 hover:bg-orange-100/60"
                      : cell.isPast
                      ? "bg-white border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                      : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                  }`}
                >
                  {/* Dòng trên: Số ngày + Trạng thái */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] sm:text-xs font-mono font-bold leading-none ${
                        cell.isToday
                          ? "text-orange-700 bg-orange-200/80 px-1 py-0.5 rounded-md"
                          : isCheckedIn
                          ? "text-emerald-900"
                          : "text-slate-700"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {isCheckedIn && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    )}
                  </div>

                  {/* Dòng dưới: Số tiền hoặc Gợi ý bấm */}
                  <div className="w-full text-right mt-1">
                    {isCheckedIn ? (
                      <div className="truncate">
                        <span className="block text-[9px] sm:text-[10px] font-mono tabular-nums font-bold text-emerald-800 leading-tight">
                          +{Math.round((cell.checkin?.amount || 0) / 1000)}k
                        </span>
                        {cell.checkin?.isMakeup && (
                          <span className="block text-[8px] text-amber-700 font-medium leading-none">
                            Bù
                          </span>
                        )}
                      </div>
                    ) : cell.isToday ? (
                      <span className="block text-[8px] sm:text-[9px] font-bold text-orange-600 uppercase tracking-tighter leading-tight">
                        Chạm lưu
                      </span>
                    ) : cell.isPast ? (
                      <span className="text-[10px] text-slate-300 hover:text-emerald-600 font-bold block">
                        +
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Chú Thích Trực Quan Cuối Lịch */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-[#D8EFE9] text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-400" />
            <span>Đã điểm danh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-orange-100 border border-orange-400 ring-1 ring-orange-400" />
            <span>Hôm nay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-white border border-dashed border-slate-300" />
            <span>Chưa điểm danh (chạm để điểm danh bù)</span>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <CheckinDayDetailModal
        isOpen={Boolean(selectedDateForModal)}
        onClose={() => setSelectedDateForModal(null)}
        dateKey={selectedDateForModal}
        checkin={selectedCellData?.checkin || null}
        defaultAmount={defaultAmount}
        isToday={selectedCellData?.isToday || false}
        isPast={selectedCellData?.isPast || false}
        isFuture={selectedCellData?.isFuture || false}
        onSuccess={loadMonthData}
      />

      <CheckinSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentDefaultAmount={defaultAmount}
        onSuccess={(newAmt) => {
          setDefaultAmount(newAmt);
          loadMonthData();
        }}
      />
    </div>
  );
}

export default function SavingsPage() {
  return (
    <AdminLayoutShell>
      <SavingsContent />
    </AdminLayoutShell>
  );
}
