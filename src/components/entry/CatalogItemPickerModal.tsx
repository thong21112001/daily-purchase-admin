"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Search, Package, Check, Plus } from "lucide-react";
import { formatVND } from "@/lib/utils/currency";
import { matchesUnaccented } from "@/lib/utils/vietnamese-search";
import { DEFAULT_PURCHASE_CATEGORIES } from "@/lib/constants/categories";

export interface CatalogPickerItem {
  _id: string;
  name: string;
  category: string;
  defaultUnit: string;
  lastUnitPrice: number;
}

interface CatalogItemPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (
    items: Array<{
      name: string;
      category: string;
      unit: string;
      unitPrice: number;
      quantity: number;
    }>
  ) => void;
}

export function CatalogItemPickerModal({
  isOpen,
  onClose,
  onAddItems,
}: CatalogItemPickerModalProps) {
  const [catalogItems, setCatalogItems] = useState<CatalogPickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;

    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/catalog?limit=100");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCatalogItems(json.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục mặt hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
    setSelectedIds({});
    setSearchQuery("");
  }, [isOpen]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredItems = catalogItems.filter((item) => {
    const matchCategory =
      selectedCategory === "Tất cả" || item.category === selectedCategory;
    const matchQuery =
      !searchQuery.trim() || matchesUnaccented(item.name, searchQuery);
    return matchCategory && matchQuery;
  });

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  const handleConfirm = () => {
    const itemsToAdd = catalogItems
      .filter((item) => selectedIds[item._id])
      .map((item) => ({
        name: item.name,
        category: item.category,
        unit: item.defaultUnit || "cái",
        unitPrice: item.lastUnitPrice || 0,
        quantity: 1,
      }));

    if (itemsToAdd.length > 0) {
      onAddItems(itemsToAdd);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn Mặt Hàng Đã Tạo"
      description="Chọn nhanh các món đã có trong danh mục kèm giá gần nhất để điền vào hóa đơn"
    >
      <div className="space-y-3.5">
        {/* Thanh tìm kiếm không dấu */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên mặt hàng (không cần gõ dấu)..."
            className="w-full min-h-[44px] h-11 px-3.5 pr-10 rounded-xl border border-[#D8EFE9] bg-[#F4FBF9] text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-xs"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
        </div>

        {/* Bộ lọc nhóm hàng nhanh (Trải đều trên Desktop, không scroll ngang) */}
        <div className="flex items-center gap-1.5 overflow-x-auto sm:overflow-x-visible sm:flex-wrap pb-1 scrollbar-none overscroll-x-contain">
          {["Tất cả", ...DEFAULT_PURCHASE_CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[44px] px-3 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/25"
                  : "bg-white border border-[#D8EFE9] text-slate-700 hover:bg-emerald-50 hover:border-emerald-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Danh sách mặt hàng (Grid 2 cột trên Laptop/Desktop rộng rãi) */}
        <div className="max-h-[52vh] overflow-y-auto divide-y sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-2 p-1 border border-[#D8EFE9] rounded-2xl bg-white overscroll-contain">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400 sm:col-span-2">
              Đang tải danh mục mặt hàng...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 sm:col-span-2">
              Không tìm thấy mặt hàng nào phù hợp
            </div>
          ) : (
            filteredItems.map((item) => {
              const isChecked = !!selectedIds[item._id];
              return (
                <div
                  key={item._id}
                  onClick={() => toggleSelect(item._id)}
                  className={`min-h-[52px] p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors active:bg-emerald-100 select-none ${
                    isChecked
                      ? "bg-emerald-50 border-emerald-300 shadow-2xs"
                      : "border-transparent sm:border-slate-100 hover:bg-[#F4FBF9]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-slate-900 leading-snug">
                        {item.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {item.category} • {item.defaultUnit}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-sm font-mono font-bold tabular-nums text-emerald-700">
                      {formatVND(item.lastUnitPrice)}
                    </span>
                    <span className="block text-[10px] text-slate-400">Giá gần nhất</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-between pt-2 border-t border-[#D8EFE9]">
          <span className="text-xs font-medium text-slate-600">
            Đã chọn: <strong className="text-emerald-700 font-mono text-sm">{selectedCount}</strong> mặt hàng
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              variant="peach"
              className="font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm vào hóa đơn ({selectedCount})</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
