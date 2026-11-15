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
            className="w-full min-h-[44px] h-11 px-3.5 pr-10 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
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
              className={`min-h-[44px] px-3 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-xs"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Danh sách mặt hàng (Grid 2 cột trên Laptop/Desktop rộng rãi) */}
        <div className="max-h-[52vh] overflow-y-auto divide-y sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-2 p-1 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 overscroll-contain">
          {loading ? (
            <div className="p-8 text-center text-sm text-zinc-400 sm:col-span-2">
              Đang tải danh mục mặt hàng...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-400 sm:col-span-2">
              Không tìm thấy mặt hàng nào phù hợp
            </div>
          ) : (
            filteredItems.map((item) => {
              const isChecked = !!selectedIds[item._id];
              return (
                <div
                  key={item._id}
                  onClick={() => toggleSelect(item._id)}
                  className={`min-h-[52px] p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors active:bg-zinc-100 dark:active:bg-zinc-800 select-none ${
                    isChecked
                      ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 shadow-2xs"
                      : "border-transparent sm:border-zinc-100 sm:dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                        {item.name}
                      </span>
                      <span className="block text-xs text-zinc-400">
                        {item.category} • {item.defaultUnit}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-sm font-mono font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                      {formatVND(item.lastUnitPrice)}
                    </span>
                    <span className="block text-[10px] text-zinc-400">Giá gần nhất</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-medium text-zinc-500">
            Đã chọn: <strong className="text-zinc-900 dark:text-zinc-100 font-mono text-sm">{selectedCount}</strong> mặt hàng
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className="font-bold flex items-center gap-1.5"
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
