"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AdminLayoutShell } from "@/components/layout/AdminLayoutShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { useToast } from "@/components/ui/Toast";
import { formatVND } from "@/lib/utils/currency";
import { VietQrModal } from "@/components/mbbank/VietQrModal";
import { BankSimulatorModal } from "@/components/mbbank/BankSimulatorModal";
import { WebhookGuideModal } from "@/components/mbbank/WebhookGuideModal";
import {
  CreditCard,
  TrendingUp,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  Search,
  Trash2,
  HelpCircle,
  Play,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

interface BankTxItem {
  _id: string;
  transactionRef: string;
  bankName: string;
  accountNumber: string;
  type: "IN" | "OUT";
  amount: number;
  balanceAfter: number;
  senderName: string;
  content: string;
  transactionDate: string;
  dateKey: string;
  source: string;
  rawNotification?: string;
}

interface BankStats {
  todayInAmount: number;
  todayOutAmount: number;
  todayInCount: number;
  monthInAmount: number;
  monthInCount: number;
  balanceLatest: number;
  lastUpdated?: string;
}

function MBBankContent() {
  const { showToast } = useToast();

  const [stats, setStats] = useState<BankStats>({
    todayInAmount: 0,
    todayOutAmount: 0,
    todayInCount: 0,
    monthInAmount: 0,
    monthInCount: 0,
    balanceLatest: 0,
  });

  const [transactions, setTransactions] = useState<BankTxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "IN" | "OUT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BankTxItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // VietQR & Accounts
  const defaultAccNo = process.env.NEXT_PUBLIC_MBBANK_ACCOUNT_NO || "0905123456";
  const defaultAccName = process.env.NEXT_PUBLIC_MBBANK_ACCOUNT_NAME || "QUAN CA PHE";
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCopiedAcc, setIsCopiedAcc] = useState(false);

  // Simulator & Guide Modals
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Fetch Data
  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const statsRes = await fetch("/api/mbbank?stats=true");
        const statsJson = await statsRes.json();
        if (statsJson.success) {
          setStats(statsJson.data);
        }

        const params = new URLSearchParams();
        if (filterType !== "ALL") params.set("type", filterType);
        if (searchQuery.trim()) params.set("query", searchQuery.trim());
        params.set("limit", "50");

        const txRes = await fetch(`/api/mbbank?${params.toString()}`);
        const txJson = await txRes.json();
        if (txJson.success) {
          setTransactions(txJson.data?.transactions || []);
        }
      } catch {
        if (!isBackground) {
          showToast("Không thể tải dữ liệu MB Bank", "error");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filterType, searchQuery, showToast]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // 10s Polling
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    pollTimerRef.current = setInterval(() => {
      fetchData(true);
    }, 10000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchData]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/mbbank/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("Đã xóa giao dịch thành công", "success");
        setDeleteTarget(null);
        fetchData();
      } else {
        showToast(json.message || "Xóa thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi xóa giao dịch", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSimulateSend = async (text: string) => {
    if (!text.trim()) {
      showToast("Vui lòng nhập nội dung thông báo giả lập", "error");
      return;
    }

    setIsSimulating(true);
    try {
      const res = await fetch("/api/mbbank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawNotification: text.trim() }),
      });

      const json = await res.json();
      if (json.success) {
        showToast(json.message || "Đã nhận biến động số dư giả lập!", "success");
        setIsSimulatorOpen(false);
        fetchData();
      } else {
        showToast(json.message || "Giả lập thất bại", "error");
      }
    } catch {
      showToast("Lỗi kết nối khi gửi giả lập", "error");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(defaultAccNo);
    setIsCopiedAcc(true);
    showToast("Đã sao chép số tài khoản MB Bank", "success");
    setTimeout(() => setIsCopiedAcc(false), 2000);
  };

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://your-domain.vercel.app";
  const webhookUrl = `${currentOrigin}/api/webhooks/mbbank`;

  return (
    <div className="space-y-6">
      {/* Header MB Bank */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8EFE9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              MB Bank Tracker & VietQR
            </h1>
            <Badge variant="mint" size="sm" className="font-semibold text-[11px] py-0.5">
              Live Tracker 10s
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động ghi nhận thông báo tiền vào tài khoản MB Bank qua Webhook & quét mã QR tại quầy
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGuideOpen(true)}
            className="min-h-[44px] px-3 text-xs gap-1.5"
            title="Xem hướng dẫn kết nối 2 phút"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Cài đặt Webhook</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSimulatorOpen(true)}
            className="min-h-[44px] px-3 text-xs gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50"
            title="Thử nghiệm thông báo tiền vào giả lập"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Giả lập tiền vào</span>
          </Button>

          <Button
            variant="peach"
            size="sm"
            onClick={() => setIsQrModalOpen(true)}
            className="min-h-[44px] px-3.5 text-xs font-semibold gap-1.5"
          >
            <QrCode className="w-4 h-4" />
            <span>Mã VietQR quầy</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="min-h-[44px] w-11 p-0 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
            title="Làm mới ngay"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
          </Button>
        </div>
      </div>

      {/* 3 Thẻ KPI Fresh & Free (Xanh Mint - Xanh Trời - Cam Đào) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Card className="border border-[#D8EFE9] bg-gradient-to-br from-emerald-50/70 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Tiền vào hôm nay</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-800">
              +{formatVND(stats.todayInAmount)}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1">
              Đã nhận: <span className="font-semibold font-mono tabular-nums">{stats.todayInCount}</span> lượt GD
            </p>
          </div>
        </Card>

        <Card className="border border-sky-200/80 bg-gradient-to-br from-sky-50/70 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-800">Tiền vào tháng này</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100/80 text-sky-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-sky-800">
              +{formatVND(stats.monthInAmount)}
            </div>
            <p className="text-[11px] text-sky-600 mt-1">
              Tổng tháng: <span className="font-semibold font-mono tabular-nums">{stats.monthInCount}</span> lượt nhận
            </p>
          </div>
        </Card>

        <Card className="border border-orange-200/80 bg-gradient-to-br from-orange-50/70 to-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-orange-800">Số dư MB Bank mới nhất</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100/80 text-orange-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-orange-800">
              {formatVND(stats.balanceLatest)}
            </div>
            <p className="text-[11px] text-orange-600 mt-1">
              Cập nhật tự động từ thông báo biến động
            </p>
          </div>
        </Card>
      </div>

      {/* Thông tin tài khoản & Tìm kiếm */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#D8EFE9] shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-200">
              MB
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                  {defaultAccName}
                </span>
                <span className="font-mono text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 tabular-nums">
                  {defaultAccNo}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="min-h-[44px] px-2 text-slate-400 hover:text-sky-600 inline-flex items-center gap-1 text-xs cursor-pointer"
                  title="Sao chép số tài khoản"
                >
                  {isCopiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[11px]">{isCopiedAcc ? "Đã chép" : "Chép STK"}</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-400 block">Ngân hàng Quân Đội (MB Bank)</span>
            </div>
          </div>

          {/* Bộ lọc loại giao dịch */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <div className="flex rounded-xl bg-slate-100 p-1 border border-[#D8EFE9]">
              {(
                [
                  { id: "ALL", label: "Tất cả" },
                  { id: "IN", label: "Tiền vào (+)" },
                  { id: "OUT", label: "Tiền ra (-)" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterType(f.id)}
                  className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    filterType === f.id
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo nội dung chuyển khoản, người gửi, số tài khoản, mã tham chiếu..."
            className="w-full h-11 pl-10 pr-4 text-base rounded-xl border border-[#D8EFE9] bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-colors"
          />
        </div>
      </div>

      {/* Danh sách biến động số dư */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-6 h-6 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Đang tải biến động số dư MB Bank...</p>
        </div>
      ) : transactions.length === 0 ? (
        <Card className="border-dashed border-2 border-[#D8EFE9] p-8 text-center bg-white">
          <div className="max-w-sm mx-auto space-y-3">
            <CreditCard className="w-10 h-10 text-sky-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900">
              Chưa có giao dịch biến động nào
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Các thông báo tiền vào sẽ xuất hiện tức thì tại đây khi có khách quét mã QR hoặc chuyển khoản.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSimulatorOpen(true)}
                className="min-h-[44px] text-xs gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-orange-500" />
                <span>Bắn thử 1 thông báo</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsQrModalOpen(true)}
                className="min-h-[44px] text-xs font-semibold gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Mở mã VietQR</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {transactions.map((tx) => {
            const isIncome = tx.type === "IN";
            const dateObj = new Date(tx.transactionDate);
            const timeStr = dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
            const dateStr = dateObj.toLocaleDateString("vi-VN");

            return (
              <Card
                key={tx._id}
                className="border border-[#D8EFE9] bg-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 shadow-xs transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                  >
                    {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 break-words">
                        {tx.content}
                      </span>
                      {tx.senderName && (
                        <span className="text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          {tx.senderName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                      <span className="font-mono tabular-nums text-slate-500">
                        {timeStr} • {dateStr}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        Ref: {tx.transactionRef.slice(-10)}
                      </span>
                      {tx.source && (
                        <>
                          <span>•</span>
                          <span className="text-[10px] text-slate-500 uppercase">{tx.source}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <div
                      className={`text-base sm:text-lg font-bold font-mono tabular-nums ${
                        isIncome ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatVND(tx.amount)}
                    </div>
                    {tx.balanceAfter > 0 && (
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums block">
                        Số dư sau: {formatVND(tx.balanceAfter)}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setDeleteTarget(tx)}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                    title="Xóa bản ghi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <VietQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        defaultAccNo={defaultAccNo}
        defaultAccName={defaultAccName}
        onCopyAccount={handleCopyAccount}
      />

      <BankSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSimulateSend={handleSimulateSend}
        isLoading={isSimulating}
      />

      <WebhookGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        webhookUrl={webhookUrl}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget ? `Giao dịch ${deleteTarget.transactionRef}` : ""}
        itemAmount={deleteTarget?.amount}
        itemDetails={deleteTarget?.content}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function MBBankPage() {
  return (
    <AdminLayoutShell>
      <MBBankContent />
    </AdminLayoutShell>
  );
}
