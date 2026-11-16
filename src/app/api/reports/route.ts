import { NextResponse } from "next/server";
import { ReportService } from "@/services/report.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const monthKey = searchParams.get("month") || undefined;
    const startDateKey = searchParams.get("startDateKey") || undefined;
    const endDateKey = searchParams.get("endDateKey") || undefined;

    const [kpis, dailySpending, categoryBreakdown, topItems] = await Promise.all([
      ReportService.getDashboardKPIs(monthKey),
      ReportService.getDailySpending(monthKey),
      ReportService.getCategoryBreakdown(startDateKey, endDateKey, monthKey),
      ReportService.getTopSpendingItems(startDateKey, endDateKey, 10, monthKey),
    ]);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: {
        kpis,
        dailySpending: dailySpending.days,
        monthKey: dailySpending.monthKey,
        categoryBreakdown: categoryBreakdown.categories,
        grandTotal: categoryBreakdown.grandTotal,
        topItems,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GET /api/reports Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi tổng hợp báo cáo chi tiêu",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
