import { NextResponse } from "next/server";
import { ExportService } from "@/services/export.service";
import { getMonthKey } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const dateKey = searchParams.get("dateKey") || undefined;
    const startDateKey = searchParams.get("startDateKey") || undefined;
    const endDateKey = searchParams.get("endDateKey") || undefined;
    const month = searchParams.get("month") || undefined;

    let start = startDateKey;
    let end = endDateKey;
    let filename = "";

    if (dateKey) {
      start = dateKey;
      end = dateKey;
      filename = `so-nhap-hang-ngay-${dateKey}.xlsx`;
    } else if (startDateKey && endDateKey) {
      start = startDateKey;
      end = endDateKey;
      filename = `so-nhap-hang-${startDateKey}_den_${endDateKey}.xlsx`;
    } else if (month) {
      start = `${month}-01`;
      end = `${month}-31`;
      filename = `so-nhap-hang-thang-${month}.xlsx`;
    } else {
      const currentMonth = getMonthKey();
      start = `${currentMonth}-01`;
      end = `${currentMonth}-31`;
      filename = `so-nhap-hang-thang-${currentMonth}.xlsx`;
    }

    const excelBuffer = await ExportService.generatePurchaseExcel(start, end);

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
