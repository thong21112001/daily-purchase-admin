import { NextResponse } from "next/server";
import { CheckinService } from "@/services/checkin.service";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ dateKey: string }> }) {
  try {
    const { dateKey } = await context.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Định dạng dateKey không hợp lệ (yêu cầu YYYY-MM-DD)",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = await CheckinService.updateCheckin(dateKey, body.amount, body.note);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: `Không tìm thấy bản ghi điểm danh cho ngày ${dateKey}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: `Đã cập nhật điểm danh ngày ${dateKey}`,
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[PATCH /api/checkins/[dateKey] Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi cập nhật điểm danh",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ dateKey: string }> }) {
  try {
    const { dateKey } = await context.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Định dạng dateKey không hợp lệ (yêu cầu YYYY-MM-DD)",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const deleted = await CheckinService.deleteCheckin(dateKey);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: `Không tìm thấy bản ghi điểm danh ngày ${dateKey} để hủy`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: `Đã hủy điểm danh ngày ${dateKey}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[DELETE /api/checkins/[dateKey] Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi hủy điểm danh",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
