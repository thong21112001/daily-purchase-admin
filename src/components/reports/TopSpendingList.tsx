"use client";

import React from "react";
import { formatVND } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/Badge";

export interface TopSpendingItem {
  name: string;
  category?: string;
  unit: string;
  totalAmount: number;
  totalQuantity: number;
  purchaseCount: number;
  avgUnitPrice: number;
}

interface TopSpendingListProps {
  items: TopSpendingItem[];
}

export function TopSpendingList({ items }: TopSpendingListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-zinc-400">
        Chưa có mặt hàng nào được ghi nhận chi tiêu
      </div>
    );
  }

  return (
    <div className="divide-y divide-emerald-50">
      {items.map((item, index) => (
        <div
          key={`${item.name}-${index}`}
          className="py-3 flex items-center justify-between gap-3 text-xs"
        >
          {/* Thứ hạng & Tên mặt hàng */}
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`w-6 h-6 rounded-lg text-center font-mono font-bold text-xs shrink-0 flex items-center justify-center ${
                index === 0
                  ? "bg-amber-100 text-amber-800 font-extrabold"
                  : index === 1
                  ? "bg-slate-200 text-slate-800"
                  : index === 2
                  ? "bg-orange-100 text-orange-800"
                  : "text-slate-400"
              }`}
            >
              #{index + 1}
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 truncate">
                {item.name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {item.category && (
                  <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5">
                    {item.category}
                  </Badge>
                )}
                <span className="text-[11px] text-slate-500">
                  {item.purchaseCount} lần mua ({item.totalQuantity} {item.unit})
                </span>
              </div>
            </div>
          </div>

          {/* Chi phí & Giá trung bình */}
          <div className="text-right shrink-0">
            <div className="font-mono tabular-nums font-bold text-slate-900 text-sm">
              {formatVND(item.totalAmount)}
            </div>
            <div className="text-[11px] font-mono tabular-nums text-emerald-700 font-medium">
              TB {formatVND(Math.round(item.avgUnitPrice))}/{item.unit}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
