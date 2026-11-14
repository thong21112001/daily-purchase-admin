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
    { label: "Mặt hàng & Giá", href: "/catalog", icon: Package },
    { label: "Báo cáo & Sao lưu", href: "/reports", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 flex items-center justify-center font-bold shadow-xs">
          <Coffee className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            Sổ Nhập Hàng
          </h1>
          <p className="text-[11px] text-zinc-400">Single-Owner Admin</p>
        </div>
      </div>

      {/* Main Quick Action Button */}
      <div className="p-4">
        <Button
          onClick={onOpenQuickEntry}
          className="w-full h-11 flex items-center justify-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi hàng mới</span>
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
                "flex items-center gap-3 px-3.5 h-11 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="text-xs">
          <span className="block font-medium text-zinc-700 dark:text-zinc-300">Chủ quản trị</span>
          <span className="text-[11px] text-emerald-600 font-mono">Phiên 90 ngày</span>
        </div>
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
