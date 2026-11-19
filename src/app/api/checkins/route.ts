import { NextResponse } from "next/server";
import { CheckinService } from "@/services/checkin.service";
import { getMonthKey } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || getMonthKey();

    const [checkins, stats] = await Promise.all([
      CheckinService.getMonthCheckins(month),
      CheckinService.getStats(month),
    ]);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: {
        month,
        checkins,
        stats,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GET /api/checkins Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi lấy dữ liệu điểm danh",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { dateKey, amount, note, isMakeup } = body;

    let result;
    if (dateKey && isMakeup) {
      result = await CheckinService.checkInMakeup(dateKey, amount, note);
    } else if (dateKey) {
      result = await CheckinService.checkInMakeup(dateKey, amount, note);
    } else {
      result = await CheckinService.checkInToday(amount, note);
    }

    return NextResponse.json({
      success: true,
      statusCode: result.isNew ? 201 : 200,
      message: result.isNew
        ? `Đã điểm danh ngày ${result.checkin.dateKey} thành công (+${result.checkin.amount.toLocaleString("vi-VN")} ₫)`
        : `Ngày ${result.checkin.dateKey} đã được điểm danh trước đó`,
      isNew: result.isNew,
      data: result.checkin,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[POST /api/checkins Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi thực hiện điểm danh",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
