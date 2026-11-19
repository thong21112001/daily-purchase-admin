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
  Edit2,
  X,
} from "lucide-react";
import { EditPurchaseModal } from "@/components/entry/EditPurchaseModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

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
  editCount?: number;
  editedAt?: string;
  createdAt: string;
}

type DateFilterPreset = "today" | "yesterday" | "last_7_days" | "this_month" | "all";

function HistoryContent() {
  const { showToast } = useToast();

  const [preset, setPreset] = useState<DateFilterPreset>("this_month");
  const [searchQuery, setSearchQuery] = useState("");
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  // Sửa phiếu & Xóa phiếu
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        const list = Array.isArray(json.data)
          ? json.data
          : json.data?.purchases || [];
        setPurchases(list);
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

  // Nhóm phiếu theo từng ngày (dateKey)
  const groupedPurchases = useMemo(() => {
    const map = new Map<string, { purchases: PurchaseRecord[]; dayTotal: number }>();

    for (const p of purchases) {
      const key = p.dateKey || p.purchaseDate.substring(0, 10);
      if (!map.has(key)) {
        map.set(key, { purchases: [], dayTotal: 0 });
      }
      const g = map.get(key)!;
      g.purchases.push(p);
      g.dayTotal += p.totalAmount || 0;
    }

    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [purchases]);

  const totalFilteredAmount = useMemo(() => {
    return purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  }, [purchases]);

  const toggleCollapse = (dateKey: string) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/purchases/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã xóa thành công ${deleteTarget.code}`, "success");
        setDeleteTarget(null);
        loadPurchases();
      } else {
        showToast(json.message || "Xóa thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi xóa phiếu", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tiêu đề trang & Tổng tiền lọc */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8EFE9] pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Sổ Mua Hàng Theo Ngày
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch sử toàn bộ các lần nhập hàng, gom theo từng ngày để dễ đối soát
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 self-start sm:self-auto">
          <span className="text-xs text-emerald-800 font-medium">Tổng kỳ lọc:</span>
          <span className="font-mono tabular-nums font-extrabold text-sm sm:text-base text-emerald-900">
            {formatVND(totalFilteredAmount)}
          </span>
        </div>
      </div>

      {/* Bộ Lọc & Tìm kiếm */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "today", label: "Hôm nay" },
            { id: "yesterday", label: "Hôm qua" },
            { id: "last_7_days", label: "7 ngày qua" },
            { id: "this_month", label: "Tháng này" },
            { id: "all", label: "Tất cả" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPreset(item.id as DateFilterPreset)}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                preset === item.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-[#D8EFE9] hover:bg-emerald-50/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Thanh tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã (#PO-xxx), nơi mua (chợ, siêu thị), tên món..."
            className="w-full h-11 pl-10 pr-10 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Danh sách theo ngày (Accordion) */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Đang tải lịch sử mua hàng...</p>
        </div>
      ) : groupedPurchases.length === 0 ? (
        <Card className="border-dashed border-2 border-[#D8EFE9] p-8 text-center bg-white shadow-xs">
          <div className="max-w-xs mx-auto space-y-2">
            <Calendar className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900">
              Không tìm thấy dữ liệu
            </h3>
            <p className="text-xs text-slate-500">
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
                {/* Accordion Ngày */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(dateKey)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-white border border-[#D8EFE9] shadow-xs flex items-center justify-between gap-3 text-left transition-colors hover:bg-emerald-50/40"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {formattedDateStr}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">({dateKey})</span>
                    <Badge variant="mint" size="sm" className="font-mono tabular-nums text-[10px] py-0">
                      {group.purchases.length} đợt
                    </Badge>
                  </div>

                  <div className="font-mono tabular-nums font-bold text-xs sm:text-sm text-emerald-700 shrink-0">
                    {formatVND(group.dayTotal)}
                  </div>
                </button>

                {/* Danh sách các phiếu trong ngày */}
                {!isCollapsed && (
                  <div className="space-y-2.5 pl-2 sm:pl-3 border-l-2 border-emerald-200">
                    {group.purchases.map((purchase) => {
                      const timeStr = new Date(purchase.purchaseDate).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <Card
                          key={purchase._id}
                          className="border border-[#D8EFE9] bg-white overflow-hidden shadow-xs rounded-2xl"
                        >
                          {/* 2-tier header trên Mobile (<640px), 1 dòng trên Desktop */}
                          <div className="p-3 bg-emerald-50/30 border-b border-[#D8EFE9]">
                            {/* TIER 1 */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-xs font-bold text-emerald-800 shrink-0">
                                  {purchase.code}
                                </span>
                                <span className="text-slate-300 text-xs">•</span>
                                <span className="font-mono text-xs text-slate-500 shrink-0">{timeStr}</span>

                                {purchase.supplier && (
                                  <div className="hidden sm:flex items-center gap-1 text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 truncate max-w-[200px]">
                                    <Store className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                    <span className="truncate">{purchase.supplier}</span>
                                  </div>
                                )}

                                <div className="hidden sm:block">
                                  <Badge
                                    variant="secondary"
                                    size="sm"
                                    className="text-[10px] py-0 px-1.5"
                                  >
                                    {purchase.paymentMethod === "TRANSFER" ? "CK" : "Tiền mặt"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-900 mr-1">
                                  {formatVND(purchase.totalAmount)}
                                </span>

                                {(purchase.editCount || 0) >= 1 && (
                                  <Badge
                                    variant="outline"
                                    size="sm"
                                    className="hidden sm:inline-flex text-[10px] py-0 px-1.5 text-amber-700 bg-amber-50 border-amber-200"
                                  >
                                    Đã sửa (1/1)
                                  </Badge>
                                )}

                                <div className="hidden sm:flex items-center gap-1 ml-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={(purchase.editCount || 0) >= 1}
                                    onClick={() => setEditingPurchaseId(purchase._id)}
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                                    title="Sửa phiếu"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteTarget(purchase)}
                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    title="Xóa phiếu"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* TIER 2 Mobile */}
                            <div className="flex sm:hidden items-center justify-between gap-2 pt-2 mt-2 border-t border-emerald-100/60">
                              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                {purchase.supplier && (
                                  <div className="flex items-center gap-1 text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 truncate max-w-[150px]">
                                    <Store className="w-3 h-3 text-sky-500 shrink-0" />
                                    <span className="truncate">{purchase.supplier}</span>
                                  </div>
                                )}

                                <Badge
                                  variant="secondary"
                                  size="sm"
                                  className="text-[9px] py-0 px-1.5"
                                >
                                  {purchase.paymentMethod === "TRANSFER" ? (
                                    <span className="flex items-center gap-0.5">
                                      <CreditCard className="w-2.5 h-2.5 text-sky-600" /> CK
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5">
                                      <Banknote className="w-2.5 h-2.5 text-emerald-600" /> TM
                                    </span>
                                  )}
                                </Badge>

                                {(purchase.editCount || 0) >= 1 && (
                                  <Badge
                                    variant="outline"
                                    size="sm"
                                    className="text-[9px] py-0 px-1 text-amber-700 bg-amber-50 border-amber-200"
                                  >
                                    Đã sửa
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={(purchase.editCount || 0) >= 1}
                                  onClick={() => setEditingPurchaseId(purchase._id)}
                                  className="min-h-[36px] min-w-[36px] h-9 w-9 p-0 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                                  title="Sửa phiếu"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteTarget(purchase)}
                                  className="min-h-[36px] min-w-[36px] h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  title="Xóa phiếu"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Danh sách mặt hàng con */}
                          <div className="p-3 divide-y divide-emerald-50">
                            {purchase.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-900 truncate">
                                    {item.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-slate-500 font-mono tabular-nums text-[11px] flex-wrap">
                                    <span>
                                      {item.quantity} {item.unit} x {formatVND(item.unitPrice)}
                                    </span>
                                    {item.note && (
                                      <span className="text-slate-400 italic">
                                        ({item.note})
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="font-mono tabular-nums font-bold text-slate-900 text-xs sm:text-sm shrink-0">
                                  {formatVND(item.lineTotal)}
                                </div>
                              </div>
                            ))}
                          </div>

                          {purchase.note && (
                            <div className="px-3 py-1.5 bg-slate-50/70 border-t border-[#D8EFE9] text-xs text-slate-500 italic">
                              Ghi chú: {purchase.note}
                            </div>
                          )}
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

      {/* Modal Sửa & Xóa */}
      <EditPurchaseModal
        isOpen={!!editingPurchaseId}
        onClose={() => setEditingPurchaseId(null)}
        purchaseId={editingPurchaseId}
        onSuccess={() => {
          setEditingPurchaseId(null);
          loadPurchases();
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget ? `Phiếu mua hàng: ${deleteTarget.code}` : ""}
        itemAmount={deleteTarget?.totalAmount}
        itemDetails={
          deleteTarget
            ? `Thời gian: ${formatDateVN(new Date(deleteTarget.purchaseDate))} • Gồm ${deleteTarget.itemCount} món`
            : undefined
        }
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function HistoryPage() {
  return (
    <AdminLayoutShell>
      <HistoryContent />
    </AdminLayoutShell>
  );
}
