"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useToast } from "@/components/ui/Toast";
import { formatVND, parseVND } from "@/lib/utils/currency";
import { DEFAULT_PURCHASE_CATEGORIES, COMMON_UNITS } from "@/lib/constants/categories";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Store,
  Calendar,
} from "lucide-react";

interface CatalogItemData {
  _id: string;
  name: string;
  normalizedName: string;
  category: string;
  defaultUnit: string;
  lastUnitPrice: number;
  minUnitPrice?: number;
  maxUnitPrice?: number;
  usageCount: number;
  updatedAt: string;
}

interface SupplierData {
  _id: string;
  name: string;
  normalizedName: string;
  category?: string;
  note?: string;
  usageCount: number;
  lastUsedAt?: string;
}

const SUPPLIER_CATEGORIES = [
  "Chợ",
  "Siêu thị",
  "Đại lý",
  "Tạp hóa",
  "Online",
  "Khác",
];

function CatalogContent() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"items" | "suppliers">("items");

  // Items State
  const [items, setItems] = useState<CatalogItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [isItemsLoading, setIsItemsLoading] = useState(true);

  // Item Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItemData | null>(null);
  const [formItemName, setFormItemName] = useState("");
  const [formItemCategory, setFormItemCategory] = useState("Nguyên liệu Cà phê & Trà");
  const [formItemUnit, setFormItemUnit] = useState("kg");
  const [formItemPrice, setFormItemPrice] = useState("");
  const [isItemSubmitting, setIsItemSubmitting] = useState(false);

  // Suppliers State
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(false);

  // Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierData | null>(null);
  const [formSupplierName, setFormSupplierName] = useState("");
  const [formSupplierCategory, setFormSupplierCategory] = useState("Chợ");
  const [formSupplierNote, setFormSupplierNote] = useState("");
  const [isSupplierSubmitting, setIsSupplierSubmitting] = useState(false);

  // Load Catalog Items
  const loadCatalog = useCallback(async () => {
    setIsItemsLoading(true);
    try {
      const params = new URLSearchParams();
      if (itemSearchQuery.trim()) {
        params.set("q", itemSearchQuery.trim());
      } else {
        if (selectedCategory !== "Tất cả") {
          params.set("category", selectedCategory);
        }
        params.set("limit", "100");
      }

      const res = await fetch(`/api/catalog?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
      }
    } catch {
      showToast("Không thể tải danh mục mặt hàng", "error");
    } finally {
      setIsItemsLoading(false);
    }
  }, [itemSearchQuery, selectedCategory, showToast]);

  // Load Suppliers
  const loadSuppliers = useCallback(async () => {
    setIsSuppliersLoading(true);
    try {
      const params = new URLSearchParams();
      if (supplierSearchQuery.trim()) {
        params.set("query", supplierSearchQuery.trim());
      }
      const res = await fetch(`/api/suppliers?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSuppliers(json.data || []);
      }
    } catch {
      showToast("Không thể tải danh sách nơi mua", "error");
    } finally {
      setIsSuppliersLoading(false);
    }
  }, [supplierSearchQuery, showToast]);

  useEffect(() => {
    if (activeTab === "items") {
      const timer = setTimeout(() => {
        loadCatalog();
      }, 200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        loadSuppliers();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [activeTab, loadCatalog, loadSuppliers]);

  // Handlers for Items
  const handleOpenAddItemModal = () => {
    setEditingItem(null);
    setFormItemName("");
    setFormItemCategory("Nguyên liệu Cà phê & Trà");
    setFormItemUnit("kg");
    setFormItemPrice("");
    setIsItemModalOpen(true);
  };

  const handleOpenEditItemModal = (item: CatalogItemData) => {
    setEditingItem(item);
    setFormItemName(item.name);
    setFormItemCategory(item.category || "Khác");
    setFormItemUnit(item.defaultUnit || "kg");
    setFormItemPrice(item.lastUnitPrice ? formatVND(item.lastUnitPrice) : "");
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItemName.trim()) {
      showToast("Vui lòng nhập tên mặt hàng", "error");
      return;
    }
    if (!formItemUnit.trim()) {
      showToast("Vui lòng nhập đơn vị tính", "error");
      return;
    }

    setIsItemSubmitting(true);
    try {
      const priceNum = formItemPrice ? parseVND(formItemPrice) : 0;
      const payload = {
        name: formItemName.trim(),
        category: formItemCategory,
        defaultUnit: formItemUnit.trim(),
        lastUnitPrice: priceNum,
      };

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
        setIsItemModalOpen(false);
        loadCatalog();
      } else {
        showToast(json.message || "Lưu thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi lưu", "error");
    } finally {
      setIsItemSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa mặt hàng [${name}] khỏi danh mục không?`)) return;

    try {
      const res = await fetch(`/api/catalog/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã xóa ${name}`, "success");
        loadCatalog();
      } else {
        showToast(json.message || "Xóa thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi xóa", "error");
    }
  };

  const handleSeedStarters = async () => {
    if (!confirm("Bạn muốn nạp bộ 17 mặt hàng mẫu thông dụng của Quán Cà phê & Đồ uống?")) return;

    try {
      const res = await fetch("/api/catalog?seed=true");
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Đã nạp danh mục mẫu", "success");
        loadCatalog();
      }
    } catch {
      showToast("Lỗi kết nối khi nạp danh mục mẫu", "error");
    }
  };

  // Handlers for Suppliers
  const handleOpenAddSupplierModal = () => {
    setEditingSupplier(null);
    setFormSupplierName("");
    setFormSupplierCategory("Chợ");
    setFormSupplierNote("");
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplierModal = (sup: SupplierData) => {
    setEditingSupplier(sup);
    setFormSupplierName(sup.name);
    setFormSupplierCategory(sup.category || "Chợ");
    setFormSupplierNote(sup.note || "");
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplierName.trim()) {
      showToast("Vui lòng nhập tên nơi mua / nhà cung cấp", "error");
      return;
    }

    setIsSupplierSubmitting(true);
    try {
      const payload = {
        name: formSupplierName.trim(),
        category: formSupplierCategory,
        note: formSupplierNote.trim(),
      };

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
        setIsSupplierModalOpen(false);
        loadSuppliers();
      } else {
        showToast(json.message || "Lưu thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi lưu", "error");
    } finally {
      setIsSupplierSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa nơi mua [${name}] không?`)) return;

    try {
      const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã xóa nơi mua ${name}`, "success");
        loadSuppliers();
      } else {
        showToast(json.message || "Xóa thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi xóa", "error");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Chuyển Tab Mặt hàng / Nơi mua */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8EFE9] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Mặt Hàng & Nơi Mua
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động học từ các lần ghi hàng. Quản lý danh mục, lịch sử giá và nhà cung cấp
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
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
              Mặt hàng ({items.length})
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
              Nơi mua ({suppliers.length})
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
                onClick={handleOpenAddItemModal}
                className="min-h-[44px] px-3.5 text-xs font-semibold gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm món</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleOpenAddSupplierModal}
              className="min-h-[44px] px-3.5 text-xs font-semibold gap-1.5"
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
          {/* Thanh tìm kiếm & Nhóm danh mục */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder="Tìm mặt hàng theo tên không dấu (VD: 'robusta', 'sua dac', 'ly nhua')..."
                className="w-full h-11 pl-10 pr-4 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors"
              />
            </div>

            {/* Dãy chip nhóm hàng */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {["Tất cả", ...DEFAULT_PURCHASE_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white font-semibold shadow-xs"
                      : "bg-white text-slate-600 border border-[#D8EFE9] hover:bg-emerald-50/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Danh sách mặt hàng */}
          {isItemsLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Đang tải danh mục mặt hàng...</p>
            </div>
          ) : items.length === 0 ? (
            <Card className="border-dashed border-2 border-[#D8EFE9] p-8 text-center bg-white">
              <div className="max-w-xs mx-auto space-y-3">
                <Package className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Chưa có mặt hàng nào
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mặt hàng sẽ tự động được ghi nhận khi bạn lưu phiếu mua, hoặc bạn có thể nạp nhanh bộ mẫu cà phê.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button onClick={handleSeedStarters} size="sm" variant="outline" className="min-h-[44px]">
                    Nạp mẫu cà phê
                  </Button>
                  <Button onClick={handleOpenAddItemModal} size="sm" className="min-h-[44px]">
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
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2">
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

                  {/* Biến động giá */}
                  <div className="bg-emerald-50/40 rounded-xl p-2.5 border border-[#D8EFE9] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">Giá gần nhất:</span>
                      <span className="font-mono tabular-nums font-bold text-emerald-800">
                        {formatVND(item.lastUnitPrice || 0)}
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

                  {/* Footer card: số lần mua & thao tác */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#D8EFE9] text-xs">
                    <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                      Đã mua: {item.usageCount} lần
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditItemModal(item)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        title="Sửa mặt hàng"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item._id, item.name)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Xóa mặt hàng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
          {/* Thanh tìm kiếm Nơi mua */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={supplierSearchQuery}
              onChange={(e) => setSupplierSearchQuery(e.target.value)}
              placeholder="Tìm nơi mua theo tên (VD: 'cho dau moi', 'bach hoa xanh', 'vinmart')..."
              className="w-full h-11 pl-10 pr-4 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors"
            />
          </div>

          {/* Danh sách nơi mua */}
          {isSuppliersLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Đang tải danh sách nơi mua...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <Card className="border-dashed border-2 border-[#D8EFE9] p-8 text-center bg-white">
              <div className="max-w-xs mx-auto space-y-3">
                <Store className="w-10 h-10 text-sky-400 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Chưa có nơi mua nào
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hệ thống tự động lưu lại nơi mua mỗi khi bạn nhập phiếu mua hàng, hoặc bạn có thể tự thêm trước.
                </p>
                <Button onClick={handleOpenAddSupplierModal} size="sm" className="min-h-[44px]">
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
                  <div className="space-y-1.5">
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
                      <p className="text-xs text-slate-500 italic line-clamp-2">
                        {sup.note}
                      </p>
                    )}
                  </div>

                  {/* Thông tin số lần mua & lần mua gần nhất */}
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

                  {/* Footer card: thao tác */}
                  <div className="flex items-center justify-end pt-1 border-t border-[#D8EFE9] gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditSupplierModal(sup)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                      title="Sửa nơi mua"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSupplier(sup._id, sup.name)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Xóa nơi mua"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Thêm / Chỉnh Sửa Mặt Hàng */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? "Chỉnh sửa mặt hàng" : "Thêm mặt hàng mới"}
        description="Thiết lập tên gọi, nhóm và đơn vị đo mặc định"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên mặt hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formItemName}
              onChange={(e) => setFormItemName(e.target.value)}
              placeholder="VD: Cà phê Robusta Mộc, Sữa tươi thanh trùng..."
              className="w-full h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nhóm danh mục
            </label>
            <CustomSelect
              value={formItemCategory}
              onChange={(e) => setFormItemCategory(e.target.value)}
              options={DEFAULT_PURCHASE_CATEGORIES.map((c) => ({ label: c, value: c }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Đơn vị tính <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formItemUnit}
                onChange={(e) => setFormItemUnit(e.target.value)}
                placeholder="kg, hộp, thùng..."
                className="w-full h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Đơn giá tham khảo (VNĐ)
              </label>
              <input
                type="text"
                value={formItemPrice}
                onChange={(e) => {
                  const raw = e.target.value;
                  const num = parseVND(raw);
                  setFormItemPrice(num > 0 ? formatVND(num) : raw);
                }}
                placeholder="VD: 150.000"
                className="w-full h-11 px-3 text-base font-mono tabular-nums rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Gợi ý đơn vị nhanh */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">Chọn nhanh đơn vị:</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_UNITS.slice(0, 8).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setFormItemUnit(u)}
                  className="min-h-[44px] px-2.5 py-1 text-xs rounded-lg border border-[#D8EFE9] hover:bg-emerald-50 text-slate-700 transition-colors"
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#D8EFE9] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsItemModalOpen(false)}
              className="min-h-[44px]"
            >
              Hủy
            </Button>
            <Button type="submit" loading={isItemSubmitting} className="min-h-[44px] px-5">
              {editingItem ? "Lưu thay đổi" : "Tạo mặt hàng"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Thêm / Chỉnh Sửa Nơi Mua */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title={editingSupplier ? "Chỉnh sửa nơi mua" : "Thêm nơi mua mới"}
        description="Thông tin địa điểm hoặc nhà cung cấp mua hàng thường xuyên"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tên nơi mua / Nhà cung cấp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formSupplierName}
              onChange={(e) => setFormSupplierName(e.target.value)}
              placeholder="VD: Chợ Đầu Mối Hòa Cường, Bách Hóa Xanh, VinMart..."
              className="w-full h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phân loại nơi mua
            </label>
            <CustomSelect
              value={formSupplierCategory}
              onChange={(e) => setFormSupplierCategory(e.target.value)}
              options={SUPPLIER_CATEGORIES.map((c) => ({ label: c, value: c }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú địa chỉ / người liên hệ
            </label>
            <textarea
              rows={3}
              value={formSupplierNote}
              onChange={(e) => setFormSupplierNote(e.target.value)}
              placeholder="VD: Quầy cô Lan, SĐT: 0905xxx, giao hàng buổi sáng..."
              className="w-full p-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-[#D8EFE9] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSupplierModalOpen(false)}
              className="min-h-[44px]"
            >
              Hủy
            </Button>
            <Button type="submit" loading={isSupplierSubmitting} className="min-h-[44px] px-5">
              {editingSupplier ? "Lưu thay đổi" : "Tạo nơi mua"}
            </Button>
          </div>
        </form>
      </Modal>
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
