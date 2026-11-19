"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CustomSelect } from "@/components/ui/CustomSelect";

export interface SupplierPayload {
  name: string;
  category: string;
  note: string;
}

export interface SupplierData {
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

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: SupplierPayload) => Promise<boolean>;
  editingSupplier: SupplierData | null;
  isLoading: boolean;
}

export function SupplierModal({
  isOpen,
  onClose,
  onSave,
  editingSupplier,
  isLoading,
}: SupplierModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Chợ");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (editingSupplier) {
      setName(editingSupplier.name);
      setCategory(editingSupplier.category || "Chợ");
      setNote(editingSupplier.note || "");
    } else {
      setName("");
      setCategory("Chợ");
      setNote("");
    }
  }, [editingSupplier, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const success = await onSave({
      name: name.trim(),
      category,
      note: note.trim(),
    });
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSupplier ? "Chỉnh sửa nơi mua" : "Thêm nơi mua mới"}
      description="Thông tin địa điểm hoặc nhà cung cấp mua hàng thường xuyên"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Tên nơi mua / Nhà cung cấp <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Chợ Đầu Mối Hòa Cường, Bách Hóa Xanh, VinMart..."
            className="w-full h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Phân loại nơi mua
          </label>
          <CustomSelect
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={SUPPLIER_CATEGORIES.map((c) => ({ label: c, value: c }))}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Ghi chú địa chỉ / người liên hệ
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Quầy cô Lan, SĐT: 0905xxx, giao hàng buổi sáng..."
            className="w-full p-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
          />
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
            {editingSupplier ? "Lưu thay đổi" : "Tạo nơi mua"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
