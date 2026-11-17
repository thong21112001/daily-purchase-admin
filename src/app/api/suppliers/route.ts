import { NextResponse } from "next/server";
import { SupplierService } from "@/services/supplier.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Chế độ tìm kiếm gợi ý tức thì (Auto-Complete Suggestions)
    if (searchParams.has("q")) {
      const q = searchParams.get("q") || "";
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;
      const suggestions = await SupplierService.searchSuppliers(q, limit);

      return NextResponse.json({
        success: true,
        statusCode: 200,
        data: suggestions,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Chế độ phân trang đầy đủ (hỗ trợ cả tìm kiếm query và lọc category)
    const query = searchParams.get("query") || searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 100;

    const result = await SupplierService.getSuppliers({ category, query, page, limit });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: result.suppliers,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GET /api/suppliers Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi lấy danh sách nơi mua",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Tên nơi mua không được để trống",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const supplier = await SupplierService.upsertSupplier(
      body.name,
      body.category || "Chợ",
      body.note || ""
    );

    return NextResponse.json(
      {
        success: true,
        statusCode: 201,
        message: `Đã lưu nơi mua [${supplier?.name}] thành công`,
        data: supplier,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/suppliers Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi tạo nơi mua",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
