"use client";

import React, { useState, useEffect, useRef } from "react";
import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { SpendingBarList } from "@/components/reports/SpendingBarList";
import { CategoryBreakdown } from "@/components/reports/CategoryBreakdown";
import { TopSpendingList } from "@/components/reports/TopSpendingList";
import { formatVND } from "@/lib/utils/currency";
import { getMonthKey } from "@/lib/utils/date";
import {
  BarChart3,
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Award,
  Calendar,
  RotateCcw,
} from "lucide-react";

function ReportsContent() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey());
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  // Load báo cáo an toàn với AbortController chống race condition
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    fetch(`/api/reports?month=${currentMonth}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setReportData(json.data);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          showToast("Không thể tải dữ liệu báo cáo", "error");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [currentMonth, showToast]);

  const handlePrevMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(prevMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split("-").map(Number);
    const nextDate = new Date(year, month, 1);
    const nextMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
    setCurrentMonth(nextMonthStr);
  };

  const handleResetThisMonth = () => {
    setCurrentMonth(getMonthKey());
  };

  const handleRestoreFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`Bạn có chắc chắn muốn khôi phục dữ liệu từ tệp [${file.name}]? Các phiếu trùng mã sẽ được cập nhật và các phiếu mới sẽ được bổ sung (Merge Strategy).`)) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsRestoring(true);
    try {
      const text = await file.text();
      const backupJSON = JSON.parse(text);

      const res = await fetch("/api/export/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backupJSON),
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Khôi phục dữ liệu thành công", "success");
        // Tải lại báo cáo
        const repRes = await fetch(`/api/reports?month=${currentMonth}`);
        const repJson = await repRes.json();
        if (repJson.success) setReportData(repJson.data);
      } else {
        showToast(json.message || "Khôi phục thất bại", "error");
      }
    } catch (err: any) {
      showToast(`Tệp JSON không hợp lệ: ${err.message}`, "error");
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hasData = (reportData?.kpis?.thisMonth?.totalAmount || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Header & Thanh Điều Hướng Tháng Trực Quan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8EFE9] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Báo Cáo Chi Tiêu & Sao Lưu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích lũy kế theo tháng, xuất file Excel chuẩn và quản lý sao lưu an toàn
          </p>
        </div>

        {/* Bộ điều hướng tháng (Galaxy A35 touch-friendly >= 44px) */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#D8EFE9] shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="min-h-[44px] min-w-[44px] h-11 w-11 flex items-center justify-center rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer"
            title="Tháng trước"
            aria-label="Tháng trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center px-1">
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => e.target.value && setCurrentMonth(e.target.value)}
              className="min-h-[44px] h-10 px-2 rounded-lg border-none bg-transparent font-mono font-bold text-sm text-slate-900 cursor-pointer focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="min-h-[44px] min-w-[44px] h-11 w-11 flex items-center justify-center rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer"
            title="Tháng sau"
            aria-label="Tháng sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {currentMonth !== getMonthKey() && (
            <button
              type="button"
              onClick={handleResetThisMonth}
              className="min-h-[44px] px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1 border-l border-[#D8EFE9]"
              title="Về tháng hiện tại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tháng này</span>
            </button>
          )}
        </div>
      </div>

      {/* Tổng quan tháng (3 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="bg-emerald-600 text-white border-none p-4 sm:p-5 flex flex-col justify-between shadow-md shadow-emerald-600/20">
          <span className="text-xs font-semibold text-emerald-100 block">
            Tổng chi tiêu tháng {currentMonth}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums my-2">
            {formatVND(reportData?.kpis?.thisMonth?.totalAmount || 0)}
          </div>
          <div className="text-xs text-emerald-100 font-mono tabular-nums">
            {reportData?.kpis?.thisMonth?.purchaseCount || 0} đợt nhập hàng
          </div>
        </Card>

        <Card className="border border-[#D8EFE9] p-4 sm:p-5 flex flex-col justify-between bg-white shadow-soft">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mặt hàng mua nhiều nhất</span>
          <div className="my-2">
            <span className="text-base font-bold text-slate-900 truncate block">
              {reportData?.topItems?.[0]?.name || "Chưa có dữ liệu"}
            </span>
            <span className="text-xs text-emerald-700 font-mono tabular-nums font-bold">
              {reportData?.topItems?.[0]?.totalAmount
                ? formatVND(reportData.topItems[0].totalAmount)
                : "0 ₫"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Chiếm chi phí lớn nhất kỳ</span>
        </Card>

        <Card className="border border-[#D8EFE9] p-4 sm:p-5 flex flex-col justify-between bg-white shadow-soft">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhóm ngành tốn kém nhất</span>
          <div className="my-2">
            <span className="text-base font-bold text-slate-900 truncate block">
              {reportData?.categoryBreakdown?.[0]?.category || "Chưa có dữ liệu"}
            </span>
            <span className="text-xs text-orange-600 font-mono tabular-nums font-bold">
              {reportData?.categoryBreakdown?.[0]?.percentage || 0}% ngân sách tháng
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Tỷ trọng chi tiêu hàng đầu</span>
        </Card>
      </div>

      {/* 3 Khối Báo cáo */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Đang tổng hợp báo cáo tháng {currentMonth}...</p>
        </div>
      ) : !hasData ? (
        /* Empty State Tháng Chưa Có Dữ Liệu */
        <Card className="border-dashed border-2 border-emerald-200 p-8 sm:p-12 text-center bg-white shadow-soft">
          <div className="max-w-xs mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Tháng {currentMonth} chưa có dữ liệu mua hàng
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có thể bấm &quot;Tháng trước&quot; hoặc &quot;Tháng sau&quot; để xem dữ liệu của các kỳ chi tiêu khác.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 1. Biểu đồ chi tiêu hằng ngày */}
          <Card className="border border-[#D8EFE9] bg-white p-4 sm:p-5 space-y-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-[#D8EFE9] pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Chi tiêu hằng ngày trong tháng
                </h3>
              </div>
              <Badge variant="mint" size="sm" className="font-mono tabular-nums text-[10px]">
                {reportData?.dailySpending?.length || 0} ngày có phát sinh
              </Badge>
            </div>
            <SpendingBarList days={reportData?.dailySpending || []} />
          </Card>

          {/* 2. Phân bổ theo nhóm danh mục */}
          <Card className="border border-[#D8EFE9] bg-white p-4 sm:p-5 space-y-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-[#D8EFE9] pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Cơ cấu chi tiêu theo nhóm hàng
                </h3>
              </div>
              <Badge variant="peach" size="sm" className="font-mono tabular-nums text-[10px]">
                {reportData?.categoryBreakdown?.length || 0} nhóm
              </Badge>
            </div>
            <CategoryBreakdown
              categories={reportData?.categoryBreakdown || []}
              grandTotal={reportData?.grandTotal || 0}
            />
          </Card>

          {/* 3. Top 10 mặt hàng chi tiêu nhiều nhất */}
          <Card className="lg:col-span-2 border border-[#D8EFE9] bg-white p-4 sm:p-5 space-y-4 shadow-soft">
            <div className="flex items-center justify-between border-b border-[#D8EFE9] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Top 10 mặt hàng tốn tiền nhất tháng {currentMonth}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Xếp hạng theo tổng tiền</span>
            </div>
            <TopSpendingList items={reportData?.topItems || []} />
          </Card>
        </div>
      )}

      {/* Khối Xuất File Excel / Sao Lưu / Khôi Phục Dữ Liệu */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            Xuất File & Sao Lưu An Toàn
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Action 1: Xuất Excel Chuẩn (.xlsx) */}
          <Card className="border border-[#D8EFE9] bg-white p-4 flex flex-col justify-between space-y-3 shadow-soft">
            <div className="space-y-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 pt-1">
                Xuất File Excel (.xlsx)
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tệp Excel chuẩn có tự căn độ rộng cột thoáng đẹp, đầy đủ thông tin nơi mua, mã phiếu và dòng TỔNG CỘNG.
              </p>
            </div>
            <a
              href={`/api/export/excel?month=${currentMonth}`}
              download
              className="w-full inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Tải file Excel (.xlsx)</span>
            </a>
          </Card>

          {/* Action 2: Sao lưu JSON */}
          <Card className="border border-[#D8EFE9] bg-white p-4 flex flex-col justify-between space-y-3 shadow-soft">
            <div className="space-y-1">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <FileCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 pt-1">
                Sao Lưu Toàn Bộ (JSON)
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tải về tệp sao lưu độc lập gồm toàn bộ sổ nhật ký nhập hàng, danh mục, nơi mua và bộ đếm mã số.
              </p>
            </div>
            <a
              href="/api/export/backup"
              download
              className="w-full inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl border border-[#D8EFE9] bg-white text-slate-800 hover:bg-[#F4FBF9] transition-colors gap-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>Tải tệp sao lưu JSON</span>
            </a>
          </Card>

          {/* Action 3: Khôi phục JSON (Choice A Merge Strategy) */}
          <Card className="border border-[#D8EFE9] bg-white p-4 flex flex-col justify-between space-y-3 shadow-soft">
            <div className="space-y-1">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 pt-1">
                Khôi Phục Dữ Liệu
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Cơ chế Hợp nhất (Merge/Upsert): Giữ nguyên dữ liệu cũ, chỉ cập nhật phiếu trùng và nạp thêm phiếu mới.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleRestoreFileSelected}
              />
              <Button
                variant="outline"
                loading={isRestoring}
                onClick={() => fileInputRef.current?.click()}
                fullWidth
                className="min-h-[44px] text-xs font-bold gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Chọn tệp JSON khôi phục</span>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <AdminLayoutShell>
      <ReportsContent />
    </AdminLayoutShell>
  );
}
