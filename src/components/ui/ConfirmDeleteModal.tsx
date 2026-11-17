"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Trash2, AlertTriangle } from "lucide-react";
import { formatVND } from "@/lib/utils/currency";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  itemDetails?: string;
  itemAmount?: number;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận xóa dữ liệu",
  itemName,
  itemDetails,
  itemAmount,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Hành động này sẽ xóa dữ liệu vĩnh viễn khỏi hệ thống"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-red-50/80 border border-red-200/80">
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-900 truncate">
              {itemName || "Bạn có chắc muốn xóa bản ghi này?"}
            </h4>
            {itemAmount !== undefined && (
              <span className="font-mono tabular-nums font-bold text-red-600 text-xs">
                Số tiền: {formatVND(itemAmount)}
              </span>
            )}
            {itemDetails && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{itemDetails}</p>
            )}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2 text-xs text-amber-800 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Cảnh báo:</strong> Dữ liệu đã xóa sẽ không thể khôi phục lại được. Vui lòng kiểm tra kỹ trước khi xác nhận.
          </span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#D8EFE9]">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="min-h-[44px] px-5"
          >
            Hủy
          </Button>
          <Button
            type="button"
            loading={isLoading}
            onClick={onConfirm}
            className="min-h-[44px] px-5 bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs active:scale-95"
          >
            Xác Nhận Xóa
          </Button>
        </div>
      </div>
    </Modal>
  );
}
