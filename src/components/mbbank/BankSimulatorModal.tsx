"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Send } from "lucide-react";

export const SAMPLE_NOTIFICATIONS = [
  {
    title: "Khách trả tiền nước (35.000 ₫)",
    text: "Thông báo biến động số dư: TK 0905123456|GD: +35,000VND 16/11/26 09:30 |SD: 12,500,000VND|ND: CA PHE SUA DA BAN 03",
  },
  {
    title: "Bàn 4 thanh toán (120.000 ₫)",
    text: "Thông báo biến động số dư: TK 0905123456|GD: +120,000VND 16/11/26 10:15 |SD: 12,620,000VND|ND: NGUYEN VAN A thanh toan ban 04",
  },
  {
    title: "Chuyển tiền cọc sinh nhật (500.000 ₫)",
    text: "Thông báo biến động số dư: TK 0905123456|GD: +500,000VND 16/11/26 11:00 |SD: 13,120,000VND|ND: LE THI B chuyen tien coc tiec sinh nhat",
  },
];

interface BankSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateSend: (text: string) => Promise<void>;
  isLoading: boolean;
}

export function BankSimulatorModal({
  isOpen,
  onClose,
  onSimulateSend,
  isLoading,
}: BankSimulatorModalProps) {
  const [simText, setSimText] = useState(SAMPLE_NOTIFICATIONS[0].text);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulateSend(simText);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Giả Lập Thông Báo Tiền Vào MB Bank"
      description="Bắn thử biến động số dư tức thì để kiểm tra tính năng mà không cần giao dịch thực tế"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            Chọn nhanh thông báo mẫu:
          </span>
          <div className="space-y-1.5">
            {SAMPLE_NOTIFICATIONS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSimText(sample.text)}
                className="w-full text-left p-2.5 rounded-xl border border-[#D8EFE9] hover:bg-emerald-50/60 transition-colors text-xs flex items-center justify-between gap-2 cursor-pointer"
              >
                <span className="font-medium text-slate-800 truncate">{sample.title}</span>
                <span className="text-[11px] text-emerald-700 font-semibold shrink-0">Chọn</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nội dung thông báo đầy đủ (Chuẩn app MBBank hoặc SMS):
          </label>
          <textarea
            rows={4}
            value={simText}
            onChange={(e) => setSimText(e.target.value)}
            className="w-full p-3 text-base font-mono rounded-xl border border-[#D8EFE9] bg-white text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none leading-relaxed"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#D8EFE9]">
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
            className="min-h-[44px] px-5 gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Bắn giả lập ngay</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
