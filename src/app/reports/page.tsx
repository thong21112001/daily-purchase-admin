"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
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
  Calendar,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Award,
  AlertTriangle,
} from "lucide-react";

function ReportsContent() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentMonth, setCurrentMonth] = useState(() => getMonthKey());
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState(false);

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?month=${currentMonth}`);
      const json = await res.json();
      if (json.success) {
        setReportData(json.data);
      }
    } catch {
      showToast("Không thể tải dữ liệu báo cáo", "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, showToast]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

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
        loadReport();
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

  return (
    <div className="space-y-6">
      {/* Header & Bộ chọn tháng */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Báo Cáo Chi Tiêu & Sao Lưu
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Phân tích lũy kế theo tháng, xuất file Excel và quản lý sao lưu an toàn
            </p>
          </div>

          {/* Bộ chọn tháng (Galaxy A35 touch-friendly) */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums font-bold text-xs sm:text-sm px-2 text-zinc-900 dark:text-zinc-100 min-w-[90px] text-center">
              Tháng {currentMonth}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tổng quan tháng */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Card className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 border-none p-4 sm:p-5">
            <span className="text-xs font-medium text-zinc-300 dark:text-zinc-600 block">
              Tổng chi tiêu tháng {currentMonth}
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums my-2">
              {formatVND(reportData?.kpis?.thisMonth?.totalAmount || 0)}
            </div>
            <div className="text-xs text-zinc-300 dark:text-zinc-600 font-mono tabular-nums">
              {reportData?.kpis?.thisMonth?.purchaseCount || 0} đợt nhập hàng
            </div>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-500">Mặt hàng mua nhiều nhất</span>
            <div className="my-2">
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                {reportData?.topItems?.[0]?.name || "Chưa có dữ liệu"}
              </span>
              <span className="text-xs text-zinc-400 font-mono tabular-nums">
                {reportData?.topItems?.[0]?.totalAmount
                  ? formatVND(reportData.topItems[0].totalAmount)
                  : "0 đ"}
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">Chiếm chi phí lớn nhất kỳ</span>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-500">Nhóm ngành tốn kém nhất</span>
            <div className="my-2">
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate block">
                {reportData?.categoryBreakdown?.[0]?.category || "Chưa có dữ liệu"}
              </span>
              <span className="text-xs text-zinc-400 font-mono tabular-nums">
                {reportData?.categoryBreakdown?.[0]?.percentage || 0}% ngân sách tháng
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">Tỷ trọng chi tiêu hàng đầu</span>
          </Card>
        </div>

        {/* 3 Khối Báo cáo */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Đang tổng hợp báo cáo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 1. Biểu đồ chi tiêu hằng ngày */}
            <Card className="border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-500" />
                  <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    Chi tiêu hằng ngày trong tháng
                  </h3>
                </div>
                <Badge variant="outline" size="sm" className="font-mono tabular-nums text-[10px]">
                  {reportData?.dailySpending?.length || 0} ngày có phát sinh
                </Badge>
              </div>
              <SpendingBarList days={reportData?.dailySpending || []} />
            </Card>

            {/* 2. Phân bổ theo nhóm danh mục */}
            <Card className="border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-zinc-500" />
                  <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    Cơ cấu chi tiêu theo nhóm hàng
                  </h3>
                </div>
                <Badge variant="outline" size="sm" className="font-mono tabular-nums text-[10px]">
                  {reportData?.categoryBreakdown?.length || 0} nhóm
                </Badge>
              </div>
              <CategoryBreakdown
                categories={reportData?.categoryBreakdown || []}
                grandTotal={reportData?.grandTotal || 0}
              />
            </Card>

            {/* 3. Top 10 mặt hàng chi tiêu nhiều nhất */}
            <Card className="lg:col-span-2 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-zinc-500" />
                  <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                    Top 10 mặt hàng tốn tiền nhất
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400">Xếp hạng theo tổng tiền</span>
              </div>
              <TopSpendingList items={reportData?.topItems || []} />
            </Card>
          </div>
        )}

        {/* Khối Xuất / Sao Lưu / Khôi Phục Dữ Liệu */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Xuất File & Sao Lưu An Toàn
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Action 1: Xuất Excel (CSV) */}
            <Card className="border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 pt-1">
                  Xuất File Excel (CSV)
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Xuất toàn bộ dòng hàng chi tiết, hỗ trợ mở trực tiếp trên Excel tiếng Việt không lỗi font (UTF-8 BOM).
                </p>
              </div>
              <a
                href={`/api/export/csv?month=${currentMonth}`}
                download
                className="w-full inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-opacity gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải bảng tính Excel</span>
              </a>
            </Card>

            {/* Action 2: Sao lưu JSON */}
            <Card className="border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 pt-1">
                  Sao Lưu Toàn Bộ (JSON)
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Tải về tệp sao lưu độc lập gồm toàn bộ sổ nhật ký nhập hàng, danh mục và bộ đếm mã số.
                </p>
              </div>
              <a
                href="/api/export/backup"
                download
                className="w-full inline-flex items-center justify-center min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tệp sao lưu JSON</span>
              </a>
            </Card>

            {/* Action 3: Khôi phục JSON (Choice A Merge Strategy) */}
            <Card className="border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 pt-1">
                  Khôi Phục Dữ Liệu
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
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
                  className="min-h-[44px] text-xs font-semibold gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
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
