"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Calendar, Package, BarChart3, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MobileBottomNavProps {
  onOpenQuickEntry: () => void;
}

export function MobileBottomNav({ onOpenQuickEntry }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navTabs = [
    { label: "Hôm nay", href: "/", icon: ShoppingBag },
    { label: "Sổ ngày", href: "/history", icon: Calendar },
    // Center button slot
    { label: "Mặt hàng", href: "/catalog", icon: Package },
    { label: "Báo cáo", href: "/reports", icon: BarChart3 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 pb-safe select-none">
      <div className="h-16 px-2 flex items-center justify-around relative max-w-lg mx-auto">
        {/* Tab 1: Hôm nay */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-1 py-1 rounded-xl text-[11px] font-medium transition-colors",
            pathname === "/"
              ? "text-zinc-950 dark:text-zinc-50 font-bold"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          )}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Hôm nay</span>
        </Link>

        {/* Tab 2: Sổ theo ngày */}
        <Link
          href="/history"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-1 py-1 rounded-xl text-[11px] font-medium transition-colors",
            pathname === "/history"
              ? "text-zinc-950 dark:text-zinc-50 font-bold"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          )}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Sổ ngày</span>
        </Link>

        {/* Nút trung tâm: + Ghi hàng (Nổi bật, ngay tầm ngón cái) */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            onClick={onOpenQuickEntry}
            className="w-14 h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 flex flex-col items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer border-2 border-white dark:border-zinc-950"
            aria-label="Ghi hàng mới"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Mặt hàng & Giá */}
        <Link
          href="/catalog"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-1 py-1 rounded-xl text-[11px] font-medium transition-colors",
            pathname === "/catalog"
              ? "text-zinc-950 dark:text-zinc-50 font-bold"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          )}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Mặt hàng</span>
        </Link>

        {/* Tab 4: Báo cáo & Sao lưu */}
        <Link
          href="/reports"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-1 py-1 rounded-xl text-[11px] font-medium transition-colors",
            pathname === "/reports"
              ? "text-zinc-950 dark:text-zinc-50 font-bold"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          )}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Báo cáo</span>
        </Link>
      </div>
    </nav>
  );
}
