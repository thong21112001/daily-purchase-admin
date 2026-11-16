import { NextResponse } from "next/server";
import { SupplierService } from "@/services/supplier.service";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await SupplierService.updateSupplier(id, body);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: "Không tìm thấy nơi mua để cập nhật",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: `Đã cập nhật nơi mua [${updated.name}] thành công`,
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi cập nhật nơi mua",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const deleted = await SupplierService.deleteSupplier(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: "Không tìm thấy nơi mua để xóa",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Đã xóa nơi mua thành công",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi xóa nơi mua",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
