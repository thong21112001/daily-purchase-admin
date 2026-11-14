"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatVND } from "@/lib/utils/currency";
import {
  getTodayKey,
  getYesterdayKey,
  getDateRange,
  formatDateVN,
} from "@/lib/utils/date";
import {
  Search,
  Calendar,
  Trash2,
  Store,
  CreditCard,
  Banknote,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";

interface PurchaseItem {
  name: string;
  category?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  note?: string;
}

interface PurchaseRecord {
  _id: string;
  code: string;
  purchaseDate: string;
  dateKey: string;
  supplier?: string;
  paymentMethod: "CASH" | "TRANSFER";
  items: PurchaseItem[];
  totalAmount: number;
  itemCount: number;
  note?: string;
  createdAt: string;
}

type DateFilterPreset = "today" | "yesterday" | "last_7_days" | "this_month" | "all";

export default function HistoryPage() {
  const { showToast } = useToast();

  const [preset, setPreset] = useState<DateFilterPreset>("this_month");
  const [searchQuery, setSearchQuery] = useState("");
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  const filterParams = useMemo(() => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();

    if (preset === "today") return { dateKey: today };
    if (preset === "yesterday") return { dateKey: yesterday };
    if (preset === "last_7_days") {
      const range = getDateRange("last_7_days");
      return { startDateKey: range.startDateKey, endDateKey: range.endDateKey };
    }
    if (preset === "this_month") {
      const range = getDateRange("this_month");
      return { startDateKey: range.startDateKey, endDateKey: range.endDateKey };
    }
    return {}; // "all"
  }, [preset]);

  const loadPurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterParams.dateKey) params.set("dateKey", filterParams.dateKey);
      if (filterParams.startDateKey) params.set("startDateKey", filterParams.startDateKey);
      if (filterParams.endDateKey) params.set("endDateKey", filterParams.endDateKey);
      if (searchQuery.trim()) params.set("query", searchQuery.trim());
      params.set("limit", "100");

      const res = await fetch(`/api/purchases?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPurchases(json.data.purchases || []);
      }
    } catch {
      showToast("Không thể tải sổ theo ngày. Vui lòng thử lại", "error");
    } finally {
      setIsLoading(false);
    }
  }, [filterParams, searchQuery, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPurchases();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadPurchases]);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc muốn xóa phiếu ${code}?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/purchases/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã xóa thành công ${code}`, "success");
        loadPurchases();
      } else {
        showToast(json.message || "Xóa thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi xóa", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleCollapse = (dateKey: string) => {
    setCollapsedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));
  };

  // Gom nhóm theo dateKey
  const groupedPurchases = useMemo(() => {
    const groups: { [dateKey: string]: { purchases: PurchaseRecord[]; dayTotal: number } } = {};

    for (const p of purchases) {
      if (!groups[p.dateKey]) {
        groups[p.dateKey] = { purchases: [], dayTotal: 0 };
      }
      groups[p.dateKey].purchases.push(p);
      groups[p.dateKey].dayTotal += p.totalAmount;
    }

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [purchases]);

  const totalPeriodAmount = useMemo(() => {
    return purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  }, [purchases]);

  return (
    <AdminLayoutShell>
      <div className="space-y-5">
        {/* Header & Tổng chi kỳ lọc */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Sổ Nhập Hàng Theo Ngày
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Tra cứu lịch sử mua sắm, gom nhóm theo từng ngày
            </p>
          </div>
          <div className="text-left sm:text-right bg-zinc-100 dark:bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] text-zinc-500 block">Tổng chi theo bộ lọc</span>
            <span className="text-lg font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {formatVND(totalPeriodAmount)}
            </span>
          </div>
        </div>

        {/* Thanh tìm kiếm & Bộ lọc khoảng thời gian */}
        <div className="space-y-3">
          {/* Ô tìm kiếm không dấu */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên món (VD: 'ca phe', 'sua'), nơi mua, mã phiếu..."
              className="w-full h-11 pl-10 pr-4 text-base rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
            />
          </div>

          {/* Dãy nút chip thời gian (Galaxy A35 touch-friendly) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(
              [
                { id: "today", label: "Hôm nay" },
                { id: "yesterday", label: "Hôm qua" },
                { id: "last_7_days", label: "7 ngày qua" },
                { id: "this_month", label: "Tháng này" },
                { id: "all", label: "Tất cả" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreset(item.id)}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                  preset === item.id
                    ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-semibold"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách nhóm theo ngày */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Đang tải lịch sử mua hàng...</p>
          </div>
        ) : groupedPurchases.length === 0 ? (
          <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 p-8 text-center">
            <div className="max-w-xs mx-auto space-y-2">
              <Calendar className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Không tìm thấy dữ liệu
              </h3>
              <p className="text-xs text-zinc-400">
                Không có đợt nhập hàng nào phù hợp với bộ lọc và từ khóa hiện tại.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupedPurchases.map(([dateKey, group]) => {
              const isCollapsed = !!collapsedDates[dateKey];
              const dateObj = new Date(dateKey + "T00:00:00+07:00");
              const formattedDateStr = formatDateVN(dateObj);

              return (
                <div key={dateKey} className="space-y-2">
                  {/* Thanh Header ngày dạng Accordion */}
                  <button
                    type="button"
                    onClick={() => toggleCollapse(dateKey)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 text-left transition-colors hover:bg-zinc-200/70 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {formattedDateStr}
                      </span>
                      <span className="font-mono text-[11px] text-zinc-400">({dateKey})</span>
                      <Badge variant="outline" size="sm" className="font-mono tabular-nums text-[10px] py-0">
                        {group.purchases.length} đợt
                      </Badge>
                    </div>

                    <div className="font-mono tabular-nums font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 shrink-0">
                      {formatVND(group.dayTotal)}
                    </div>
                  </button>

                  {/* Danh sách các phiếu trong ngày */}
                  {!isCollapsed && (
                    <div className="space-y-2.5 pl-2 sm:pl-3 border-l-2 border-zinc-200 dark:border-zinc-800">
                      {group.purchases.map((purchase) => {
                        const isDeleting = deletingId === purchase._id;
                        return (
                          <Card
                            key={purchase._id}
                            className="border border-zinc-200 dark:border-zinc-800 overflow-hidden"
                          >
                            {/* Header phiếu con */}
                            <div className="p-3 bg-zinc-50/60 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                  {purchase.code}
                                </span>

                                {purchase.supplier && (
                                  <div className="flex items-center gap-1 text-xs text-zinc-500 truncate">
                                    <Store className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                    <span className="truncate">{purchase.supplier}</span>
                                  </div>
                                )}

                                <Badge
                                  variant="secondary"
                                  size="sm"
                                  className="text-[10px] py-0 px-1.5 flex items-center gap-1"
                                >
                                  {purchase.paymentMethod === "TRANSFER" ? (
                                    <>
                                      <CreditCard className="w-2.5 h-2.5" />
                                      <span>CK</span>
                                    </>
                                  ) : (
                                    <>
                                      <Banknote className="w-2.5 h-2.5" />
                                      <span>Tiền mặt</span>
                                    </>
                                  )}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                                  {formatVND(purchase.totalAmount)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isDeleting}
                                  onClick={() => handleDelete(purchase._id, purchase.code)}
                                  className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Danh sách mặt hàng con */}
                            <div className="p-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                              {purchase.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div className="min-w-0">
                                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                      {item.name}
                                    </span>
                                    <span className="text-zinc-400 font-mono tabular-nums text-[11px] ml-2">
                                      {item.quantity} {item.unit} x {formatVND(item.unitPrice)}
                                    </span>
                                    {item.note && (
                                      <span className="text-zinc-400 text-[11px] italic ml-1">
                                        ({item.note})
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono tabular-nums font-semibold text-zinc-800 dark:text-zinc-200 text-xs shrink-0">
                                    {formatVND(item.lineTotal)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayoutShell>
  );
}
