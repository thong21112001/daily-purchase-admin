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

function CatalogContent() {
  const { showToast } = useToast();

  const [items, setItems] = useState<CatalogItemData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItemData | null>(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Nguyên liệu Cà phê & Trà");
  const [formUnit, setFormUnit] = useState("kg");
  const [formPrice, setFormPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
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
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCatalog();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadCatalog]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory("Nguyên liệu Cà phê & Trà");
    setFormUnit("kg");
    setFormPrice("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CatalogItemData) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category || "Khác");
    setFormUnit(item.defaultUnit || "kg");
    setFormPrice(item.lastUnitPrice ? formatVND(item.lastUnitPrice) : "");
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Vui lòng nhập tên mặt hàng", "error");
      return;
    }
    if (!formUnit.trim()) {
      showToast("Vui lòng nhập đơn vị tính", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const priceNum = formPrice ? parseVND(formPrice) : 0;
      const payload = {
        name: formName.trim(),
        category: formCategory,
        defaultUnit: formUnit.trim(),
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
        setIsModalOpen(false);
        loadCatalog();
      } else {
        showToast(json.message || "Lưu thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi lưu", "error");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="space-y-5">
      {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Danh Mục Mặt Hàng & Lịch Sử Giá
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Tự động học từ mỗi lần nhập hàng. Theo dõi biến động đơn giá mua
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedStarters}
              className="min-h-[44px] px-3 text-xs gap-1.5"
              title="Nạp bộ danh mục mẫu cho quán cà phê"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Nạp mẫu F&B</span>
            </Button>
            <Button
              size="sm"
              onClick={handleOpenAddModal}
              className="min-h-[44px] px-3.5 text-xs font-semibold gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm món</span>
            </Button>
          </div>
        </div>

        {/* Thanh tìm kiếm & Nhóm danh mục */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mặt hàng theo tên không dấu (VD: 'robusta', 'sua dac', 'ly nhua')..."
              className="w-full h-11 pl-10 pr-4 text-base rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
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
                    ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 font-semibold"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách mặt hàng */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-zinc-400 border-t-zinc-900 dark:border-t-zinc-100 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Đang tải danh mục mặt hàng...</p>
          </div>
        ) : items.length === 0 ? (
          <Card className="border-dashed border-2 border-zinc-200 dark:border-zinc-800 p-8 text-center">
            <div className="max-w-xs mx-auto space-y-3">
              <Package className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Chưa có mặt hàng nào
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mặt hàng sẽ tự động được ghi nhận khi bạn lưu phiếu mua, hoặc bạn có thể nạp nhanh bộ mẫu cà phê.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button onClick={handleSeedStarters} size="sm" variant="outline" className="min-h-[44px]">
                  Nạp mẫu cà phê
                </Button>
                <Button onClick={handleOpenAddModal} size="sm" className="min-h-[44px]">
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
                className="border border-zinc-200 dark:border-zinc-800 p-3.5 flex flex-col justify-between space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">
                      {item.name}
                    </h3>
                    <Badge variant="outline" size="sm" className="text-[10px] shrink-0">
                      {item.defaultUnit}
                    </Badge>
                  </div>
                  <Badge variant="secondary" size="sm" className="text-[10px] py-0 px-1.5">
                    {item.category || "Khác"}
                  </Badge>
                </div>

                {/* Biến động giá */}
                <div className="bg-zinc-50 dark:bg-zinc-900/80 rounded-xl p-2.5 border border-zinc-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 text-[11px]">Giá gần nhất:</span>
                    <span className="font-mono tabular-nums font-bold text-zinc-900 dark:text-zinc-100">
                      {formatVND(item.lastUnitPrice || 0)}
                    </span>
                  </div>

                  {(item.minUnitPrice !== undefined || item.maxUnitPrice !== undefined) && (
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono tabular-nums pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      <span className="flex items-center gap-0.5">
                        <TrendingDown className="w-2.5 h-2.5 text-emerald-500" />
                        Min: {formatVND(item.minUnitPrice || item.lastUnitPrice || 0)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5 text-amber-500" />
                        Max: {formatVND(item.maxUnitPrice || item.lastUnitPrice || 0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer card: số lần mua & thao tác */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                  <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
                    Đã mua: {item.usageCount} lần
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(item)}
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      title="Sửa mặt hàng"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item._id, item.name)}
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600"
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

        {/* Modal Thêm / Chỉnh Sửa Mặt Hàng */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? "Chỉnh sửa mặt hàng" : "Thêm mặt hàng mới"}
          description="Thiết lập tên gọi, nhóm và đơn vị đo mặc định"
        >
          <form onSubmit={handleSaveItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Tên mặt hàng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="VD: Cà phê Robusta Mộc, Sữa tươi thanh trùng..."
                className="w-full h-11 px-3 text-base rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Nhóm danh mục
              </label>
              <CustomSelect
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                options={DEFAULT_PURCHASE_CATEGORIES.map((c) => ({ label: c, value: c }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Đơn vị tính <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  placeholder="kg, hộp, thùng..."
                  className="w-full h-11 px-3 text-base rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Đơn giá tham khảo (VNĐ)
                </label>
                <input
                  type="text"
                  value={formPrice}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const num = parseVND(raw);
                    setFormPrice(num > 0 ? formatVND(num) : raw);
                  }}
                  placeholder="VD: 150.000"
                  className="w-full h-11 px-3 text-base font-mono tabular-nums rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-zinc-900 dark:focus:border-zinc-100"
                />
              </div>
            </div>

            {/* Gợi ý đơn vị nhanh */}
            <div>
              <span className="text-[11px] text-zinc-400 block mb-1">Chọn nhanh đơn vị:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_UNITS.slice(0, 8).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setFormUnit(u)}
                    className="min-h-[44px] px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="min-h-[44px]"
              >
                Hủy
              </Button>
              <Button type="submit" loading={isSubmitting} className="min-h-[44px] px-5">
                {editingItem ? "Lưu thay đổi" : "Tạo mặt hàng"}
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
