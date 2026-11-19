"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Copy } from "lucide-react";
import { formatVND, parseVND } from "@/lib/utils/currency";

interface VietQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAccNo: string;
  defaultAccName: string;
  onCopyAccount: () => void;
}

export function VietQrModal({
  isOpen,
  onClose,
  defaultAccNo,
  defaultAccName,
  onCopyAccount,
}: VietQrModalProps) {
  const [qrAmount, setQrAmount] = useState("");
  const [qrNote, setQrNote] = useState("Thanh toan tien cafe");

  const qrAmountNum = qrAmount ? parseVND(qrAmount) : 0;
  const vietQrUrl = `https://img.vietqr.io/image/970422-${defaultAccNo}-compact2.png?amount=${qrAmountNum}&addInfo=${encodeURIComponent(
    qrNote
  )}&accountName=${encodeURIComponent(defaultAccName)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mã VietQR Nhận Tiền Tại Quầy"
      description="Khách dùng ứng dụng ngân hàng bất kỳ để quét mã trả tiền"
    >
      <div className="space-y-4">
        {/* Card hiển thị QR */}
        <div className="bg-white border-2 border-emerald-500/30 rounded-2xl p-4 text-center space-y-3 shadow-xs">
          <div className="relative mx-auto w-64 h-64 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
            <Image
              src={vietQrUrl}
              alt="VietQR MB Bank"
              fill
              sizes="256px"
              className="object-contain"
              unoptimized
            />
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-900">{defaultAccName}</h4>
            <p className="font-mono text-xs text-sky-700 font-semibold">{defaultAccNo} (MB Bank)</p>
            {qrAmountNum > 0 && (
              <div className="mt-1 text-lg font-bold font-mono tabular-nums text-emerald-700">
                {formatVND(qrAmountNum)}
              </div>
            )}
          </div>
        </div>

        {/* Ô nhập số tiền tùy chọn */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tiền cần thanh toán (VNĐ) — Để trống nếu khách tự gõ:
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={qrAmount}
              onChange={(e) => {
                const raw = e.target.value;
                const num = parseVND(raw);
                setQrAmount(num > 0 ? formatVND(num) : raw);
              }}
              placeholder="VD: 35.000 (hoặc để trống)"
              className="w-full min-h-[44px] h-11 px-3 text-base font-mono tabular-nums rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nội dung chuyển khoản gợi ý:
            </label>
            <input
              type="text"
              value={qrNote}
              onChange={(e) => setQrNote(e.target.value)}
              placeholder="VD: Ban 03 cafe"
              className="w-full min-h-[44px] h-11 px-3 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCopyAccount}
            className="min-h-[44px] gap-1.5"
          >
            <Copy className="w-4 h-4" />
            <span>Chép số tài khoản</span>
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
