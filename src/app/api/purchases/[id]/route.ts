import { NextResponse } from "next/server";
import { PurchaseService } from "@/services/purchase.service";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const purchase = await PurchaseService.getPurchaseById(id);

    if (!purchase) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: "Không tìm thấy phiếu mua hàng yêu cầu",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: purchase,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi lấy chi tiết phiếu mua hàng",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await PurchaseService.updatePurchaseLog(id, body);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: "Không tìm thấy phiếu mua hàng để cập nhật",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: `Đã cập nhật phiếu [${updated.code}] thành công`,
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi cập nhật phiếu mua hàng",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const deleted = await PurchaseService.deletePurchaseLog(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: "Không tìm thấy phiếu mua hàng để xóa",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Đã xóa phiếu mua hàng thành công",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi xóa phiếu mua hàng",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
