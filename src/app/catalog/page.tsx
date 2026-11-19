"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useToast } from "@/components/ui/Toast";
import { formatVND } from "@/lib/utils/currency";
import {
  Package,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Store,
  Calendar,
} from "lucide-react";
import {
  CatalogToolbar,
  CatalogSortOption,
} from "@/components/catalog/CatalogToolbar";
import {
  CatalogItemModal,
  CatalogItemData,
  CatalogItemPayload,
} from "@/components/catalog/CatalogItemModal";
import {
  SupplierModal,
  SupplierData,
  SupplierPayload,
} from "@/components/catalog/SupplierModal";

function CatalogContent() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"items" | "suppliers">("items");

  // Items State
  const [items, setItems] = useState<CatalogItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<CatalogSortOption>("usage");
  const [isItemsLoading, setIsItemsLoading] = useState(true);

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItemData | null>(null);
  const [isItemSubmitting, setIsItemSubmitting] = useState(false);

  // Total Counts
  const [totalItemsCount, setTotalItemsCount] = useState<number>(0);
  const [totalSuppliersCount, setTotalSuppliersCount] = useState<number>(0);

  // Suppliers State
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(false);

  // Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierData | null>(null);
  const [isSupplierSubmitting, setIsSupplierSubmitting] = useState(false);

  // Delete State
  const [deleteItemTarget, setDeleteItemTarget] = useState<CatalogItemData | null>(null);
  const [deleteSupplierTarget, setDeleteSupplierTarget] = useState<SupplierData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tải tổng số lượng cho 2 tab
  const fetchTotalCounts = useCallback(async () => {
    try {
      const [itemsRes, suppliersRes] = await Promise.all([
        fetch("/api/catalog?limit=1"),
        fetch("/api/suppliers?limit=1"),
      ]);
      const [itemsJson, suppliersJson] = await Promise.all([itemsRes.json(), suppliersRes.json()]);
      if (itemsJson.success && itemsJson.pagination?.totalCount !== undefined) {
        setTotalItemsCount(itemsJson.pagination.totalCount);
      }
      if (suppliersJson.success && suppliersJson.pagination?.totalCount !== undefined) {
        setTotalSuppliersCount(suppliersJson.pagination.totalCount);
      }
    } catch {
      // Ignore background errors
    }
  }, []);

  // Load Catalog Items with Sort
  const loadCatalog = useCallback(async () => {
    setIsItemsLoading(true);
    try {
      const params = new URLSearchParams();
      if (itemSearchQuery.trim()) {
        params.set("q", itemSearchQuery.trim());
      }
      if (selectedCategory !== "Tất cả") {
        params.set("category", selectedCategory);
      }
      params.set("sort", sortBy);
      params.set("limit", "100");

      const res = await fetch(`/api/catalog?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
        if (
          !itemSearchQuery.trim() &&
          selectedCategory === "Tất cả" &&
          json.pagination?.totalCount !== undefined
        ) {
          setTotalItemsCount(json.pagination.totalCount);
        }
      }
    } catch {
      showToast("Không thể tải danh mục mặt hàng", "error");
    } finally {
      setIsItemsLoading(false);
    }
  }, [itemSearchQuery, selectedCategory, sortBy, showToast]);

  // Load Suppliers
  const loadSuppliers = useCallback(async () => {
    setIsSuppliersLoading(true);
    try {
      const params = new URLSearchParams();
      if (supplierSearchQuery.trim()) {
        params.set("query", supplierSearchQuery.trim());
      }
      params.set("limit", "100");
      const res = await fetch(`/api/suppliers?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSuppliers(json.data || []);
        if (!supplierSearchQuery.trim() && json.pagination?.totalCount !== undefined) {
          setTotalSuppliersCount(json.pagination.totalCount);
        }
      }
    } catch {
      showToast("Không thể tải danh sách nơi mua", "error");
    } finally {
      setIsSuppliersLoading(false);
    }
  }, [supplierSearchQuery, showToast]);

  // Initial load
  useEffect(() => {
    fetchTotalCounts();
    loadCatalog();
    loadSuppliers();
  }, [fetchTotalCounts, loadCatalog, loadSuppliers]);

  // Handlers for Items
  const handleSaveItem = async (payload: CatalogItemPayload): Promise<boolean> => {
    setIsItemSubmitting(true);
    try {
      let res;
      if (editingItem) {
        res = await fetch(`/api/catalog/${editingItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/catalog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(editingItem ? "Đã cập nhật mặt hàng" : "Đã thêm mặt hàng mới", "success");
        loadCatalog();
        fetchTotalCounts();
        return true;
      } else {
        showToast(json.message || "Lưu thất bại", "error");
        return false;
      }
    } catch {
      showToast("Lỗi kết nối khi lưu", "error");
      return false;
    } finally {
      setIsItemSubmitting(false);
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (!deleteItemTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/catalog/${deleteItemTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã xóa ${deleteItemTarget.name}`, "success");
        setDeleteItemTarget(null);
        loadCatalog();
        fetchTotalCounts();
      } else {
        showToast(json.message || "Xóa thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi xóa", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedStarters = async () => {
    try {
      const res = await fetch("/api/catalog?seed=true");
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Đã nạp danh mục mẫu", "success");
        loadCatalog();
        fetchTotalCounts();
      }
    } catch {
      showToast("Lỗi kết nối khi nạp danh mục mẫu", "error");
    }
  };

  // Handlers for Suppliers
  const handleSaveSupplier = async (payload: SupplierPayload): Promise<boolean> => {
    setIsSupplierSubmitting(true);
    try {
      let res;
      if (editingSupplier) {
        res = await fetch(`/api/suppliers/${editingSupplier._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(editingSupplier ? "Đã cập nhật nơi mua" : "Đã thêm nơi mua mới", "success");
        loadSuppliers();
        fetchTotalCounts();
        return true;
      } else {
        showToast(json.message || "Lưu thất bại", "error");
        return false;
      }
    } catch {
      showToast("Lỗi kết nối khi lưu", "error");
      return false;
    } finally {
      setIsSupplierSubmitting(false);
    }
  };

  const handleConfirmDeleteSupplier = async () => {
    if (!deleteSupplierTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/suppliers/${deleteSupplierTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã xóa nơi mua ${deleteSupplierTarget.name}`, "success");
        setDeleteSupplierTarget(null);
        loadSuppliers();
        fetchTotalCounts();
      } else {
        showToast(json.message || "Xóa thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi xóa", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8EFE9] pb-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
            Mặt Hàng & Nơi Mua
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh mục, đơn giá tham khảo và lịch sử nơi mua
          </p>
        </div>

        {/* Tab switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-[#D8EFE9]">
            <button
              type="button"
              onClick={() => setActiveTab("items")}
              className={`min-h-[38px] px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "items"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Mặt hàng ({totalItemsCount || items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("suppliers")}
              className={`min-h-[38px] px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "suppliers"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Nơi mua ({totalSuppliersCount || suppliers.length})
            </button>
          </div>

          {activeTab === "items" ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeedStarters}
                className="min-h-[44px] px-3 text-xs gap-1.5"
                title="Nạp bộ danh mục mẫu cho quán cà phê"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nạp mẫu F&B</span>
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingItem(null);
                  setIsItemModalOpen(true);
                }}
                className="min-h-[44px] px-3.5 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm món</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setEditingSupplier(null);
                setIsSupplierModalOpen(true);
              }}
              className="min-h-[44px] px-3.5 text-xs font-semibold gap-1.5 bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm nơi mua</span>
            </Button>
          )}
        </div>
      </div>

      {/* ================= TAB 1: MẶT HÀNG ================= */}
      {activeTab === "items" && (
        <div className="space-y-4">
          <CatalogToolbar
            searchQuery={itemSearchQuery}
            onSearchChange={setItemSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Items Grid */}
          {isItemsLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Đang tải danh mục mặt hàng...</p>
            </div>
          ) : items.length === 0 ? (
            <Card className="border-dashed border-2 border-[#D8EFE9] p-8 text-center bg-white">
              <div className="max-w-xs mx-auto space-y-3">
                <Package className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-900">Chưa có mặt hàng nào</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mặt hàng sẽ tự động được ghi nhận khi bạn lưu phiếu mua, hoặc nạp nhanh bộ mẫu cà phê.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button onClick={handleSeedStarters} size="sm" variant="outline" className="min-h-[44px]">
                    Nạp mẫu cà phê
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingItem(null);
                      setIsItemModalOpen(true);
                    }}
                    size="sm"
                    className="min-h-[44px]"
                  >
                    + Thêm thủ công
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <Card
                  key={item._id}
                  className="border border-[#D8EFE9] bg-white p-3.5 flex flex-col justify-between space-y-3 hover:border-emerald-300 shadow-xs transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2 break-words">
                        {item.name}
                      </h3>
                      <Badge variant="mint" size="sm" className="text-[10px] shrink-0 font-medium">
                        {item.defaultUnit}
                      </Badge>
                    </div>
                    <Badge variant="secondary" size="sm" className="text-[10px] py-0 px-1.5">
                      {item.category || "Khác"}
                    </Badge>
                  </div>

                  {/* Giá tham khảo & biến động */}
                  <div className="bg-emerald-50/40 rounded-xl p-2.5 border border-[#D8EFE9] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Giá gần nhất:</span>
                      <span className="font-mono tabular-nums font-bold text-emerald-800">
                        {item.lastUnitPrice > 0 ? formatVND(item.lastUnitPrice) : "Chưa có giá"}
                      </span>
                    </div>

                    {(item.minUnitPrice !== undefined || item.maxUnitPrice !== undefined) && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono tabular-nums pt-1 border-t border-emerald-100">
                        <span className="flex items-center gap-0.5">
                          <TrendingDown className="w-2.5 h-2.5 text-emerald-600" />
                          Min: {formatVND(item.minUnitPrice || item.lastUnitPrice || 0)}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5 text-amber-600" />
                          Max: {formatVND(item.maxUnitPrice || item.lastUnitPrice || 0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer card */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#D8EFE9] text-xs">
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      Đã mua: {item.usageCount} lần
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingItem(item);
                          setIsItemModalOpen(true);
                        }}
                        className="h-9 w-9 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        title="Sửa mặt hàng"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteItemTarget(item)}
                        className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Xóa mặt hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: NƠI MUA (SUPPLIERS) ================= */}
      {activeTab === "suppliers" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={supplierSearchQuery}
              onChange={(e) => setSupplierSearchQuery(e.target.value)}
              placeholder="Tìm nơi mua theo tên (chợ, bách hóa xanh, vinmart...)"
              className="w-full h-11 pl-10 pr-10 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors"
            />
            {supplierSearchQuery && (
              <button
                type="button"
                onClick={() => setSupplierSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Suppliers Grid */}
          {isSuppliersLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Đang tải danh sách nơi mua...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <Card className="border-dashed border-2 border-[#D8EFE9] p-8 text-center bg-white">
              <div className="max-w-xs mx-auto space-y-3">
                <Store className="w-10 h-10 text-sky-400 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-900">Chưa có nơi mua nào</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hệ thống tự động lưu lại nơi mua mỗi khi bạn nhập phiếu mua hàng, hoặc thêm thủ công trước.
                </p>
                <Button
                  onClick={() => {
                    setEditingSupplier(null);
                    setIsSupplierModalOpen(true);
                  }}
                  size="sm"
                  className="min-h-[44px]"
                >
                  + Thêm nơi mua mới
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {suppliers.map((sup) => (
                <Card
                  key={sup._id}
                  className="border border-[#D8EFE9] bg-white p-3.5 flex flex-col justify-between space-y-3 hover:border-sky-300 shadow-xs transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Store className="w-4 h-4 text-sky-600 shrink-0" />
                        <h3 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                          {sup.name}
                        </h3>
                      </div>
                      <Badge variant="sky" size="sm" className="text-[10px] shrink-0 font-medium">
                        {sup.category || "Chợ"}
                      </Badge>
                    </div>
                    {sup.note && (
                      <p className="text-xs text-slate-500 italic line-clamp-2 break-words">
                        {sup.note}
                      </p>
                    )}
                  </div>

                  <div className="bg-sky-50/50 rounded-xl p-2.5 border border-sky-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Đã mua:</span>
                      <span className="font-mono tabular-nums font-bold text-sky-800">
                        {sup.usageCount} lần
                      </span>
                    </div>
                    {sup.lastUsedAt && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-sky-100">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Gần nhất:
                        </span>
                        <span className="font-mono tabular-nums">
                          {new Date(sup.lastUsedAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end pt-1 border-t border-[#D8EFE9] gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSupplier(sup);
                        setIsSupplierModalOpen(true);
                      }}
                      className="h-9 w-9 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                      title="Sửa nơi mua"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteSupplierTarget(sup)}
                      className="h-9 w-9 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Xóa nơi mua"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CatalogItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        editingItem={editingItem}
        isLoading={isItemSubmitting}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSave={handleSaveSupplier}
        editingSupplier={editingSupplier}
        isLoading={isSupplierSubmitting}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteItemTarget}
        onClose={() => setDeleteItemTarget(null)}
        onConfirm={handleConfirmDeleteItem}
        itemName={deleteItemTarget ? `Mặt hàng: ${deleteItemTarget.name}` : ""}
        itemAmount={deleteItemTarget?.lastUnitPrice}
        itemDetails={
          deleteItemTarget
            ? `Nhóm: ${deleteItemTarget.category} • Đơn vị: ${deleteItemTarget.defaultUnit} • Đã mua: ${deleteItemTarget.usageCount} lần`
            : undefined
        }
        isLoading={isDeleting}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteSupplierTarget}
        onClose={() => setDeleteSupplierTarget(null)}
        onConfirm={handleConfirmDeleteSupplier}
        itemName={deleteSupplierTarget ? `Nơi mua: ${deleteSupplierTarget.name}` : ""}
        itemDetails={
          deleteSupplierTarget
            ? `Phân loại: ${deleteSupplierTarget.category || "Khác"} • Đã mua: ${deleteSupplierTarget.usageCount} lần`
            : undefined
        }
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <AdminLayoutShell>
      <CatalogContent />
    </AdminLayoutShell>
  );
}
