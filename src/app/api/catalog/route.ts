import { NextResponse } from "next/server";
import { CatalogService } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Lấy danh sách toàn bộ đơn vị tính (phổ biến + người dùng từng tạo)
    if (searchParams.get("units") === "true") {
      const units = await CatalogService.getAvailableUnits();
      return NextResponse.json({
        success: true,
        statusCode: 200,
        data: units,
        timestamp: new Date().toISOString(),
      });
    }

    // Kích hoạt seed danh mục mẫu cà phê nếu được yêu cầu
    if (searchParams.get("seed") === "true") {
      const count = await CatalogService.seedStarterItemsIfEmpty();
      return NextResponse.json({
        success: true,
        statusCode: 200,
        message: `Đã khởi tạo ${count} mặt hàng mẫu cà phê & đồ uống thành công`,
        timestamp: new Date().toISOString(),
      });
    }

    const query = searchParams.get("q");

    // 1. Chế độ tìm kiếm gợi ý tức thì (Auto-Complete Suggestions)
    if (query !== null) {
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;
      const suggestions = await CatalogService.searchCatalogItems(query, limit);

      return NextResponse.json({
        success: true,
        statusCode: 200,
        data: suggestions,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Chế độ lấy danh sách toàn bộ danh mục mặt hàng có phân trang
    const category = searchParams.get("category") || undefined;
    const sort = (searchParams.get("sort") as any) || "usage";
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

    const result = await CatalogService.getCatalogItems({ category, sort, page, limit });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: result.items,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GET /api/catalog Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi lấy danh mục mặt hàng",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name?.trim() || !body.defaultUnit?.trim()) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Tên mặt hàng và đơn vị tính bắt buộc không được để trống",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const item = await CatalogService.createCatalogItem({
      name: body.name,
      category: body.category,
      defaultUnit: body.defaultUnit,
      lastUnitPrice: body.lastUnitPrice,
    });

    return NextResponse.json(
      {
        success: true,
        statusCode: 201,
        message: `Đã thêm mặt hàng [${item.name}] vào danh mục thành công`,
        data: item,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/catalog Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi tạo mặt hàng",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
