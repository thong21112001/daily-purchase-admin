"use client";

import React, { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { ItemAutocomplete, type SelectedItemPayload } from "./ItemAutocomplete";
import { DEFAULT_PURCHASE_CATEGORIES, COMMON_UNITS } from "@/lib/constants/categories";
import { formatVND, parseVND, calculateLineTotal } from "@/lib/utils/currency";

interface BatchItemState {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface BatchReceiptFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function BatchReceiptForm({ onSuccess, onCancel }: BatchReceiptFormProps) {
  const [supplier, setSupplier] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [note, setNote] = useState("");

  const [items, setItems] = useState<BatchItemState[]>([
    {
      id: "row-1",
      name: "",
      category: "Nguyên liệu Cà phê & Trà",
      unit: "kg",
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thêm dòng hàng mới
  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `row-${Date.now()}`,
        name: "",
        category: "Nguyên liệu Cà phê & Trà",
        unit: "kg",
        quantity: 1,
        unitPrice: 0,
        lineTotal: 0,
      },
    ]);
  };

  // Xóa dòng hàng
  const handleRemoveRow = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Cập nhật giá trị dòng hàng
  const handleUpdateItem = (id: string, field: keyof BatchItemState, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.lineTotal = calculateLineTotal(updated.quantity, updated.unitPrice);
        }
        return updated;
      })
    );
  };

  // Khi chọn từ autocomplete của 1 dòng
  const handleSelectItem = (id: string, payload: SelectedItemPayload) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = {
          ...item,
          name: payload.name,
          category: payload.category || item.category,
          unit: payload.unit || item.unit,
          unitPrice: payload.unitPrice || item.unitPrice,
        };
        updated.lineTotal = calculateLineTotal(updated.quantity, updated.unitPrice);
        return updated;
      })
    );
  };

  const grandTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter((item) => item.name.trim() && item.unitPrice > 0);
    if (validItems.length === 0) {
      setError("Vui lòng nhập ít nhất 1 mặt hàng có tên và đơn giá hợp lệ");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier: supplier.trim(),
          paymentMethod,
          note: note.trim(),
          items: validItems.map((item) => ({
            name: item.name.trim(),
            category: item.category,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Lỗi khi lưu hóa đơn");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("Lỗi kết nối máy chủ");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Thông tin hóa đơn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Nơi mua / Siêu thị
          </label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="VD: Siêu thị Mega, Chợ đầu mối..."
            className="w-full min-h-[44px] h-11 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
            Hình thức thanh toán
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`flex-1 min-h-[44px] h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                paymentMethod === "CASH"
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Tiền mặt
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("TRANSFER")}
              className={`flex-1 min-h-[44px] h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                paymentMethod === "TRANSFER"
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Chuyển khoản
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách các mặt hàng trong hóa đơn */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
            Danh sách mặt hàng ({items.length})
          </span>
          <button
            type="button"
            onClick={handleAddRow}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm dòng hàng</span>
          </button>
        </div>

        <div className="space-y-2.5 max-h-[40vh] overflow-y-auto overscroll-contain pr-1">
          {items.map((row, idx) => (
            <div
              key={row.id}
              className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2 relative shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-400 font-mono">#{idx + 1}</span>
                <ItemAutocomplete
                  value={row.name}
                  onChange={(val) => handleUpdateItem(row.id, "name", val)}
                  onSelectItem={(selected) => handleSelectItem(row.id, selected)}
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="min-h-[44px] min-w-[44px] p-2 text-zinc-400 hover:text-red-600 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-zinc-400 mb-0.5">Số lượng</label>
                  <input
                    type="number"
                    step="any"
                    value={row.quantity}
                    onChange={(e) =>
                      handleUpdateItem(row.id, "quantity", parseFloat(e.target.value) || 0)
                    }
                    className="w-full min-h-[44px] h-10 px-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono tabular-nums text-base text-center"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-0.5">Đơn vị</label>
                  <select
                    value={row.unit}
                    onChange={(e) => handleUpdateItem(row.id, "unit", e.target.value)}
                    className="w-full min-h-[44px] h-10 px-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-base"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400 mb-0.5">Đơn giá</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.unitPrice > 0 ? row.unitPrice.toLocaleString("vi-VN") : ""}
                    onChange={(e) =>
                      handleUpdateItem(row.id, "unitPrice", parseVND(e.target.value))
                    }
                    placeholder="0 ₫"
                    className="w-full min-h-[44px] h-10 px-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono tabular-nums text-base text-right font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <span>Thành tiền dòng:</span>
                <span className="font-mono tabular-nums font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {formatVND(row.lineTotal)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Total & Save */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
            Tổng cộng ({items.length} món):
          </span>
          <span className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
            {formatVND(grandTotal)}
          </span>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] h-12 text-base font-bold shadow-md"
        >
          {loading ? "Đang lưu hóa đơn..." : `Lưu Hóa Đơn (${formatVND(grandTotal)})`}
        </Button>
      </div>
    </form>
  );
}
