import { connectToDatabase } from "@/lib/mongodb";
import { SavingsCheckin, type ISavingsCheckin } from "@/models/savings-checkin.model";
import { SavingsSetting } from "@/models/savings-setting.model";
import { getTodayKey, getYesterdayKey, getMonthKey, getEndOfMonthDateKey, getDateKey } from "@/lib/utils/date";

export interface CheckinStats {
  todayCheckedIn: boolean;
  todayAmount: number;
  currentStreak: number;
  longestStreak: number;
  thisMonthTotal: number;
  thisMonthDays: number;
  allTimeTotal: number;
  allTimeDays: number;
  defaultAmount: number;
  targetMonthlyDays: number;
}

export class CheckinService {
  /**
   * Lấy mức tiền mặc định mỗi ngày từ cấu hình
   */
  static async getDefaultAmount(): Promise<number> {
    await connectToDatabase();
    try {
      const setting = await SavingsSetting.findOne({ key: "default_daily_amount" });
      return setting ? setting.defaultAmount : 200000;
    } catch {
      return 200000;
    }
  }

  /**
   * Cập nhật mức tiền mặc định cho các lần điểm danh tương lai
   */
  static async updateDefaultAmount(amount: number): Promise<number> {
    await connectToDatabase();
    const validAmount = Math.max(0, Math.round(amount));
    await SavingsSetting.findOneAndUpdate(
      { key: "default_daily_amount" },
      { $set: { defaultAmount: validAmount } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return validAmount;
  }

  /**
   * Điểm danh hôm nay (Idempotent - Chống trùng 2 lần/ngày)
   */
  static async checkInToday(
    customAmount?: number,
    note?: string
  ): Promise<{ checkin: ISavingsCheckin; isNew: boolean }> {
    await connectToDatabase();

    const todayKey = getTodayKey();
    const existing = await SavingsCheckin.findOne({ dateKey: todayKey });

    if (existing) {
      return { checkin: existing, isNew: false };
    }

    const defaultAmt = await this.getDefaultAmount();
    const finalAmount = customAmount !== undefined && customAmount >= 0 ? Math.round(customAmount) : defaultAmt;

    const created = await SavingsCheckin.create({
      dateKey: todayKey,
      amount: finalAmount,
      isMakeup: false,
      note: note?.trim() || "",
      checkedInAt: new Date(),
    });

    return { checkin: created, isNew: true };
  }

  /**
   * Điểm danh bù cho một ngày trong quá khứ
   */
  static async checkInMakeup(
    dateKey: string,
    amount?: number,
    note?: string
  ): Promise<{ checkin: ISavingsCheckin; isNew: boolean }> {
    await connectToDatabase();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      throw new Error("Định dạng ngày không hợp lệ (yêu cầu YYYY-MM-DD)");
    }

    const todayKey = getTodayKey();
    const isToday = dateKey === todayKey;

    const existing = await SavingsCheckin.findOne({ dateKey });
    if (existing) {
      return { checkin: existing, isNew: false };
    }

    const defaultAmt = await this.getDefaultAmount();
    const finalAmount = amount !== undefined && amount >= 0 ? Math.round(amount) : defaultAmt;

    const created = await SavingsCheckin.create({
      dateKey,
      amount: finalAmount,
      isMakeup: !isToday,
      note: note?.trim() || (isToday ? "" : "Điểm danh bù"),
      checkedInAt: new Date(),
    });

    return { checkin: created, isNew: true };
  }

  /**
   * Cập nhật số tiền hoặc ghi chú của một ngày đã điểm danh
   */
  static async updateCheckin(
    dateKey: string,
    amount: number,
    note?: string
  ): Promise<ISavingsCheckin | null> {
    await connectToDatabase();

    const checkin = await SavingsCheckin.findOne({ dateKey });
    if (!checkin) return null;

    if (amount !== undefined && amount >= 0) {
      checkin.amount = Math.round(amount);
    }
    if (note !== undefined) {
      checkin.note = note.trim();
    }

    await checkin.save();
    return checkin;
  }

  /**
   * Hủy bản ghi điểm danh nếu bấm nhầm
   */
  static async deleteCheckin(dateKey: string): Promise<boolean> {
    await connectToDatabase();
    const res = await SavingsCheckin.findOneAndDelete({ dateKey });
    return !!res;
  }

  /**
   * Lấy danh sách điểm danh theo tháng (YYYY-MM)
   */
  static async getMonthCheckins(monthKey?: string): Promise<any[]> {
    await connectToDatabase();

    const targetMonth = monthKey || getMonthKey();
    const endOfMonth = getEndOfMonthDateKey(targetMonth);

    return SavingsCheckin.find({
      dateKey: {
        $gte: `${targetMonth}-01`,
        $lte: endOfMonth,
      },
    })
      .sort({ dateKey: 1 })
      .lean();
  }

  /**
   * Tính toán chuỗi liên tiếp (Streak) và toàn bộ chỉ số thống kê
   */
  static async getStats(monthKey?: string): Promise<CheckinStats> {
    await connectToDatabase();

    const todayKey = getTodayKey();
    const yesterdayKey = getYesterdayKey();
    const targetMonth = monthKey || getMonthKey();
    const endOfMonth = getEndOfMonthDateKey(targetMonth);

    // Lấy toàn bộ ngày đã điểm danh để tính streak và tổng lũy kế
    const [allRecords, monthRecords, defaultAmount] = await Promise.all([
      SavingsCheckin.find({}, "dateKey amount").sort({ dateKey: -1 }).lean(),
      SavingsCheckin.find({
        dateKey: {
          $gte: `${targetMonth}-01`,
          $lte: endOfMonth,
        },
      }).lean(),
      this.getDefaultAmount(),
    ]);

    const dateKeySet = new Set<string>();
    let allTimeTotal = 0;
    let todayCheckedIn = false;
    let todayAmount = 0;

    for (const rec of allRecords) {
      dateKeySet.add(rec.dateKey);
      allTimeTotal += rec.amount || 0;
      if (rec.dateKey === todayKey) {
        todayCheckedIn = true;
        todayAmount = rec.amount || 0;
      }
    }

    let thisMonthTotal = 0;
    for (const rec of monthRecords) {
      thisMonthTotal += rec.amount || 0;
    }

    // 1. Tính Current Streak
    let currentStreak = 0;
    // Bắt đầu chuỗi từ hôm nay nếu đã điểm danh, hoặc từ hôm qua nếu hôm nay chưa điểm danh
    let cursorDateStr = todayCheckedIn ? todayKey : yesterdayKey;

    if (dateKeySet.has(cursorDateStr)) {
      while (dateKeySet.has(cursorDateStr)) {
        currentStreak++;
        // Lùi lại 1 ngày: tạo date object và trừ 1 ngày
        const curParts = cursorDateStr.split("-");
        const curY = parseInt(curParts[0], 10);
        const curM = parseInt(curParts[1], 10);
        const curD = parseInt(curParts[2], 10);
        const prev = new Date(Date.UTC(curY, curM - 1, curD) - 24 * 60 * 60 * 1000);
        cursorDateStr = prev.toISOString().slice(0, 10);
      }
    }

    // 2. Tính Longest Streak
    let longestStreak = 0;
    let tempStreak = 0;

    // Sắp xếp tăng dần để duyệt chuỗi dài nhất
    const sortedAscDates = Array.from(dateKeySet).sort();
    let expectedNextStr: string | null = null;

    for (const dKey of sortedAscDates) {
      if (!expectedNextStr || dKey === expectedNextStr) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }

      // Tính ngày tiếp theo dự kiến
      const dParts = dKey.split("-");
      const dY = parseInt(dParts[0], 10);
      const dM = parseInt(dParts[1], 10);
      const dD = parseInt(dParts[2], 10);
      const nextDay = new Date(Date.UTC(dY, dM - 1, dD) + 24 * 60 * 60 * 1000);
      expectedNextStr = nextDay.toISOString().slice(0, 10);
    }

    return {
      todayCheckedIn,
      todayAmount,
      currentStreak,
      longestStreak,
      thisMonthTotal,
      thisMonthDays: monthRecords.length,
      allTimeTotal,
      allTimeDays: allRecords.length,
      defaultAmount,
      targetMonthlyDays: 30,
    };
  }
}
