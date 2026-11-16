import { NextResponse } from "next/server";
import { ExportService } from "@/services/export.service";
import { getMonthKey } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const startDateKey = searchParams.get("startDateKey") || undefined;
    const endDateKey = searchParams.get("endDateKey") || undefined;
    const month = searchParams.get("month") || getMonthKey();

    const excelBuffer = await ExportService.generatePurchaseExcel(startDateKey, endDateKey, month);

    const filename = `so-nhap-hang-${
      startDateKey && endDateKey ? `${startDateKey}_den_${endDateKey}` : month
    }.xlsx`;

    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("[GET /api/export/excel Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi xuất tệp Excel .xlsx",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
