import { NextResponse } from "next/server";
import { ExportService } from "@/services/export.service";
import { getMonthKey } from "@/lib/utils/date";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const startDateKey = searchParams.get("startDateKey") || undefined;
    const endDateKey = searchParams.get("endDateKey") || undefined;
    const month = searchParams.get("month") || getMonthKey();

    const csvContent = await ExportService.generatePurchaseCSV(startDateKey, endDateKey);

    const filename = `so-nhap-hang-${startDateKey && endDateKey ? `${startDateKey}_den_${endDateKey}` : month}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("[GET /api/export/csv Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi xuất dữ liệu CSV",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
