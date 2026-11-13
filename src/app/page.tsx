import { redirect } from "next/navigation";
import { getCurrentOwnerSession } from "@/lib/auth";
import { getTodayKey, formatDateVN } from "@/lib/utils/date";

export default async function HomePage() {
  const session = await getCurrentOwnerSession();

  if (!session) {
    redirect("/login");
  }

  const todayKey = getTodayKey();
  const todayFormatted = formatDateVN(new Date());

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Sổ Quản Trị Nhập Hàng
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Hôm nay: <span className="font-mono tabular-nums text-zinc-900 dark:text-zinc-200 font-medium">{todayFormatted}</span> ({todayKey})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              Chủ sở hữu: {session.username}
            </span>
          </div>
        </header>

        {/* Phase 1 Status Banner */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Nền tảng Phase 1 đã khởi tạo thành công</span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Cơ sở dữ liệu Mongoose Singleton, xác thực Single-Owner Cookie (90 ngày) và bộ tiện ích chuẩn hóa múi giờ Việt Nam đã sẵn sàng cho Phase 2 (API Handlers & Auto-Learn Catalog).
          </p>
        </div>
      </div>
    </div>
  );
}

