"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { DEFAULT_PURCHASE_CATEGORIES, COMMON_UNITS } from "@/lib/constants/categories";
import { formatVND, parseVND } from "@/lib/utils/currency";

export interface CatalogItemPayload {
  name: string;
  category: string;
  defaultUnit: string;
  lastUnitPrice: number;
}

export interface CatalogItemData {
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

interface CatalogItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CatalogItemPayload) => Promise<boolean>;
  editingItem: CatalogItemData | null;
  isLoading: boolean;
}

export function CatalogItemModal({
  isOpen,
  onClose,
  onSave,
  editingItem,
  isLoading,
}: CatalogItemModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Nguyên liệu Cà phê & Trà");
  const [unit, setUnit] = useState("kg");
  const [priceStr, setPriceStr] = useState("");

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setCategory(editingItem.category || "Khác");
      setUnit(editingItem.defaultUnit || "kg");
      setPriceStr(editingItem.lastUnitPrice ? formatVND(editingItem.lastUnitPrice) : "");
    } else {
      setName("");
      setCategory("Nguyên liệu Cà phê & Trà");
      setUnit("kg");
      setPriceStr("");
    }
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unit.trim()) return;

    const priceNum = priceStr ? parseVND(priceStr) : 0;
    const success = await onSave({
      name: name.trim(),
      category,
      defaultUnit: unit.trim(),
      lastUnitPrice: priceNum,
    });
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Chỉnh sửa mặt hàng" : "Thêm mặt hàng mới"}
      description="Thiết lập tên gọi, nhóm và đơn vị đo mặc định"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tên mặt hàng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Cà phê Robusta Mộc, Sữa tươi thanh trùng..."
            className="w-full h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nhóm danh mục
          </label>
          <CustomSelect
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
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
              inputMode="numeric"
              value={priceStr}
              onChange={(e) => {
                const raw = e.target.value;
                const num = parseVND(raw);
                setPriceStr(num > 0 ? formatVND(num) : raw);
              }}
              placeholder="VD: 150.000"
              className="w-full h-11 px-3 text-base font-mono tabular-nums rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* Gợi ý đơn vị nhanh */}
        <div>
          <span className="text-[11px] text-slate-500 block mb-1">Chọn nhanh đơn vị:</span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_UNITS.slice(0, 8).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className="min-h-[44px] px-3 py-1 text-xs rounded-xl border border-[#D8EFE9] hover:bg-emerald-50 text-slate-700 transition-colors"
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
            onClick={onClose}
            className="min-h-[44px]"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            className="min-h-[44px] px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {editingItem ? "Lưu thay đổi" : "Tạo mặt hàng"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
