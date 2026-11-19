"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Copy, Check } from "lucide-react";

interface WebhookGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
}

export function WebhookGuideModal({
  isOpen,
  onClose,
  webhookUrl,
}: WebhookGuideModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hướng Dẫn Kết Nối Webhook Tự Động (2 Phút)"
      description="Cách đồng bộ biến động số dư MB Bank về Sổ Quản Trị Nhập Hàng"
    >
      <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
        {/* Địa chỉ Webhook */}
        <div className="bg-slate-50 border border-[#D8EFE9] rounded-xl p-3 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-700 block">Địa chỉ Webhook nhận tin:</span>
          <div className="flex items-center gap-2">
            <code className="text-[11px] font-mono text-emerald-800 bg-white px-2.5 py-1.5 rounded-lg border border-[#D8EFE9] flex-1 truncate">
              {webhookUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="min-h-[38px] px-3 shrink-0 gap-1 text-xs"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? "Đã chép" : "Sao chép"}</span>
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">
            Khóa bí mật: <code className="font-mono font-semibold text-slate-600">MBBANK_WEBHOOK_SECRET</code> (nếu đã đặt trong file .env).
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center justify-center font-bold text-[10px]">
              1
            </span>
            Cách 1: Điện thoại Android (Miễn phí 100%, khuyến nghị)
          </h4>
          <p className="pl-6 text-slate-500">
            1. Tải ứng dụng <strong>Notification Forwarder</strong> hoặc <strong>MacroDroid</strong> từ Google Play Store trên điện thoại có cài app MBBank.
            <br />
            2. Tạo quy tắc: Khi có thông báo từ ứng dụng <em>MBBank</em>, thực hiện gửi HTTP Request (POST) đến đường link Webhook phía trên với trường <code>content</code> hoặc toàn bộ văn bản thông báo.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 inline-flex items-center justify-center font-bold text-[10px]">
              2
            </span>
            Cách 2: Cổng Webhook tự động (SePay / Casso)
          </h4>
          <p className="pl-6 text-slate-500">
            1. Đăng ký tài khoản tại <em>SePay.vn</em> hoặc <em>Casso.vn</em> và liên kết tài khoản MB Bank của bạn.
            <br />
            2. Vào mục <strong>Cấu hình Webhook</strong>, dán đường dẫn Webhook phía trên vào và chọn ngân hàng MBBank. Hệ thống sẽ tự động bắt giao dịch theo thời gian thực.
          </p>
        </div>

        <div className="pt-2 flex justify-end border-t border-[#D8EFE9]">
          <Button onClick={onClose} className="min-h-[44px] px-6">
            Đã hiểu
          </Button>
        </div>
      </div>
    </Modal>
  );
}
