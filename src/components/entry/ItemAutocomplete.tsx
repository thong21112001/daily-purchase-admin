"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Package, X } from "lucide-react";
import { formatVND } from "@/lib/utils/currency";

export interface SelectedItemPayload {
  name: string;
  category?: string;
  unit: string;
  unitPrice?: number;
}

interface ItemAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectItem: (item: SelectedItemPayload) => void;
  autoFocus?: boolean;
}

export function ItemAutocomplete({
  value,
  onChange,
  onSelectItem,
  autoFocus = false,
}: ItemAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lắng nghe khi gõ để gọi API gợi ý
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!value.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/catalog?q=${encodeURIComponent(value.trim())}&limit=8`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSuggestions(json.data);
          setIsOpen(json.data.length > 0);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 120);
    return () => clearTimeout(timer);
  }, [value]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    onChange(item.name);
    onSelectItem({
      name: item.name,
      category: item.category,
      unit: item.defaultUnit || "cái",
      unitPrice: item.lastUnitPrice || 0,
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          autoFocus={autoFocus}
          placeholder="Tên mặt hàng (VD: Cà phê, Sữa đặc, Chanh...)"
          className="w-full min-h-[44px] h-11 pl-4 pr-16 rounded-xl border border-[#D8EFE9] bg-white text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-medium shadow-xs"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Xóa tên mặt hàng"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Search className="w-4 h-4 pointer-events-none mr-1" />
        </div>
      </div>

      {/* Dropdown Gợi Ý 0.1s */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-[#D8EFE9] rounded-2xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.15)] max-h-60 overflow-y-auto divide-y divide-emerald-50 overscroll-contain">
          <div className="px-3 py-1.5 bg-[#F4FBF9] text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Gợi ý từ danh mục đã mua
          </div>
          {suggestions.map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full min-h-[44px] px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-emerald-50/70 cursor-pointer active:bg-emerald-100/60 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Package className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-900 leading-snug truncate">
                    {item.name}
                  </span>
                  <span className="block text-[11px] text-slate-500 leading-none mt-0.5 truncate">
                    {item.category} • Đơn vị: {item.defaultUnit}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="block text-xs font-bold font-mono tabular-nums text-emerald-700">
                  {formatVND(item.lastUnitPrice)}
                </span>
                <span className="block text-[10px] text-slate-400">Giá gần nhất</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
