"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatVND, parseVND } from "@/lib/utils/currency";
import { formatDateVN } from "@/lib/utils/date";
import { Calendar, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface CheckinData {
  _id?: string;
  dateKey: string;
  amount: number;
  isMakeup?: boolean;
  note?: string;
  checkedInAt?: string;
}

interface CheckinDayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string | null;
  checkin: CheckinData | null;
  defaultAmount: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  onSuccess: () => void;
}

export function CheckinDayDetailModal({
  isOpen,
  onClose,
  dateKey,
  checkin,
  defaultAmount,
  isToday,
  isPast,
  isFuture,
  onSuccess,
}: CheckinDayDetailModalProps) {
  const { showToast } = useToast();
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (checkin) {
      setAmountStr(formatVND(checkin.amount));
      setNote(checkin.note || "");
    } else {
      setAmountStr(formatVND(defaultAmount));
      setNote("");
    }
  }, [checkin, defaultAmount, isOpen]);

  if (!dateKey) return null;

  const dateObj = new Date(dateKey + "T00:00:00+07:00");
  const formattedDate = formatDateVN(dateObj);

  // Submit điểm danh mới hoặc cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseVND(amountStr);
    if (amountNum <= 0) {
      showToast("Số tiền điểm danh phải lớn hơn 0", "error");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (checkin) {
        // Cập nhật số tiền / ghi chú của ngày đã điểm danh
        res = await fetch(`/api/checkins/${dateKey}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountNum, note: note.trim() }),
        });
      } else {
        // Điểm danh mới (hoặc điểm danh bù nếu là ngày quá khứ)
        res = await fetch("/api/checkins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dateKey: isToday ? undefined : dateKey,
            amount: amountNum,
            note: note.trim(),
          }),
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(
          json.message ||
            (checkin ? "Đã cập nhật ngày điểm danh" : `Đã điểm danh ngày ${dateKey}`),
          "success"
        );
        onSuccess();
        onClose();
      } else {
        showToast(json.message || "Thao tác thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setLoading(false);
    }
  };

  // Hủy điểm danh
  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn hủy điểm danh ngày ${dateKey} không?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/checkins/${dateKey}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Đã hủy điểm danh ngày ${dateKey}`, "success");
        onSuccess();
        onClose();
      } else {
        showToast(json.message || "Hủy thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        checkin
          ? "Chi tiết điểm danh"
          : isToday
          ? "Điểm danh hôm nay"
          : "Điểm danh bù"
      }
      description={`${formattedDate} (${dateKey})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trạng thái ngày */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs">
          <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <span className="font-semibold text-slate-800">
              {checkin
                ? checkin.isMakeup
                  ? "Đã điểm danh bù"
                  : "Đã điểm danh đúng ngày"
                : isToday
                ? "Chưa điểm danh hôm nay"
                : isPast
                ? "Chưa điểm danh (cho phép điểm danh bù)"
                : "Ngày trong tương lai"}
            </span>
            {checkin?.checkedInAt && (
              <span className="block text-[11px] text-slate-500 mt-0.5">
                Thời điểm ghi nhận:{" "}
                {new Date(checkin.checkedInAt).toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
              </span>
            )}
          </div>
        </div>

        {isFuture ? (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Không thể điểm danh trước cho ngày tương lai. Vui lòng quay lại vào ngày đó.</span>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Số tiền tiết kiệm (VNĐ) <span className="text-red-500">*</span>
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ghi chú (Tùy chọn)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: Tiền lãi cà phê, thưởng tuần..."
                className="w-full min-h-[44px] h-11 px-3.5 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="pt-3 border-t border-[#D8EFE9] flex items-center justify-between gap-2">
              {checkin ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDelete}
                  loading={deleting}
                  className="min-h-[44px] px-3 text-red-600 hover:bg-red-50 gap-1.5 text-xs font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hủy ngày này</span>
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="min-h-[44px]"
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="min-h-[44px] px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {checkin ? "Cập nhật" : isPast && !isToday ? "Điểm danh bù" : "Điểm danh ngay"}
                </Button>
              </div>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
