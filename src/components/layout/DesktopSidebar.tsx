"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Calendar,
  Package,
  BarChart3,
  Plus,
  LogOut,
  Coffee,
  Landmark,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

interface DesktopSidebarProps {
  onOpenQuickEntry: () => void;
}

export function DesktopSidebar({ onOpenQuickEntry }: DesktopSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Hôm nay", href: "/", icon: ShoppingBag },
    { label: "Sổ theo ngày", href: "/history", icon: Calendar },
    { label: "Điểm danh tiết kiệm", href: "/savings", icon: PiggyBank },
    { label: "Mặt hàng & Nơi mua", href: "/catalog", icon: Package },
    { label: "Báo cáo & Sao lưu", href: "/reports", icon: BarChart3 },
    { label: "MB Bank & Webhook", href: "/mb-bank", icon: Landmark },
  ];

  const handleLogout = async () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#D8EFE9] bg-white h-screen fixed left-0 top-0 z-30 select-none shadow-[2px_0_12px_rgba(16,185,129,0.04)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#D8EFE9] gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20">
          <Coffee className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-slate-900">
            Sổ Nhập Hàng
          </h1>
          <p className="text-[11px] text-emerald-600 font-medium">Fresh & Free Edition</p>
        </div>
      </div>

      {/* Main Quick Action Button (Cam Đào nổi bật) */}
      <div className="p-4">
        <Button
          onClick={onOpenQuickEntry}
          variant="peach"
          className="w-full h-11 flex items-center justify-center gap-2 font-bold shadow-md shadow-orange-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Ghi hàng mới</span>
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 h-11 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-500 shadow-2xs"
                  : "text-slate-600 hover:bg-emerald-50/60 hover:text-emerald-900"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-emerald-600" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-[#D8EFE9] flex items-center justify-between bg-emerald-50/30">
        <div className="text-xs">
          <span className="block font-semibold text-slate-800">Chủ quán</span>
          <span className="text-[11px] text-emerald-600 font-mono">Phiên 90 ngày</span>
        </div>
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
