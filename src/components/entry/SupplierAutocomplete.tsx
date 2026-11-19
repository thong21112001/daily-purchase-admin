"use client";

import React, { useState, useEffect, useRef } from "react";
import { Store, Check, Plus, Loader2, X } from "lucide-react";

export interface SupplierItem {
  _id?: string;
  name: string;
  category?: string;
  usageCount?: number;
}

interface SupplierAutocompleteProps {
  value: string;
  onChange: (val: string) => void;
  onSelectSupplier?: (supplier: SupplierItem) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SupplierAutocomplete({
  value,
  onChange,
  onSelectSupplier,
  placeholder = "Chợ, Siêu thị, Đại lý...",
  disabled = false,
}: SupplierAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (keyword: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/suppliers?q=${encodeURIComponent(keyword)}&limit=8`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setResults(json.data);
      }
    } catch {
      // Fallback silent
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setIsOpen(true);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 180);
  };

  const handleFocus = () => {
    setIsOpen(true);
    fetchSuggestions(value);
  };

  const handleSelect = (item: SupplierItem) => {
    onChange(item.name);
    if (onSelectSupplier) onSelectSupplier(item);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

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

  const hasExactMatch = results.some(
    (r) => r.name.trim().toLowerCase() === value.trim().toLowerCase()
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full min-h-[44px] h-11 pl-10 pr-16 rounded-xl border border-emerald-200 bg-white text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-xs"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-600">
          <Store className="w-4 h-4" />
        </div>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Xóa nơi mua"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-emerald-100 rounded-2xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.15)] z-50 overflow-hidden max-h-60 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-1.5 space-y-0.5">
              {results.map((item) => {
                const isSelected = item.name.trim().toLowerCase() === value.trim().toLowerCase();
                return (
                  <button
                    key={item._id || item.name}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-xl flex items-center justify-between text-left text-sm transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-800 font-semibold"
                        : "hover:bg-emerald-50/60 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Store className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.category && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-100 text-emerald-700">
                          {item.category}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                  </button>
                );
              })}

              {!hasExactMatch && value.trim() && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full min-h-[44px] px-3 py-2 text-left text-xs text-emerald-700 hover:bg-emerald-50 rounded-xl flex items-center gap-1.5 border-t border-emerald-50 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    Dùng nơi mua mới: <strong className="font-semibold">&ldquo;{value.trim()}&rdquo;</strong>
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-slate-500">
              {value.trim() ? (
                <div className="space-y-1">
                  <p>Chưa có nơi mua &ldquo;{value}&rdquo; trong danh bạ.</p>
                  <p className="text-[11px] text-emerald-600 font-medium">
                    Hệ thống sẽ tự động lưu nơi mua này khi bạn bấm Lưu.
                  </p>
                </div>
              ) : (
                <p>Gõ để tìm hoặc nhập tên nơi mua mới</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
