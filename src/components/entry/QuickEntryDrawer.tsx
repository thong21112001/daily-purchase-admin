"use client";

import React, { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { QuickSingleItemForm } from "./QuickSingleItemForm";
import { BatchReceiptForm } from "./BatchReceiptForm";
import { Zap, Receipt } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface QuickEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export function QuickEntryDrawer({
  isOpen,
  onClose,
  onRefreshData,
}: QuickEntryDrawerProps) {
  // Lựa chọn A từ người dùng: Mặc định mở ở Chế độ 1 (Ghi lẻ 1 món siêu tốc)
  const [mode, setMode] = useState<"SINGLE" | "BATCH">("SINGLE");
  const { toast } = useToast();

  const handleSuccess = () => {
    toast(
      mode === "SINGLE"
        ? "Đã lưu món vào sổ nhập hàng thành công!"
        : "Đã lưu hóa đơn mua hàng thành công!",
      "success"
    );
    onClose();
    if (onRefreshData) onRefreshData();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Ghi Chép Mua Hàng</span>
        </div>
      }
      description="Ghi nhận ngay sau khi mua tại chợ, siêu thị hoặc đại lý"
    >
      <div className="space-y-4">
        {/* Segmented Mode Toggle (Galaxy A35 Touch-Friendly >= 44px) */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80">
          <button
            type="button"
            onClick={() => setMode("SINGLE")}
            className={`flex-1 min-h-[44px] h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === "SINGLE"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Ghi lẻ 1 món siêu tốc</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("BATCH")}
            className={`flex-1 min-h-[44px] h-11 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === "BATCH"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Ghi theo hóa đơn</span>
          </button>
        </div>

        {/* Form Body theo chế độ */}
        {mode === "SINGLE" ? (
          <QuickSingleItemForm onSuccess={handleSuccess} onCancel={onClose} />
        ) : (
          <BatchReceiptForm onSuccess={handleSuccess} onCancel={onClose} />
        )}
      </div>
    </Drawer>
  );
}
