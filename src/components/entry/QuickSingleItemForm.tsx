"use client";

import React, { useState, useEffect } from "react";
import { ItemAutocomplete, type SelectedItemPayload } from "./ItemAutocomplete";
import { SupplierAutocomplete } from "./SupplierAutocomplete";
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
import { ArrowLeftRight, AlertCircle, Plus, Edit3 } from "lucide-react";
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
  const [availableUnits, setAvailableUnits] = useState<string[]>([...COMMON_UNITS]);
  const [isCustomUnitMode, setIsCustomUnitMode] = useState<boolean>(false);
  const [customUnitInput, setCustomUnitInput] = useState<string>("");

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

  // Nạp danh sách đơn vị tùy chỉnh từ cơ sở dữ liệu
  useEffect(() => {
    async function loadUnits() {
      try {
        const res = await fetch("/api/catalog?units=true");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAvailableUnits(json.data);
        }
      } catch {
        // Fallback giữ nguyên COMMON_UNITS
      }
    }
    loadUnits();
  }, []);

  // Khi chọn từ gợi ý autocomplete
  const handleSelectItem = (item: SelectedItemPayload) => {
    if (item.category) setCategory(item.category);
    if (item.unit) {
      setUnit(item.unit);
      if (!availableUnits.includes(item.unit)) {
        setAvailableUnits((prev) => [...prev, item.unit]);
      }
    }
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

  // Thêm đơn vị tùy chỉnh
  const handleApplyCustomUnit = () => {
    const trimmed = customUnitInput.trim().toLowerCase();
    if (trimmed) {
      setUnit(trimmed);
      if (!availableUnits.includes(trimmed)) {
        setAvailableUnits((prev) => [...prev, trimmed]);
      }
      setIsCustomUnitMode(false);
      setCustomUnitInput("");
    }
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
          note: note.trim(),
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
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid 2 cột cân đối trên Laptop / Desktop (gap-6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CỘT TRÁI (6/12): Thông tin mặt hàng & nơi mua */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* 0. Chọn thời gian ghi sổ */}
          <PurchaseDateSelector
            selectedDateIso={selectedDateIso}
            selectedDateKey={selectedDateKey}
            onChangeDate={(iso, key) => {
              setSelectedDateIso(iso);
              setSelectedDateKey(key);
            }}
          />

          {/* 1. Tên mặt hàng */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Tên mặt hàng *
            </label>
            <ItemAutocomplete
              value={name}
              onChange={setName}
              onSelectItem={handleSelectItem}
              autoFocus={true}
            />
          </div>

          {/* 2. Nhóm Hàng & Nơi Mua */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomSelect
              label="Nhóm hàng"
              id="category-select"
              value={category}
              onChange={(e: any) => setCategory(e.target.value)}
              options={DEFAULT_PURCHASE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nơi mua / Siêu thị
              </label>
              <SupplierAutocomplete
                value={supplier}
                onChange={setSupplier}
                placeholder="Chợ, Siêu thị, Đại lý..."
              />
            </div>
          </div>

          {/* 3. Ghi chú mặt hàng */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Ghi chú (Tùy chọn)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Mua hộ, loại 1, giảm giá..."
              className="w-full min-h-[44px] h-11 px-3.5 rounded-xl border border-[#D8EFE9] bg-white text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-xs"
            />
          </div>
        </div>

        {/* CỘT PHẢI (6/12): Đơn vị, Số lượng, Giá 2 chiều, Thanh toán */}
        <div className="lg:col-span-6 space-y-3.5">
          {/* 4. Đơn vị tính (Chips chọn nhanh + Nút tự nhập) */}
          <div className="bg-[#F4FBF9] border border-[#D8EFE9] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Đơn vị tính: <span className="text-emerald-700 font-extrabold text-sm">{unit}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomUnitMode(!isCustomUnitMode)}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isCustomUnitMode ? "Đóng tự nhập" : "+ Tự nhập đơn vị"}</span>
              </button>
            </div>

            {/* Ô tự nhập đơn vị mới khi bấm + Tự nhập */}
            {isCustomUnitMode && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customUnitInput}
                  onChange={(e) => setCustomUnitInput(e.target.value)}
                  placeholder="Nhập đơn vị (VD: khay, vỉ, két, bao)..."
                  className="flex-1 min-h-[44px] h-10 px-3 rounded-xl border border-orange-300 bg-white text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCustomUnit();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUnit}
                  className="min-h-[44px] px-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Dùng đơn vị này
                </button>
              </div>
            )}

            {/* Dãy Chip đơn vị */}
            <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-24 overflow-y-auto">
              {availableUnits.map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`min-h-[44px] min-w-[44px] px-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    unit === u
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "bg-white text-slate-700 border border-[#D8EFE9] hover:bg-emerald-50 hover:border-emerald-300"
                  }`}
                >
                  {u}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomUnitMode(true)}
                className="min-h-[44px] px-3 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Khác...</span>
              </button>
            </div>
          </div>

          {/* 5. Số lượng & Nút tăng giảm nhanh */}
          <div className="bg-[#F4FBF9] border border-[#D8EFE9] rounded-2xl p-3 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Số lượng mua
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                min="0.01"
                value={quantity}
                onChange={(e) => handleQtyChange(parseFloat(e.target.value) || 0)}
                className="flex-1 min-h-[44px] h-11 px-3.5 rounded-xl border border-[#D8EFE9] bg-white text-slate-900 font-mono tabular-nums text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleQtyChange(quantity - 1)}
                  className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl bg-white border border-[#D8EFE9] text-slate-700 font-bold text-base flex items-center justify-center active:scale-95 cursor-pointer shadow-xs hover:bg-emerald-50"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleQtyChange(quantity + 0.5)}
                  className="min-h-[44px] h-11 px-3 rounded-xl bg-white border border-[#D8EFE9] text-slate-700 font-bold text-sm flex items-center justify-center active:scale-95 cursor-pointer shadow-xs hover:bg-emerald-50"
                >
                  +0.5
                </button>
                <button
                  type="button"
                  onClick={() => handleQtyChange(quantity + 1)}
                  className="min-h-[44px] min-w-[44px] h-11 w-11 rounded-xl bg-white border border-[#D8EFE9] text-slate-700 font-bold text-base flex items-center justify-center active:scale-95 cursor-pointer shadow-xs hover:bg-emerald-50"
                >
                  +1
                </button>
              </div>
            </div>
          </div>

          {/* 6. Nhập Tiền & Chuyển đổi 2 Chiều */}
          <div className="bg-[#F4FBF9] border border-[#D8EFE9] rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {calcMode === "UNIT_PRICE" ? "Nhập Đơn Giá" : "Nhập Tổng Tiền Trả"}
              </span>
              <button
                type="button"
                onClick={() => setCalcMode(calcMode === "UNIT_PRICE" ? "TOTAL_AMOUNT" : "UNIT_PRICE")}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-100/60 rounded-lg cursor-pointer transition-colors"
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
                  className="w-full min-h-[44px] h-12 px-4 rounded-xl border border-[#D8EFE9] bg-white text-slate-900 font-mono tabular-nums text-lg font-bold text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
                <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                  <span>Thành tiền ({quantity} {unit}):</span>
                  <span className="font-mono tabular-nums font-extrabold text-base text-emerald-700">
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
                  className="w-full min-h-[44px] h-12 px-4 rounded-xl border border-[#D8EFE9] bg-white text-slate-900 font-mono tabular-nums text-lg font-bold text-right focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
                <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                  <span>Đơn giá tự chia ngược:</span>
                  <span className="font-mono tabular-nums font-extrabold text-base text-emerald-700">
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

          {/* 7. Phương thức thanh toán & Nút Lưu */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`flex-1 min-h-[44px] h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  paymentMethod === "CASH"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-white text-slate-700 border border-[#D8EFE9] hover:bg-emerald-50"
                }`}
              >
                Tiền mặt
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("TRANSFER")}
                className={`flex-1 min-h-[44px] h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  paymentMethod === "TRANSFER"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-white text-slate-700 border border-[#D8EFE9] hover:bg-emerald-50"
                }`}
              >
                Chuyển khoản
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="peach"
              className="w-full min-h-[48px] h-12 text-base font-bold shadow-md shadow-orange-500/25"
            >
              {loading ? "Đang lưu..." : `Lưu Món (${formatVND(totalPaid)})`}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
