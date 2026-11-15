"use client";

import React, { useState } from "react";
import { ItemAutocomplete, type SelectedItemPayload } from "./ItemAutocomplete";
import { QuickAmountChips } from "@/components/ui/QuickAmountChips";
import { Button } from "@/components/ui/Button";
import { CustomSelect } from "@/components/ui/CustomSelect";
import {
  DEFAULT_PURCHASE_CATEGORIES,
  COMMON_UNITS,
} from "@/lib/constants/categories";
import {
  formatVND,
  parseVND,
  calculateLineTotal,
  reverseUnitPrice,
} from "@/lib/utils/currency";
import { ArrowLeftRight, Check, AlertCircle } from "lucide-react";
import { PurchaseDateSelector } from "./PurchaseDateSelector";
import { getTodayKey } from "@/lib/utils/date";

interface QuickSingleItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function QuickSingleItemForm({ onSuccess, onCancel }: QuickSingleItemFormProps) {
  const todayKey = getTodayKey();
  const [selectedDateIso, setSelectedDateIso] = useState<string>(new Date().toISOString());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Nguyên liệu Cà phê & Trà");
  const [unit, setUnit] = useState<string>("kg");
  const [quantity, setQuantity] = useState<number>(1);

  // Chế độ tính toán: 'UNIT_PRICE' (nhập đơn giá) hay 'TOTAL_AMOUNT' (nhập tổng tiền trả)
  const [calcMode, setCalcMode] = useState<"UNIT_PRICE" | "TOTAL_AMOUNT">("UNIT_PRICE");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);

  const [supplier, setSupplier] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Khi chọn từ gợi ý autocomplete
  const handleSelectItem = (item: SelectedItemPayload) => {
    if (item.category) setCategory(item.category);
    if (item.unit) setUnit(item.unit);
    if (item.unitPrice && item.unitPrice > 0) {
      setUnitPrice(item.unitPrice);
      setTotalPaid(calculateLineTotal(quantity, item.unitPrice));
    }
  };

  // Cập nhật số lượng
  const handleQtyChange = (newQty: number) => {
    const validQty = Math.max(0.1, Math.round(newQty * 10) / 10);
    setQuantity(validQty);

    if (calcMode === "UNIT_PRICE") {
      setTotalPaid(calculateLineTotal(validQty, unitPrice));
    } else {
      setUnitPrice(reverseUnitPrice(validQty, totalPaid));
    }
  };

  // Khi nhập đơn giá
  const handleUnitPriceInput = (rawVal: string | number) => {
    const val = typeof rawVal === "number" ? rawVal : parseVND(rawVal);
    setUnitPrice(val);
    setTotalPaid(calculateLineTotal(quantity, val));
  };

  // Khi nhập tổng tiền trả (chế độ tính ngược)
  const handleTotalPaidInput = (rawVal: string | number) => {
    const val = typeof rawVal === "number" ? rawVal : parseVND(rawVal);
    setTotalPaid(val);
    setUnitPrice(reverseUnitPrice(quantity, val));
  };

  // Submit lưu phiếu món lẻ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Vui lòng nhập tên mặt hàng");
      return;
    }

    const finalUnitPrice = calcMode === "UNIT_PRICE" ? unitPrice : reverseUnitPrice(quantity, totalPaid);
    if (finalUnitPrice <= 0) {
      setError("Đơn giá hoặc tổng tiền phải lớn hơn 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseDate: selectedDateIso,
          supplier: supplier.trim(),
          paymentMethod,
          items: [
            {
              name: name.trim(),
              category,
              unit,
              quantity,
              unitPrice: finalUnitPrice,
              note: note.trim(),
            },
          ],
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Không thể lưu phiếu mua hàng");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
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

      {/* 0. Chọn thời gian ghi sổ (Hỗ trợ lùi 7 ngày) */}
      <PurchaseDateSelector
        selectedDateIso={selectedDateIso}
        selectedDateKey={selectedDateKey}
        onChangeDate={(iso, key) => {
          setSelectedDateIso(iso);
          setSelectedDateKey(key);
        }}
      />

      {/* Grid 2 cột trên Laptop / Desktop (Cột 1: Thông tin mặt hàng; Cột 2: Giá & Thanh toán) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CỘT TRÁI: Tên món, đơn vị, số lượng, nhóm hàng */}
        <div className="space-y-3.5">
          {/* 1. Tên mặt hàng (Autocomplete) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
              Tên mặt hàng *
            </label>
            <ItemAutocomplete
              value={name}
              onChange={setName}
              onSelectItem={handleSelectItem}
              autoFocus={true}
            />
          </div>

          {/* 2. Đơn vị tính (Chips chọn nhanh, không scroll ngang trên desktop) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                Đơn vị tính: <span className="text-zinc-900 dark:text-zinc-100 font-bold">{unit}</span>
              </label>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto md:overflow-x-visible md:flex-wrap pb-1 scrollbar-none overscroll-x-contain">
              {COMMON_UNITS.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`min-h-[44px] min-w-[44px] px-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    unit === u
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Số lượng & Nút tăng giảm nhanh */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-2">
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Số lượng mua
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) => handleQtyChange(parseFloat(e.target.value) || 0)}
                className="flex-1 min-h-[44px] h-11 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono tabular-nums text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQtyChange(quantity - 1)}
                  className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-base flex items-center justify-center active:scale-95 cursor-pointer shadow-xs"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleQtyChange(quantity + 0.5)}
                  className="min-h-[44px] h-11 px-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-sm flex items-center justify-center active:scale-95 cursor-pointer shadow-xs"
                >
                  +0.5
                </button>
                <button
                  type="button"
                  onClick={() => handleQtyChange(quantity + 1)}
                  className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-base flex items-center justify-center active:scale-95 cursor-pointer shadow-xs"
                >
                  +1
                </button>
              </div>
            </div>
          </div>

          {/* 4. Nhóm Hàng & Nơi Mua */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <CustomSelect
              label="Nhóm hàng"
              id="category-select"
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              options={DEFAULT_PURCHASE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                Nơi mua / Siêu thị
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Chợ, Siêu thị..."
                className="w-full min-h-[44px] h-11 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-base focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
              />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Tính giá 2 chiều, Chip mệnh giá, Thanh toán & Nút Lưu */}
        <div className="space-y-3.5 flex flex-col justify-between">
          {/* Nhập Tiền & Chuyển đổi 2 Chiều */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                {calcMode === "UNIT_PRICE" ? "Nhập Đơn Giá" : "Nhập Tổng Tiền Trả"}
              </span>
              <button
                type="button"
                onClick={() => setCalcMode(calcMode === "UNIT_PRICE" ? "TOTAL_AMOUNT" : "UNIT_PRICE")}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{calcMode === "UNIT_PRICE" ? "Đổi sang Tổng tiền" : "Đổi sang Đơn giá"}</span>
              </button>
            </div>

            {calcMode === "UNIT_PRICE" ? (
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={unitPrice > 0 ? unitPrice.toLocaleString("vi-VN") : ""}
                  onChange={(e) => handleUnitPriceInput(e.target.value)}
                  placeholder="0 ₫"
                  className="w-full min-h-[44px] h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono tabular-nums text-lg font-bold text-right focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
                <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                  <span>Thành tiền ({quantity} {unit}):</span>
                  <span className="font-mono tabular-nums font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {formatVND(totalPaid)}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={totalPaid > 0 ? totalPaid.toLocaleString("vi-VN") : ""}
                  onChange={(e) => handleTotalPaidInput(e.target.value)}
                  placeholder="0 ₫"
                  className="w-full min-h-[44px] h-12 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-mono tabular-nums text-lg font-bold text-right focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
                <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                  <span>Đơn giá tự chia ngược:</span>
                  <span className="font-mono tabular-nums font-bold text-base text-zinc-900 dark:text-zinc-100">
                    {formatVND(unitPrice)} /{unit}
                  </span>
                </div>
              </div>
            )}

            {/* Dãy Chip Chọn Nhanh Mệnh Giá */}
            <QuickAmountChips
              currentInput={calcMode === "UNIT_PRICE" ? unitPrice : totalPaid}
              onSelectAmount={(amount) => {
                if (calcMode === "UNIT_PRICE") handleUnitPriceInput(amount);
                else handleTotalPaidInput(amount);
              }}
            />
          </div>

          {/* Phương thức thanh toán & Nút Lưu */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`flex-1 min-h-[44px] h-11 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  paymentMethod === "CASH"
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
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
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                Chuyển khoản
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] h-12 text-base font-bold shadow-md"
            >
              {loading ? "Đang lưu..." : `Lưu Món (${formatVND(totalPaid)})`}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
