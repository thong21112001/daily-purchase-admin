/**
 * BỘ TIỆN ÍCH NGÀY GIỜ CHUẨN MÚI GIỜ VIỆT NAM (ASIA/HO_CHI_MINH - UTC+7)
 * Đảm bảo ghi chép đêm muộn (sau 0h) hoặc sáng sớm không bị lệch ngày trên máy chủ Vercel (UTC)
 */

export const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";

/**
 * Lấy các thành phần ngày giờ hiện tại theo múi giờ Việt Nam
 */
export function getVNParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: VIETNAM_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, number> = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      partMap[part.type] = parseInt(part.value, 10);
    }
  }

  return {
    year: partMap.year || date.getFullYear(),
    month: partMap.month || date.getMonth() + 1,
    day: partMap.day || date.getDate(),
    hours: partMap.hour || 0,
    minutes: partMap.minute || 0,
    seconds: partMap.second || 0,
  };
}

/**
 * Sinh dateKey chuẩn định dạng YYYY-MM-DD theo giờ Việt Nam
 * Ví dụ: "2026-11-13"
 */
export function getDateKey(date: Date = new Date()): string {
  const { year, month, day } = getVNParts(date);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Lấy dateKey của ngày hôm nay theo giờ VN
 */
export function getTodayKey(): string {
  return getDateKey(new Date());
}

/**
 * Lấy dateKey của ngày hôm qua theo giờ VN
 */
export function getYesterdayKey(): string {
  const now = new Date();
  // Trừ 24 giờ trên timestamp thực tế
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return getDateKey(yesterday);
}

/**
 * Lấy monthKey chuẩn định dạng YYYY-MM theo giờ VN (Ví dụ: "2026-11")
 */
export function getMonthKey(date: Date = new Date()): string {
  const { year, month } = getVNParts(date);
  const mm = String(month).padStart(2, "0");
  return `${year}-${mm}`;
}

/**
 * Định dạng hiển thị ngày tiếng Việt (DD/MM/YYYY)
 * Ví dụ: "13/11/2026"
 */
export function formatDateVN(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const { day, month, year } = getVNParts(date);
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${dd}/${mm}/${year}`;
}

/**
 * Định dạng hiển thị ngày giờ đầy đủ (HH:mm - DD/MM/YYYY)
 * Ví dụ: "16:45 - 13/11/2026"
 */
export function formatDateTimeVN(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const { hours, minutes, day, month, year } = getVNParts(date);
  const hh = String(hours).padStart(2, "0");
  const min = String(minutes).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${hh}:${min} - ${dd}/${mm}/${year}`;
}

/**
 * Lấy khoảng ngày phục vụ lọc sổ mua hàng
 */
export function getDateRange(
  rangeType: "today" | "yesterday" | "7days" | "last_7_days" | "this_month" | "custom",
  customStart?: string,
  customEnd?: string
): { startDateKey: string; endDateKey: string } {
  const today = getTodayKey();

  switch (rangeType) {
    case "today":
      return { startDateKey: today, endDateKey: today };
    case "yesterday": {
      const yesterday = getYesterdayKey();
      return { startDateKey: yesterday, endDateKey: yesterday };
    }
    case "7days":
    case "last_7_days": {
      const past7 = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      return { startDateKey: getDateKey(past7), endDateKey: today };
    }
    case "this_month": {
      const { year, month } = getVNParts(new Date());
      const mm = String(month).padStart(2, "0");
      return { startDateKey: `${year}-${mm}-01`, endDateKey: today };
    }
    case "custom":
      return {
        startDateKey: customStart || today,
        endDateKey: customEnd || today,
      };
    default:
      return { startDateKey: today, endDateKey: today };
  }
}

export interface PastDayOption {
  dateKey: string;
  label: string;
  shortLabel: string;
  isToday: boolean;
  isYesterday: boolean;
  dayOfWeek: string;
  isoDate: string;
}

/**
 * Tạo danh sách các ngày trong vòng 7 ngày qua (để ghi lùi ngày)
 */
export function getPastDaysOptions(days = 8): PastDayOption[] {
  const options: PastDayOption[] = [];
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = getDateKey(d);
    const { year, month, day } = getVNParts(d);
    const dd = String(day).padStart(2, "0");
    const mm = String(month).padStart(2, "0");

    const vnDateObj = new Date(d.toLocaleString("en-US", { timeZone: VIETNAM_TIMEZONE }));
    const dow = daysOfWeek[vnDateObj.getDay()];

    let label = `${dow}, ${dd}/${mm}`;
    let shortLabel = `${dow}, ${dd}/${mm}`;

    if (i === 0) {
      label = `Hôm nay (${dd}/${mm})`;
      shortLabel = `Hôm nay`;
    } else if (i === 1) {
      label = `Hôm qua (${dd}/${mm})`;
      shortLabel = `Hôm qua`;
    }

    const isoDate = `${year}-${mm}-${dd}T12:00:00+07:00`;

    options.push({
      dateKey,
      label,
      shortLabel,
      isToday: i === 0,
      isYesterday: i === 1,
      dayOfWeek: dow,
      isoDate,
    });
  }

  return options;
}


