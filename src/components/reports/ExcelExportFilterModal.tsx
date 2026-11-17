"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  FileSpreadsheet,
  Calendar,
  Clock,
  CheckCircle2,
  ArrowRight,
  Download,
} from "lucide-react";
import {
  getTodayKey,
  getYesterdayKey,
  getMonthKey,
  formatDateVN,
} from "@/lib/utils/date";

interface ExcelExportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReportMonth?: string;
}

type FilterMode = "day" | "week" | "month" | "custom";

export function ExcelExportFilterModal({
  isOpen,
  onClose,
  currentReportMonth,
}: ExcelExportFilterModalProps) {
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  const currentMonth = currentReportMonth || getMonthKey();

  const [mode, setMode] = useState<FilterMode>("month");

  // State cho chế độ Ngày
  const [selectedDay, setSelectedDay] = useState<string>(today);

  // State cho chế độ Tuần
  const [weekType, setWeekType] = useState<"this_week" | "last_7_days">("this_week");

  // State cho chế độ Tháng
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  // State cho chế độ Khoảng tùy chọn
  const [customStart, setCustomStart] = useState<string>(
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [customEnd, setCustomEnd] = useState<string>(today);

  // Tính toán khoảng ngày thực tế xuất khẩu
  const getExportParams = (): {
    url: string;
    labelStart: string;
    labelEnd: string;
    description: string;
  } => {
    if (mode === "day") {
      return {
        url: `/api/export/excel?dateKey=${selectedDay}`,
        labelStart: formatDateVN(selectedDay),
        labelEnd: formatDateVN(selectedDay),
        description: `Toàn bộ giao dịch mua hàng trong ngày ${formatDateVN(selectedDay)}`,
      };
    }

    if (mode === "week") {
      if (weekType === "last_7_days") {
        const start7 = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        return {
          url: `/api/export/excel?startDateKey=${start7}&endDateKey=${today}`,
          labelStart: formatDateVN(start7),
          labelEnd: formatDateVN(today),
          description: `7 ngày gần nhất (từ ${formatDateVN(start7)} đến ${formatDateVN(today)})`,
        };
      } else {
        // Tuần này (Thứ 2 đến hôm nay)
        const now = new Date();
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon, 7=Sun
        const monday = new Date(now.getTime() - (dayOfWeek - 1) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        return {
          url: `/api/export/excel?startDateKey=${monday}&endDateKey=${today}`,
          labelStart: formatDateVN(monday),
          labelEnd: formatDateVN(today),
          description: `Tuần này (từ Thứ 2: ${formatDateVN(monday)} đến nay: ${formatDateVN(today)})`,
        };
      }
    }

    if (mode === "month") {
      const [year, month] = selectedMonth.split("-");
      const start = `${selectedMonth}-01`;
      const end = `${selectedMonth}-31`;
      return {
        url: `/api/export/excel?month=${selectedMonth}`,
        labelStart: `01/${month}/${year}`,
        labelEnd: `Cuối tháng ${month}/${year}`,
        description: `Toàn bộ sổ mua hàng trong tháng ${month}/${year}`,
      };
    }

    // Custom
    return {
      url: `/api/export/excel?startDateKey=${customStart}&endDateKey=${customEnd}`,
      labelStart: formatDateVN(customStart),
      labelEnd: formatDateVN(customEnd),
      description: `Khoảng tùy chọn từ ${formatDateVN(customStart)} đến ${formatDateVN(customEnd)}`,
    };
  };

  const { url, labelStart, labelEnd, description } = getExportParams();

  const handleDownload = () => {
    window.location.href = url;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bộ Lọc Xuất File Excel (.xlsx)"
      description="Chọn thời gian cần xuất sổ mua hàng. File Excel tự động tách từng ngày và tính tổng ngày riêng biệt."
    >
      <div className="space-y-4">
        {/* Tab chuyển đổi chế độ lọc */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-[#D8EFE9]">
          <button
            type="button"
            onClick={() => setMode("day")}
            className={`min-h-[40px] px-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "day"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Theo Ngày
          </button>
          <button
            type="button"
            onClick={() => setMode("week")}
            className={`min-h-[40px] px-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "week"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Theo Tuần
          </button>
          <button
            type="button"
            onClick={() => setMode("month")}
            className={`min-h-[40px] px-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "month"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Theo Tháng
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={`min-h-[40px] px-2 text-xs font-semibold rounded-lg transition-all ${
              mode === "custom"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tùy Chọn
          </button>
        </div>

        {/* Nội dung tương ứng từng Tab */}
        <div className="bg-[#F4FBF9] border border-[#D8EFE9] rounded-2xl p-4 space-y-3">
          {/* TAB 1: THEO NGÀY */}
          {mode === "day" && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Chọn ngày cụ thể cần xuất:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDay(today)}
                  className={`min-h-[38px] px-3.5 text-xs font-medium rounded-xl border transition-all ${
                    selectedDay === today
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
                  }`}
                >
                  Hôm nay ({formatDateVN(today)})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDay(yesterday)}
                  className={`min-h-[38px] px-3.5 text-xs font-medium rounded-xl border transition-all ${
                    selectedDay === yesterday
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
                  }`}
                >
                  Hôm qua ({formatDateVN(yesterday)})
                </button>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">
                  Hoặc chọn một ngày khác:
                </span>
                <input
                  type="date"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          )}

          {/* TAB 2: THEO TUẦN */}
          {mode === "week" && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Chọn khoảng tuần:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWeekType("this_week")}
                  className={`min-h-[44px] p-3 text-left rounded-xl border transition-all ${
                    weekType === "this_week"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-200 font-semibold"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="text-xs">Tuần này</div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    Từ Thứ 2 đến hiện tại
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setWeekType("last_7_days")}
                  className={`min-h-[44px] p-3 text-left rounded-xl border transition-all ${
                    weekType === "last_7_days"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-200 font-semibold"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="text-xs">7 ngày gần nhất</div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    Trọn vẹn 7 ngày qua
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: THEO THÁNG */}
          {mode === "month" && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Chọn tháng cần xuất dữ liệu:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMonth(getMonthKey())}
                  className={`min-h-[38px] px-3.5 text-xs font-medium rounded-xl border transition-all ${
                    selectedMonth === getMonthKey()
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
                  }`}
                >
                  Tháng này ({getMonthKey()})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    now.setMonth(now.getMonth() - 1);
                    setSelectedMonth(getMonthKey(now));
                  }}
                  className={`min-h-[38px] px-3.5 text-xs font-medium rounded-xl border transition-all ${
                    selectedMonth !== getMonthKey()
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"
                  }`}
                >
                  Tháng trước
                </button>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block mb-1">
                  Chọn tháng bất kỳ:
                </span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          )}

          {/* TAB 4: KHOẢNG TÙY CHỌN */}
          {mode === "custom" && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Chọn ngày bắt đầu và ngày kết thúc:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Từ ngày:</span>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Đến ngày:</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Khung tóm tắt cấu trúc file xuất */}
        <div className="bg-white border border-[#D8EFE9] rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Xem trước cấu trúc file xuất:
            </span>
            <Badge variant="mint" className="text-[10px]">
              Định dạng .XLSX chuẩn
            </Badge>
          </div>

          <p className="text-xs text-slate-600">{description}</p>

          <div className="text-[11px] text-slate-500 space-y-1 pt-1.5 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Phân tách riêng biệt giữa các ngày (tránh nhầm lẫn)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Dòng <strong>TỔNG NGÀY</strong> tự động tính số lượng và tổng tiền từng ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Dòng <strong>TỔNG CỘNG TOÀN KỲ</strong> tổng kết toàn bộ kỳ xuất ở cuối file</span>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#D8EFE9]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-h-[44px] px-4"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            className="min-h-[44px] px-6 gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Download className="w-4 h-4" />
            Tải File Excel (.xlsx)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
