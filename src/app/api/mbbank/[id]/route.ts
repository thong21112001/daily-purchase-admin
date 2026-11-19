import { NextRequest, NextResponse } from "next/server";
import { MBBankService } from "@/services/mbbank.service";
import { isValidObjectId } from "@/lib/utils/validation";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, statusCode: 400, message: "ID giao dịch không hợp lệ" },
        { status: 400 }
      );
    }
    const deleted = await MBBankService.deleteTransaction(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy giao dịch để xóa" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa giao dịch thành công",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi khi xóa giao dịch" },
      { status: 500 }
    );
  }
}
