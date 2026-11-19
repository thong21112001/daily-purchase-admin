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
  Edit2,
} from "lucide-react";
import Link from "next/link";
import { EditPurchaseModal } from "@/components/entry/EditPurchaseModal";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { SavingsCheckinWidget } from "@/components/savings/SavingsCheckinWidget";

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
  editCount?: number;
  editedAt?: string;
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

  // Sửa & Xóa phiếu
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PurchaseRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        const list = Array.isArray(purchasesJson.data)
          ? purchasesJson.data
          : purchasesJson.data?.purchases || [];
        setPurchases(list);
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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/purchases/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã xóa thành công ${deleteTarget.code}`, "success");
        setDeleteTarget(null);
        triggerRefresh();
        loadData();
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
    <div className="space-y-5">
      {/* 0. Widget Điểm Danh Tiết Kiệm Mỗi Ngày */}
      <SavingsCheckinWidget />

      {/* 1. Bento KPI Cards (3 ô tối giản Fresh & Free) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Hôm nay (Xanh Mint chủ đạo) */}
        <Card className="bg-emerald-600 text-white border-none shadow-md shadow-emerald-600/20 p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100">
              Hôm nay ({formatDateVN(new Date())})
            </span>
            <ShoppingBag className="w-4 h-4 text-emerald-100" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight">
              {formatVND(kpis?.today.totalAmount || 0)}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-emerald-100 font-mono tabular-nums">
            <span>{kpis?.today.purchaseCount || 0} đợt mua</span>
            <span>{kpis?.today.itemCount || 0} món</span>
          </div>
        </Card>

        {/* Card 2: Hôm qua */}
        <Card className="border border-[#D8EFE9] bg-white p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hôm qua</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-slate-900">
              {formatVND(kpis?.yesterday.totalAmount || 0)}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            {kpis?.yesterday.purchaseCount || 0} đợt mua
          </div>
        </Card>

        {/* Card 3: Lũy kế tháng này */}
        <Card className="border border-[#D8EFE9] bg-white p-4 sm:p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tháng này ({kpis?.thisMonth.monthKey || ""})
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2.5">
            <div className="text-xl sm:text-2xl font-extrabold font-mono tabular-nums text-emerald-700">
              {formatVND(kpis?.thisMonth.totalAmount || 0)}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono tabular-nums">{kpis?.thisMonth.purchaseCount || 0} đợt</span>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
            >
              Chi tiết <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      </section>

      {/* 2. Tiêu đề danh sách & Nút Thao Tác Nhanh */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
              Hàng hóa đã mua hôm nay
            </h2>
            <Badge variant="mint" size="sm" className="font-mono tabular-nums">
              {purchases.length} đợt
            </Badge>
          </div>
          <Button
            size="sm"
            variant="peach"
            onClick={openQuickEntry}
            className="min-h-[44px] px-3.5 text-xs font-bold gap-1.5 hidden sm:inline-flex shadow-sm shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi hàng mới</span>
          </Button>
        </div>

        {/* 3. Danh sách các đợt mua hàng */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Đang đồng bộ sổ nhập hàng...</p>
          </div>
        ) : purchases.length === 0 ? (
          <Card className="border-dashed border-2 border-emerald-200 p-8 sm:p-12 text-center bg-white shadow-xs">
            <div className="max-w-xs mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Hôm nay chưa ghi đợt mua hàng nào
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sau khi đi chợ hoặc mua nguyên vật liệu, chạm nút bên dưới để ghi nhận ngay.
              </p>
              <div className="pt-2">
                <Button
                  onClick={openQuickEntry}
                  fullWidth
                  variant="peach"
                  size="lg"
                  className="min-h-[48px] text-sm font-bold gap-2 shadow-md shadow-orange-500/25"
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
              const timeString = new Date(purchase.purchaseDate).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Card
                  key={purchase._id}
                  className="border border-[#D8EFE9] bg-white overflow-hidden shadow-xs rounded-2xl"
                >
                  {/* Header phiếu: 2-tier trên Mobile (<640px), 1 dòng trên Desktop (sm:) */}
                  <div className="p-3 sm:p-3.5 bg-[#F4FBF9] border-b border-[#D8EFE9]">
                    {/* TIER 1 Mobile / Trái-Phải Desktop */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs font-bold text-emerald-800 shrink-0">
                          {purchase.code}
                        </span>
                        <span className="text-slate-300 text-xs">•</span>
                        <span className="font-mono text-xs text-slate-500 shrink-0">{timeString}</span>

                        {/* Trên desktop, hiện luôn supplier & payment badge ở Tier 1 */}
                        {purchase.supplier && (
                          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-700 truncate max-w-[200px]">
                            <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate font-medium">{purchase.supplier}</span>
                          </div>
                        )}

                        <div className="hidden sm:block">
                          <Badge
                            variant={purchase.paymentMethod === "TRANSFER" ? "sky" : "mint"}
                            size="sm"
                            className="text-[10px] py-0 px-1.5 font-semibold"
                          >
                            {purchase.paymentMethod === "TRANSFER" ? "Chuyển khoản" : "Tiền mặt"}
                          </Badge>
                        </div>
                      </div>

                      {/* Tiền tổng và thao tác desktop */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-sm sm:text-base font-extrabold font-mono tabular-nums text-slate-900">
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

                    {/* TIER 2 Mobile (chỉ hiện trên màn hình < sm) */}
                    <div className="flex sm:hidden items-center justify-between gap-2 pt-2 mt-2 border-t border-emerald-100/60">
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        {purchase.supplier && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-700 truncate max-w-[150px]">
                            <Store className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate font-medium">{purchase.supplier}</span>
                          </div>
                        )}

                        <Badge
                          variant={purchase.paymentMethod === "TRANSFER" ? "sky" : "mint"}
                          size="sm"
                          className="text-[9px] py-0 px-1.5 font-semibold"
                        >
                          {purchase.paymentMethod === "TRANSFER" ? (
                            <span className="flex items-center gap-0.5">
                              <CreditCard className="w-2.5 h-2.5" /> CK
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5">
                              <Banknote className="w-2.5 h-2.5" /> TM
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

                  {/* Danh sách mặt hàng trong phiếu */}
                  <div className="p-3 sm:p-4 divide-y divide-emerald-50">
                    {purchase.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
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
                            <span className="text-slate-500 font-mono tabular-nums text-[11px]">
                              {item.quantity} {item.unit} x {formatVND(item.unitPrice)}
                            </span>
                            {item.note && (
                              <span className="text-slate-400 text-[11px] italic">
                                ({item.note})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="font-bold font-mono tabular-nums text-slate-900 text-xs sm:text-sm shrink-0">
                          {formatVND(item.lineTotal)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ghi chú chung phiếu (nếu có) */}
                  {purchase.note && (
                    <div className="px-3.5 py-2 bg-slate-50/70 border-t border-[#D8EFE9] text-xs text-slate-500 italic">
                      Ghi chú: {purchase.note}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Modals Sửa / Xóa */}
      <EditPurchaseModal
        isOpen={!!editingPurchaseId}
        onClose={() => setEditingPurchaseId(null)}
        purchaseId={editingPurchaseId}
        onSuccess={() => {
          setEditingPurchaseId(null);
          triggerRefresh();
          loadData();
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

export default function DashboardPage() {
  return (
    <AdminLayoutShell>
      <DashboardContent />
    </AdminLayoutShell>
  );
}
