"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Calendar, BarChart3, Plus, Landmark } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MobileBottomNavProps {
  onOpenQuickEntry: () => void;
}

export function MobileBottomNav({ onOpenQuickEntry }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#D8EFE9] pb-safe select-none shadow-[0_-4px_20px_rgba(16,185,129,0.06)]">
      <div className="h-16 px-2 flex items-center justify-around relative max-w-lg mx-auto">
        {/* Tab 1: Hôm nay */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-1 py-1 rounded-xl text-[11px] font-medium transition-colors",
            pathname === "/"
              ? "text-emerald-700 font-bold"
              : "text-slate-400 hover:text-slate-600"
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
              ? "text-emerald-700 font-bold"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Sổ ngày</span>
        </Link>

        {/* Nút trung tâm: + Ghi hàng (Cam Đào tươi sáng, ngay tầm ngón cái) */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            onClick={onOpenQuickEntry}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex flex-col items-center justify-center shadow-lg shadow-orange-500/30 active:scale-90 transition-all cursor-pointer border-2 border-white"
            aria-label="Ghi hàng mới"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: Báo cáo */}
        <Link
          href="/reports"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-1 py-1 rounded-xl text-[11px] font-medium transition-colors",
            pathname === "/reports"
              ? "text-emerald-700 font-bold"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Báo cáo</span>
        </Link>

        {/* Tab 5: MB Bank (Xanh Trời) */}
        <Link
          href="/mb-bank"
          className={cn(
            "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-1 py-1 rounded-xl text-[11px] font-medium transition-colors",
            pathname === "/mb-bank"
              ? "text-sky-600 font-bold"
              : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Landmark className="w-5 h-5 mb-0.5" />
          <span>MB Bank</span>
        </Link>
      </div>
    </nav>
  );
}
