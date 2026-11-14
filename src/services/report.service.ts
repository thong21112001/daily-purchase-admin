import { connectToDatabase } from "@/lib/mongodb";
import { PurchaseLog } from "@/models/purchase-log.model";
import { getTodayKey, getYesterdayKey, getMonthKey, getDateRange } from "@/lib/utils/date";

export class ReportService {
  /**
   * Tính toán các chỉ số KPI then chốt trên Dashboard:
   * - Chi hôm nay
   * - Chi hôm qua
   * - Lũy kế tháng này
   * - Số món đã mua hôm nay
   * - Số lần đi mua (phiếu) hôm nay
   */
  static async getDashboardKPIs() {
    await connectToDatabase();

    const todayKey = getTodayKey();
    const yesterdayKey = getYesterdayKey();
    const currentMonthKey = getMonthKey();

    const [todayAgg, yesterdayAgg, monthAgg] = await Promise.all([
      // 1. Chi tiêu hôm nay
      PurchaseLog.aggregate([
        { $match: { dateKey: todayKey } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
            itemCount: { $sum: "$itemCount" },
            purchaseCount: { $sum: 1 },
          },
        },
      ]),

      // 2. Chi tiêu hôm qua
      PurchaseLog.aggregate([
        { $match: { dateKey: yesterdayKey } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
            purchaseCount: { $sum: 1 },
          },
        },
      ]),

      // 3. Lũy kế tháng này
      PurchaseLog.aggregate([
        { $match: { dateKey: { $regex: `^${currentMonthKey}` } } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
            purchaseCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const todayData = todayAgg[0] || { totalAmount: 0, itemCount: 0, purchaseCount: 0 };
    const yesterdayData = yesterdayAgg[0] || { totalAmount: 0, purchaseCount: 0 };
    const monthData = monthAgg[0] || { totalAmount: 0, purchaseCount: 0 };

    return {
      today: {
        dateKey: todayKey,
        totalAmount: todayData.totalAmount,
        itemCount: todayData.itemCount,
        purchaseCount: todayData.purchaseCount,
      },
      yesterday: {
        dateKey: yesterdayKey,
        totalAmount: yesterdayData.totalAmount,
        purchaseCount: yesterdayData.purchaseCount,
      },
      thisMonth: {
        monthKey: currentMonthKey,
        totalAmount: monthData.totalAmount,
        purchaseCount: monthData.purchaseCount,
      },
    };
  }

  /**
   * Biểu đồ chi tiêu hằng ngày trong tháng (Daily Spending Bar List)
   * Trả về danh sách các ngày có phát sinh chi tiêu và tổng tiền từng ngày
   */
  static async getDailySpending(monthKey?: string) {
    await connectToDatabase();

    const targetMonth = monthKey || getMonthKey();

    const dailyData = await PurchaseLog.aggregate([
      { $match: { dateKey: { $regex: `^${targetMonth}` } } },
      {
        $group: {
          _id: "$dateKey",
          totalAmount: { $sum: "$totalAmount" },
          purchaseCount: { $sum: 1 },
          itemCount: { $sum: "$itemCount" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          dateKey: "$_id",
          totalAmount: 1,
          purchaseCount: 1,
          itemCount: 1,
        },
      },
    ]);

    return {
      monthKey: targetMonth,
      days: dailyData,
    };
  }

  /**
   * Phân bổ chi tiêu theo nhóm danh mục hàng hóa (Category Breakdown)
   */
  static async getCategoryBreakdown(startDateKey?: string, endDateKey?: string) {
    await connectToDatabase();

    const range = getDateRange("this_month", startDateKey, endDateKey);

    const breakdown = await PurchaseLog.aggregate([
      {
        $match: {
          dateKey: {
            $gte: startDateKey || range.startDateKey,
            $lte: endDateKey || range.endDateKey,
          },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: { $ifNull: ["$items.category", "Khác"] },
          totalAmount: { $sum: "$items.lineTotal" },
          itemCount: { $sum: 1 },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalAmount: -1 } },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: 1,
          itemCount: 1,
          totalQuantity: 1,
        },
      },
    ]);

    const grandTotal = breakdown.reduce((sum, item) => sum + item.totalAmount, 0);

    const categoriesWithPercentage = breakdown.map((cat) => ({
      ...cat,
      percentage: grandTotal > 0 ? Math.round((cat.totalAmount / grandTotal) * 1000) / 10 : 0,
    }));

    return {
      grandTotal,
      categories: categoriesWithPercentage,
    };
  }

  /**
   * Top các mặt hàng tốn nhiều tiền nhất trong khoảng thời gian
   */
  static async getTopSpendingItems(startDateKey?: string, endDateKey?: string, limit = 10) {
    await connectToDatabase();

    const range = getDateRange("this_month", startDateKey, endDateKey);

    const topItems = await PurchaseLog.aggregate([
      {
        $match: {
          dateKey: {
            $gte: startDateKey || range.startDateKey,
            $lte: endDateKey || range.endDateKey,
          },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.normalizedName",
          name: { $first: "$items.name" },
          category: { $first: "$items.category" },
          unit: { $first: "$items.unit" },
          totalAmount: { $sum: "$items.lineTotal" },
          totalQuantity: { $sum: "$items.quantity" },
          purchaseCount: { $sum: 1 },
          avgUnitPrice: { $avg: "$items.unitPrice" },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          normalizedName: "$_id",
          name: 1,
          category: 1,
          unit: 1,
          totalAmount: 1,
          totalQuantity: 1,
          purchaseCount: 1,
          avgUnitPrice: { $round: ["$avgUnitPrice", 0] },
        },
      },
    ]);

    return topItems;
  }
}
