"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ItemAutocomplete, type SelectedItemPayload } from "./ItemAutocomplete";
import { SupplierAutocomplete } from "./SupplierAutocomplete";
import { PurchaseDateSelector } from "./PurchaseDateSelector";
import { CatalogItemPickerModal } from "./CatalogItemPickerModal";
import { COMMON_UNITS, DEFAULT_PURCHASE_CATEGORIES } from "@/lib/constants/categories";
import { formatVND, parseVND, calculateLineTotal, reverseUnitPrice } from "@/lib/utils/currency";
import { getTodayKey } from "@/lib/utils/date";

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
  const todayKey = getTodayKey();
  const [selectedDateIso, setSelectedDateIso] = useState<string>(new Date().toISOString());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  const [supplier, setSupplier] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [note, setNote] = useState("");

  const [availableUnits, setAvailableUnits] = useState<string[]>([...COMMON_UNITS]);

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

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nạp danh sách đơn vị từ hệ thống
  useEffect(() => {
    async function loadUnits() {
      try {
        const res = await fetch("/api/catalog?units=true");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAvailableUnits(json.data);
        }
      } catch {
        // Fallback
      }
    }
    loadUnits();
  }, []);

  // Thêm dòng hàng trống mới
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

  // Thêm các món được chọn hàng loạt từ Catalog Modal
  const handleAddItemsFromCatalog = (
    newCatalogItems: Array<{
      name: string;
      category: string;
      unit: string;
      unitPrice: number;
      quantity: number;
    }>
  ) => {
    setItems((prev) => {
      const isInitialEmpty = prev.length === 1 && !prev[0].name.trim() && prev[0].unitPrice === 0;
      const base = isInitialEmpty ? [] : [...prev];

      const converted: BatchItemState[] = newCatalogItems.map((item, index) => ({
        id: `row-${Date.now()}-${index}`,
        name: item.name,
        category: item.category,
        unit: item.unit,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        lineTotal: calculateLineTotal(item.quantity || 1, item.unitPrice || 0),
      }));

      // Bổ sung đơn vị vào danh sách nếu chưa có
      converted.forEach((c) => {
        if (!availableUnits.includes(c.unit)) {
          setAvailableUnits((uList) => [...uList, c.unit]);
        }
      });

      return [...base, ...converted];
    });
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
        } else if (field === "lineTotal") {
          updated.unitPrice = reverseUnitPrice(updated.quantity, updated.lineTotal);
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

        if (payload.unit && !availableUnits.includes(payload.unit)) {
          setAvailableUnits((uList) => [...uList, payload.unit!]);
        }

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
          purchaseDate: selectedDateIso,
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
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Chọn thời gian ghi sổ */}
        <PurchaseDateSelector
          selectedDateIso={selectedDateIso}
          selectedDateKey={selectedDateKey}
          onChangeDate={(iso, key) => {
            setSelectedDateIso(iso);
            setSelectedDateKey(key);
          }}
        />

        {/* 2. Thông tin nơi mua chung & thanh toán */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F4FBF9] border border-[#D8EFE9] rounded-2xl p-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Nơi mua chung của hóa đơn
            </label>
            <SupplierAutocomplete
              value={supplier}
              onChange={setSupplier}
              placeholder="VD: Siêu thị Mega, Chợ đầu mối..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Hình thức thanh toán
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("CASH")}
                className={`flex-1 min-h-[44px] h-11 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  paymentMethod === "CASH"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-white border border-[#D8EFE9] text-slate-700 hover:bg-emerald-50"
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
                    : "bg-white border border-[#D8EFE9] text-slate-700 hover:bg-emerald-50"
                }`}
              >
                Chuyển khoản
              </button>
            </div>
          </div>
        </div>

        {/* 3. Danh sách các mặt hàng trong hóa đơn & Nút chọn nhanh từ Catalog */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách mặt hàng ({items.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 rounded-xl hover:bg-emerald-200/70 cursor-pointer shadow-2xs active:scale-95 transition-all"
              >
                <PackagePlus className="w-4 h-4 text-emerald-700" />
                <span>+ Chọn từ Mặt hàng</span>
              </button>

              <button
                type="button"
                onClick={handleAddRow}
                className="min-h-[44px] inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 rounded-xl border border-[#D8EFE9] cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thêm dòng trống</span>
              </button>
            </div>
          </div>

          {/* Tiêu đề cột trên Laptop/Desktop (Hiện khi màn hình >= md) */}
          <div className="hidden md:grid md:grid-cols-12 md:gap-2.5 px-3 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider bg-emerald-50/70 border border-emerald-100 rounded-xl">
            <div className="col-span-1 text-center">STT</div>
            <div className="col-span-4">Tên mặt hàng</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-center">Đơn vị</div>
            <div className="col-span-2 text-right">Đơn giá ngày này</div>
            <div className="col-span-1 text-center">Xóa</div>
          </div>

          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto overscroll-contain pr-1">
            {items.map((row, idx) => (
              <div
                key={row.id}
                className="p-3 bg-white border border-[#D8EFE9] rounded-2xl space-y-2.5 md:space-y-0 md:grid md:grid-cols-12 md:gap-2.5 md:items-center relative shadow-xs"
              >
                {/* 1. STT */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center font-mono font-bold text-xs text-emerald-700">
                  #{idx + 1}
                </div>

                {/* 2. Tên mặt hàng */}
                <div className="md:col-span-4">
                  <div className="flex items-center justify-between gap-2 md:hidden mb-1">
                    <span className="text-xs font-bold text-emerald-700 font-mono">#{idx + 1}</span>
                  </div>
                  <ItemAutocomplete
                    value={row.name}
                    onChange={(val) => handleUpdateItem(row.id, "name", val)}
                    onSelectItem={(selected) => handleSelectItem(row.id, selected)}
                  />
                </div>

                {/* Mobile & Desktop inputs */}
                <div className="grid grid-cols-12 gap-2 md:contents">
                  {/* Số lượng */}
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5 font-medium md:hidden">Số lượng</label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={row.quantity}
                      onChange={(e) =>
                        handleUpdateItem(row.id, "quantity", parseFloat(e.target.value) || 0)
                      }
                      className="w-full min-h-[44px] h-10 px-2 rounded-xl border border-[#D8EFE9] bg-[#F4FBF9] font-mono tabular-nums text-base text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  {/* Đơn vị */}
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5 font-medium md:hidden">Đơn vị</label>
                    <select
                      value={row.unit}
                      onChange={(e) => handleUpdateItem(row.id, "unit", e.target.value)}
                      className="w-full min-h-[44px] h-10 px-1 rounded-xl border border-[#D8EFE9] bg-[#F4FBF9] text-base font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                      {availableUnits.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Đơn giá */}
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-[10px] text-slate-500 mb-0.5 font-medium md:hidden">Đơn giá ngày này</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.unitPrice > 0 ? row.unitPrice.toLocaleString("vi-VN") : ""}
                      onChange={(e) =>
                        handleUpdateItem(row.id, "unitPrice", parseVND(e.target.value))
                      }
                      placeholder="0 ₫"
                      className="w-full min-h-[44px] h-10 px-2 rounded-xl border border-[#D8EFE9] bg-[#F4FBF9] font-mono tabular-nums text-base text-right font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                {/* Thao tác xóa trên Desktop */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center">
                  {items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id)}
                      className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                      title="Xóa dòng này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </div>

                {/* Phân loại & Thành tiền dòng */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-2 border-t border-emerald-50 md:col-span-12 md:pt-1.5 md:mt-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Nhóm hàng:</span>
                    <select
                      value={row.category}
                      onChange={(e) => handleUpdateItem(row.id, "category", e.target.value)}
                      className="min-h-[36px] h-9 px-2 text-xs font-semibold rounded-xl border border-[#D8EFE9] bg-[#F4FBF9] text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 cursor-pointer"
                    >
                      {DEFAULT_PURCHASE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <span className="text-xs text-slate-500">Thành tiền:</span>
                    <span className="font-mono tabular-nums font-extrabold text-emerald-700 text-sm">
                      {formatVND(row.lineTotal)}
                    </span>
                    {/* Nút xóa trên Mobile */}
                    <div className="md:hidden">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-red-600 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Tổng tiền toàn hóa đơn & Nút lưu */}
        <div className="pt-2 border-t border-[#D8EFE9] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">
              Tổng hóa đơn ({items.length} món):
            </span>
            <span className="text-2xl font-extrabold font-mono tabular-nums text-emerald-700">
              {formatVND(grandTotal)}
            </span>
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="peach"
            className="w-full min-h-[48px] h-12 text-base font-bold shadow-md shadow-orange-500/25"
          >
            {loading ? "Đang lưu hóa đơn..." : `Lưu Hóa Đơn (${formatVND(grandTotal)})`}
          </Button>
        </div>
      </form>

      {/* Modal Chọn Mặt Hàng Đã Tạo */}
      <CatalogItemPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onAddItems={handleAddItemsFromCatalog}
      />
    </>
  );
}
