import { NextResponse } from "next/server";
import { CatalogService } from "@/services/catalog.service";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await CatalogService.updateCatalogItem(id, body);

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: "Không tìm thấy mặt hàng để cập nhật",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: `Đã cập nhật mặt hàng [${updated.name}] thành công`,
      data: updated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi cập nhật mặt hàng",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const deleted = await CatalogService.deleteCatalogItem(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: "Không tìm thấy mặt hàng để xóa",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Đã xóa mặt hàng khỏi danh mục thành công",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi xóa mặt hàng",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
