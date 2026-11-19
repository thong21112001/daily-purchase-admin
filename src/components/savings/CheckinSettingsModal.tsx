"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatVND, parseVND } from "@/lib/utils/currency";
import { Settings, Info } from "lucide-react";

interface CheckinSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDefaultAmount: number;
  onSuccess: (newAmount: number) => void;
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

export function CheckinSettingsModal({
  isOpen,
  onClose,
  currentDefaultAmount,
  onSuccess,
}: CheckinSettingsModalProps) {
  const { showToast } = useToast();
  const [amountStr, setAmountStr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAmountStr(formatVND(currentDefaultAmount || 200000));
  }, [currentDefaultAmount, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseVND(amountStr);
    if (num <= 0) {
      showToast("Mức tiền mặc định phải lớn hơn 0", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkins/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultAmount: num }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Đã cập nhật mức tiết kiệm mặc định", "success");
        onSuccess(num);
        onClose();
      } else {
        showToast(json.message || "Cập nhật thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cài đặt mức tiết kiệm mỗi ngày"
      description="Thay đổi số tiền mặc định khi bấm điểm danh 1 chạm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mức tiền mặc định mỗi ngày (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            required
            value={amountStr}
            onChange={(e) => {
              const num = parseVND(e.target.value);
              setAmountStr(num > 0 ? formatVND(num) : e.target.value);
            }}
            placeholder="200.000"
            className="w-full min-h-[44px] h-12 px-4 rounded-xl border border-[#D8EFE9] bg-white text-slate-900 font-mono tabular-nums text-lg font-bold focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Mức chọn nhanh */}
        <div>
          <span className="text-[11px] text-slate-500 block mb-1.5">Gợi ý chọn nhanh:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmountStr(formatVND(amt))}
                className="min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-mono tabular-nums font-semibold border border-[#D8EFE9] hover:bg-emerald-50 text-slate-700 transition-colors"
              >
                {formatVND(amt)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-start gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Thay đổi mức mặc định này sẽ áp dụng cho các lần điểm danh trong tương lai. Lịch sử các ngày đã điểm danh trước đây được bảo toàn nguyên vẹn.
          </span>
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
            loading={loading}
            className="min-h-[44px] px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            Lưu cài đặt
          </Button>
        </div>
      </form>
    </Modal>
  );
}
