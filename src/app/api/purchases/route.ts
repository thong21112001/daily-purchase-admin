import { NextResponse } from "next/server";
import { PurchaseService } from "@/services/purchase.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const dateKey = searchParams.get("dateKey") || undefined;
    const startDateKey = searchParams.get("startDateKey") || undefined;
    const endDateKey = searchParams.get("endDateKey") || undefined;
    const query = searchParams.get("q") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

    const result = await PurchaseService.getPurchases({
      dateKey,
      startDateKey,
      endDateKey,
      query,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: result.purchases,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[GET /api/purchases Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi lấy danh sách phiếu mua hàng",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Phiếu mua hàng bắt buộc phải có ít nhất 1 mặt hàng",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const newPurchase = await PurchaseService.createPurchaseLog({
      purchaseDate: body.purchaseDate,
      supplier: body.supplier,
      paymentMethod: body.paymentMethod,
      items: body.items,
      note: body.note,
    });

    return NextResponse.json(
      {
        success: true,
        statusCode: 201,
        message: `Đã lưu phiếu mua hàng [${newPurchase.code}] thành công`,
        data: newPurchase,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/purchases Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi lưu phiếu mua hàng",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
