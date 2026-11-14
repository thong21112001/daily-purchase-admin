import { NextResponse } from "next/server";
import { ExportService } from "@/services/export.service";

export async function GET() {
  try {
    const backup = await ExportService.generateBackupJSON();
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `daily-purchase-backup-${dateStr}.json`;

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("[GET /api/export/backup Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi sao lưu dữ liệu JSON",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || body.app !== "daily-purchase-admin") {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Tệp sao lưu không hợp lệ hoặc không thuộc hệ thống daily-purchase-admin",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const result = await ExportService.restoreFromBackupJSON(body);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: result,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[POST /api/export/backup Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi khôi phục dữ liệu từ tệp sao lưu",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
