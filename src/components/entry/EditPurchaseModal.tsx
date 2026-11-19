"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, Plus, Trash2, AlertCircle } from "lucide-react";
import { SupplierAutocomplete } from "./SupplierAutocomplete";
import { PurchaseDateSelector } from "./PurchaseDateSelector";
import { ItemAutocomplete, type SelectedItemPayload } from "./ItemAutocomplete";
import { COMMON_UNITS, DEFAULT_PURCHASE_CATEGORIES } from "@/lib/constants/categories";
import { formatVND, parseVND, calculateLineTotal } from "@/lib/utils/currency";
import { useToast } from "@/components/ui/Toast";

interface EditItemState {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  note?: string;
}

interface EditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: string | null;
  onSuccess: () => void;
}

export function EditPurchaseModal({
  isOpen,
  onClose,
  purchaseId,
  onSuccess,
}: EditPurchaseModalProps) {
  const { showToast } = useToast();

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [editCount, setEditCount] = useState(0);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(new Date().toISOString());
  const [selectedDateKey, setSelectedDateKey] = useState<string>("");
  const [supplier, setSupplier] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<EditItemState[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([...COMMON_UNITS]);

  // Nạp danh sách đơn vị
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

  // Nạp dữ liệu phiếu cần sửa
  useEffect(() => {
    if (!isOpen || !purchaseId) return;

    async function loadPurchase() {
      setLoadingInitial(true);
      setError(null);
      try {
        const res = await fetch(`/api/purchases/${purchaseId}`);
        const json = await res.json();

        if (!res.ok || !json.success || !json.data) {
          setError(json.message || "Không thể tải thông tin phiếu mua hàng");
          return;
        }

        const data = json.data;
        setCode(data.code || "");
        setEditCount(data.editCount || 0);
        setSelectedDateIso(data.purchaseDate || new Date().toISOString());
        setSelectedDateKey(data.dateKey || "");
        setSupplier(data.supplier || "");
        setPaymentMethod(data.paymentMethod || "CASH");
        setNote(data.note || "");

        const loadedItems: EditItemState[] = (data.items || []).map((it: any, idx: number) => ({
          id: it._id || `item-${idx}-${Date.now()}`,
          name: it.name || "",
          category: it.category || "Nguyên liệu Cà phê & Trà",
          unit: it.unit || "kg",
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || 0,
          lineTotal: it.lineTotal || 0,
          note: it.note || "",
        }));

        setItems(loadedItems.length > 0 ? loadedItems : [
          {
            id: `item-${Date.now()}`,
            name: "",
            category: "Nguyên liệu Cà phê & Trà",
            unit: "kg",
            quantity: 1,
            unitPrice: 0,
            lineTotal: 0,
          },
        ]);
      } catch {
        setError("Lỗi kết nối khi tải phiếu");
      } finally {
        setLoadingInitial(false);
      }
    }

    loadPurchase();
  }, [isOpen, purchaseId]);

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

  const handleRemoveRow = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof EditItemState, value: any) => {
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

  const grandTotal = items.reduce((sum, it) => sum + it.lineTotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseId) return;

    if (editCount >= 1) {
      showToast("Phiếu đã chỉnh sửa 1 lần. Không thể chỉnh sửa thêm", "error");
      return;
    }

    const validItems = items.filter((it) => it.name.trim() && it.unitPrice > 0);
    if (validItems.length === 0) {
      setError("Vui lòng nhập ít nhất 1 mặt hàng có tên và đơn giá hợp lệ");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        purchaseDate: selectedDateIso,
        supplier: supplier.trim(),
        paymentMethod,
        note: note.trim(),
        items: validItems.map((it) => ({
          name: it.name.trim(),
          category: it.category,
          unit: it.unit.trim(),
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          lineTotal: it.lineTotal,
          note: it.note?.trim() || "",
        })),
      };

      const res = await fetch(`/api/purchases/${purchaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Lỗi khi cập nhật phiếu mua hàng");
        setSubmitting(false);
        return;
      }

      showToast(`Đã lưu thay đổi cho phiếu ${code}`, "success");
      onSuccess();
      onClose();
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chỉnh Sửa Phiếu Mua Hàng ${code ? `(${code})` : ""}`}
      description="Chỉ cho phép chỉnh sửa duy nhất 1 lần để đảm bảo tính minh bạch của sổ"
      maxWidth="max-w-4xl"
    >
      {loadingInitial ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Đang tải thông tin phiếu...</p>
        </div>
      ) : editCount >= 1 ? (
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Phiếu đã được chỉnh sửa (1/1)
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Theo quy định khóa bảo mật sổ, mỗi phiếu chỉ được sửa duy nhất 1 lần. Nếu thông tin vẫn chưa chính xác, bạn vui lòng xóa phiếu này và ghi lại phiếu mới.
            </p>
          </div>
          <Button onClick={onClose} className="min-h-[44px] px-6">
            Đã hiểu & Đóng
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Banner cảnh báo 1 lần duy nhất */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Quy tắc chỉnh sửa:</span> Bạn chỉ được phép chỉnh sửa phiếu này{" "}
              <span className="font-bold underline text-amber-700">DUY NHẤT 1 LẦN</span>. Sau khi bấm &quot;Lưu Thay Đổi&quot;, phiếu sẽ tự động khóa chỉnh sửa vĩnh viễn.
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Chọn ngày mua */}
          <PurchaseDateSelector
            selectedDateIso={selectedDateIso}
            selectedDateKey={selectedDateKey}
            onChangeDate={(iso, key) => {
              setSelectedDateIso(iso);
              setSelectedDateKey(key);
            }}
          />

          {/* Nơi mua & Hình thức thanh toán */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F4FBF9] border border-[#D8EFE9] rounded-2xl p-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nơi mua / Nhà cung cấp
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
                      ? "bg-emerald-600 text-white shadow-xs"
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
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white border border-[#D8EFE9] text-slate-700 hover:bg-emerald-50"
                  }`}
                >
                  Chuyển khoản
                </button>
              </div>
            </div>
          </div>

          {/* Danh sách mặt hàng */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Danh sách mặt hàng ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddRow}
                className="min-h-[44px] inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-emerald-50 rounded-xl border border-[#D8EFE9] cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thêm dòng trống</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
              {items.map((row, idx) => (
                <div
                  key={row.id}
                  className="p-3 bg-white border border-[#D8EFE9] rounded-2xl space-y-2.5 md:space-y-0 md:grid md:grid-cols-12 md:gap-2.5 md:items-center relative shadow-xs"
                >
                  {/* STT */}
                  <div className="hidden md:flex md:col-span-1 items-center justify-center font-mono font-bold text-xs text-emerald-700">
                    #{idx + 1}
                  </div>

                  {/* Tên mặt hàng */}
                  <div className="md:col-span-4">
                    <ItemAutocomplete
                      value={row.name}
                      onChange={(val) => handleUpdateItem(row.id, "name", val)}
                      onSelectItem={(selected) => handleSelectItem(row.id, selected)}
                    />
                  </div>

                  {/* Mobile & Desktop inputs wrapper */}
                  <div className="grid grid-cols-12 gap-2 md:contents">
                    {/* Số lượng */}
                    <div className="col-span-4 md:col-span-2">
                      <label className="block text-[10px] text-slate-500 mb-0.5 md:hidden font-medium">Số lượng</label>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        inputMode="decimal"
                        value={row.quantity}
                        onChange={(e) =>
                          handleUpdateItem(row.id, "quantity", parseFloat(e.target.value) || 0)
                        }
                        className="w-full min-h-[44px] h-10 px-2 rounded-xl border border-[#D8EFE9] bg-[#F4FBF9] font-mono tabular-nums text-base text-center font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 min-w-0"
                      />
                    </div>

                    {/* Đơn vị */}
                    <div className="col-span-4 md:col-span-2">
                      <label className="block text-[10px] text-slate-500 mb-0.5 md:hidden font-medium">Đơn vị</label>
                      <select
                        value={row.unit}
                        onChange={(e) => handleUpdateItem(row.id, "unit", e.target.value)}
                        className="w-full min-h-[44px] h-10 px-1 rounded-xl border border-[#D8EFE9] bg-[#F4FBF9] text-base font-semibold text-slate-800 focus:outline-hidden focus:border-emerald-500 min-w-0"
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
                      <label className="block text-[10px] text-slate-500 mb-0.5 md:hidden font-medium">Đơn giá</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={row.unitPrice > 0 ? row.unitPrice.toLocaleString("vi-VN") : ""}
                        onChange={(e) =>
                          handleUpdateItem(row.id, "unitPrice", parseVND(e.target.value))
                        }
                        placeholder="0 ₫"
                        className="w-full min-h-[44px] h-10 px-2 rounded-xl border border-[#D8EFE9] bg-[#F4FBF9] font-mono tabular-nums text-base text-right font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 min-w-0"
                      />
                    </div>
                  </div>

                  {/* Xóa dòng trên Desktop */}
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

                  {/* Phân loại & Thành tiền */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-2 border-t border-emerald-50 md:col-span-12 md:pt-1.5 md:mt-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Nhóm hàng:</span>
                      <select
                        value={row.category}
                        onChange={(e) => handleUpdateItem(row.id, "category", e.target.value)}
                        className="min-h-[36px] h-9 px-2 text-xs font-semibold rounded-xl border border-[#D8EFE9] bg-[#F4FBF9] text-slate-800 focus:outline-hidden focus:border-emerald-500 cursor-pointer"
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
                      {items.length > 1 && (
                        <div className="md:hidden">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-red-600 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ghi chú chung */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú thêm về đợt mua (tùy chọn)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Mua thêm sữa dự phòng cuối tuần..."
              className="w-full h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Footer modal: Tổng tiền & Nút hành động */}
          <div className="pt-3 border-t border-[#D8EFE9] flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 block">Tổng tiền sau chỉnh sửa:</span>
              <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-800">
                {formatVND(grandTotal)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="min-h-[44px]">
                Hủy
              </Button>
              <Button
                type="submit"
                variant="peach"
                loading={submitting}
                className="min-h-[44px] px-6 font-bold"
              >
                Lưu Thay Đổi (1 Lần Duy Nhất)
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
