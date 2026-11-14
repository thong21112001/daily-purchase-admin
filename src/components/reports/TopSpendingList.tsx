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
    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
      {items.map((item, index) => (
        <div
          key={`${item.name}-${index}`}
          className="py-3 flex items-center justify-between gap-3 text-xs"
        >
          {/* Thứ hạng & Tên mặt hàng */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-5 text-center font-mono font-bold text-zinc-400 text-xs shrink-0">
              {index + 1}
            </span>
            <div className="min-w-0">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {item.name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {item.category && (
                  <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5">
                    {item.category}
                  </Badge>
                )}
                <span className="text-[11px] text-zinc-400">
                  {item.purchaseCount} lần mua ({item.totalQuantity} {item.unit})
                </span>
              </div>
            </div>
          </div>

          {/* Chi phí & Giá trung bình */}
          <div className="text-right shrink-0">
            <div className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
              {formatVND(item.totalAmount)}
            </div>
            <div className="text-[11px] font-mono tabular-nums text-zinc-400">
              TB {formatVND(Math.round(item.avgUnitPrice))}/{item.unit}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
