"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminLayoutShell, useLayout } from "@/components/layout/AdminLayoutShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatVND } from "@/lib/utils/currency";
import { getTodayKey, formatDateVN } from "@/lib/utils/date";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  Banknote,
  Store,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface PurchaseItem {
  _id?: string;
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

interface DashboardKPIs {
  today: { dateKey: string; totalAmount: number; itemCount: number; purchaseCount: number };
  yesterday: { dateKey: string; totalAmount: number; purchaseCount: number };
  thisMonth: { monthKey: string; totalAmount: number; purchaseCount: number };
}

function DashboardContent() {
  const { openQuickEntry, refreshTick, triggerRefresh } = useLayout();
  const { showToast } = useToast();

  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const todayKey = getTodayKey();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [purchasesRes, reportsRes] = await Promise.all([
        fetch(`/api/purchases?dateKey=${todayKey}&limit=100`),
        fetch("/api/reports"),
      ]);

      const purchasesJson = await purchasesRes.json();
      const reportsJson = await reportsRes.json();

      if (purchasesJson.success) {
        setPurchases(purchasesJson.data.purchases || []);
      }
      if (reportsJson.success && reportsJson.data.kpis) {
        setKpis(reportsJson.data.kpis);
      }
    } catch {
      showToast("Không thể tải dữ liệu hôm nay. Vui lòng thử lại", "error");
    } finally {
      setIsLoading(false);
    }
  }, [todayKey, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTick]);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đợt mua hàng ${code} không? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/purchases/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã xóa thành công ${code}`, "success");
        triggerRefresh();
        loadData();
      } else {
        showToast(json.message || "Xóa thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi xóa phiếu", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Bento KPI Cards (3 ô tối giản) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Hôm nay */}
        <Card className="bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 border-none shadow-sm">
          <div className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300 dark:text-zinc-600">
                Hôm nay ({formatDateVN(new Date())})
              </span>
              <ShoppingBag className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
            </div>
            <div className="my-2.5">
              <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight">
                {formatVND(kpis?.today.totalAmount || 0)}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-300 dark:text-zinc-600 font-mono tabular-nums">
              <span>{kpis?.today.purchaseCount || 0} đợt mua</span>
              <span>{kpis?.today.itemCount || 0} món</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Hôm qua */}
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <div className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Hôm qua</span>
              <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="my-2.5">
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatVND(kpis?.yesterday.totalAmount || 0)}
              </div>
            </div>
            <div className="text-xs text-zinc-400 font-mono tabular-nums">
              {kpis?.yesterday.purchaseCount || 0} đợt mua
            </div>
          </div>
        </Card>

        {/* Card 3: Lũy kế tháng này */}
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <div className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">
                Tháng này ({kpis?.thisMonth.monthKey || ""})
              </span>
              <TrendingUp className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="my-2.5">
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatVND(kpis?.thisMonth.totalAmount || 0)}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono tabular-nums">{kpis?.thisMonth.purchaseCount || 0} đợt</span>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1 text-zinc-900 dark:text-zinc-100 hover:underline font-medium"
              >
                Chi tiết <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </Card>
      </section>

      {/* 2. Tiêu đề danh sách & Nút Thao Tác Nhanh */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Hàng hóa đã mua hôm nay
            </h2>
            <Badge variant="outline" size="sm" className="font-mono tabular-nums">
              {purchases.length} đợt
            </Badge>
          </div>
          <Button
            size="sm"
            onClick={openQuickEntry}
            className="h-10 px-3.5 text-xs font-medium gap-1.5 hidden sm:inline-flex"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi hàng mới</span>
          </Button>
        </div>

        {/* 3. Danh sách các đợt mua hàng */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Đang đồng bộ sổ nhập hàng...</p>
          </div>
        ) : purchases.length === 0 ? (
          /* Empty State */
          <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 text-center">
            <div className="max-w-xs mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Hôm nay chưa ghi đợt mua hàng nào
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sau khi đi chợ hoặc mua nguyên vật liệu, chạm nút bên dưới để ghi nhận ngay.
              </p>
              <div className="pt-2">
                <Button
                  onClick={openQuickEntry}
                  fullWidth
                  size="lg"
                  className="h-12 text-sm font-semibold gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Ghi hàng ngay</span>
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => {
              const isDeleting = deletingId === purchase._id;
              const timeString = new Date(purchase.purchaseDate).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Card
                  key={purchase._id}
                  className="border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all"
                >
                  {/* Header phiếu */}
                  <div className="p-3.5 sm:p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {purchase.code}
                      </span>
                      <span className="text-zinc-400 text-xs">•</span>
                      <span className="font-mono text-xs text-zinc-500">{timeString}</span>

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
                            <span>Chuyển khoản</span>
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
                      <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                        {formatVND(purchase.totalAmount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isDeleting}
                        onClick={() => handleDelete(purchase._id, purchase.code)}
                        className="h-9 w-9 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Xóa phiếu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Danh sách mặt hàng trong phiếu */}
                  <div className="p-3.5 sm:p-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {purchase.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {item.category && (
                              <Badge
                                variant="outline"
                                size="sm"
                                className="text-[10px] py-0 px-1.5"
                              >
                                {item.category}
                              </Badge>
                            )}
                            <span className="text-zinc-400 font-mono tabular-nums text-[11px]">
                              {item.quantity} {item.unit} x {formatVND(item.unitPrice)}
                            </span>
                            {item.note && (
                              <span className="text-zinc-400 text-[11px] italic">
                                ({item.note})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="font-mono tabular-nums font-semibold text-zinc-800 dark:text-zinc-200 text-xs shrink-0">
                          {formatVND(item.lineTotal)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {purchase.note && (
                    <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 italic">
                      Ghi chú: {purchase.note}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <AdminLayoutShell>
      <DashboardContent />
    </AdminLayoutShell>
  );
}
