import { NextResponse } from "next/server";
import { CheckinService } from "@/services/checkin.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = Number(body.amount);

    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Số tiền mặc định không hợp lệ (phải >= 0)",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const updatedAmount = await CheckinService.updateDefaultAmount(amount);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: `Đã cập nhật mức điểm danh mặc định thành ${updatedAmount.toLocaleString("vi-VN")} ₫`,
      data: { defaultAmount: updatedAmount },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[POST /api/checkins/settings Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi cập nhật cấu hình điểm danh",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
