"use client";

import React from "react";
import { Search, X, ArrowUpDown } from "lucide-react";
import { DEFAULT_PURCHASE_CATEGORIES } from "@/lib/constants/categories";
import { CustomSelect } from "@/components/ui/CustomSelect";

export type CatalogSortOption =
  | "usage"
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "recent";

interface CatalogToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: CatalogSortOption;
  onSortChange: (sort: CatalogSortOption) => void;
}

const SORT_OPTIONS: { label: string; value: CatalogSortOption }[] = [
  { label: "Mua nhiều nhất (Mặc định)", value: "usage" },
  { label: "Tên: A → Z (Tiếng Việt)", value: "name_asc" },
  { label: "Tên: Z → A", value: "name_desc" },
  { label: "Giá: Thấp → Cao", value: "price_asc" },
  { label: "Giá: Cao → Thấp", value: "price_desc" },
  { label: "Mới cập nhật", value: "recent" },
];

export function CatalogToolbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: CatalogToolbarProps) {
  return (
    <div className="space-y-3">
      {/* Search Bar & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm mặt hàng (không dấu: robusta, sua dac...)"
            className="w-full h-11 pl-10 pr-10 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="w-full sm:w-64 shrink-0">
          <div className="relative">
            <CustomSelect
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as CatalogSortOption)}
              options={SORT_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {["Tất cả", ...DEFAULT_PURCHASE_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              selectedCategory === cat
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "bg-white text-slate-600 border border-[#D8EFE9] hover:bg-emerald-50/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
