"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileTopHeader } from "./MobileTopHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { QuickEntryDrawer } from "@/components/entry/QuickEntryDrawer";

interface LayoutContextType {
  openQuickEntry: () => void;
  todayTotal: number;
  triggerRefresh: () => void;
  refreshTick: number;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used inside AdminLayoutShell");
  return ctx;
}

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTodayTotal = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (json.success && json.data?.kpis?.today) {
        setTodayTotal(json.data.kpis.today.totalAmount || 0);
      }
    } catch {
      // Bỏ qua lỗi ngầm khi mạng chập chờn
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodayTotal();
  }, [refreshTick]);

  const triggerRefresh = () => {
    setRefreshTick((prev) => prev + 1);
  };

  return (
    <LayoutContext.Provider
      value={{
        openQuickEntry: () => setIsQuickEntryOpen(true),
        todayTotal,
        triggerRefresh,
        refreshTick,
      }}
    >
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col lg:flex-row w-full max-w-full overflow-x-hidden">
          {/* 1. Sidebar cố định trên Desktop (w-64) */}
          <DesktopSidebar onOpenQuickEntry={() => setIsQuickEntryOpen(true)} />

          {/* 2. Khung nội dung chính */}
          <div className="flex-1 lg:pl-64 flex flex-col min-h-screen w-full max-w-full pb-24 lg:pb-8">
            {/* Header di động mỏng (Galaxy A35 5G) */}
            <MobileTopHeader
              todayTotal={todayTotal}
              onRefresh={fetchTodayTotal}
              isRefreshing={isRefreshing}
            />

            {/* Vùng nội dung các trang căn giữa gọn gàng */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 overscroll-none">
              {children}
            </main>
          </div>

          {/* 3. Thanh điều hướng đáy di động (h-16, pb-safe) */}
          <MobileBottomNav onOpenQuickEntry={() => setIsQuickEntryOpen(true)} />

          {/* 4. Drawer Nhập Hàng Siêu Tốc */}
          <QuickEntryDrawer
            isOpen={isQuickEntryOpen}
            onClose={() => setIsQuickEntryOpen(false)}
            onRefreshData={triggerRefresh}
          />
        </div>
      </LayoutContext.Provider>
  );
}
