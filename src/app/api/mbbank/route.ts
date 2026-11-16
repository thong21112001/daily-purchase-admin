import { NextRequest, NextResponse } from "next/server";
import { MBBankService } from "@/services/mbbank.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Nếu hỏi thống kê Dashboard MB Bank
    if (searchParams.get("stats") === "true") {
      const stats = await MBBankService.getDashboardStats();
      return NextResponse.json({ success: true, data: stats });
    }

    // Lấy danh sách giao dịch
    const dateKey = searchParams.get("dateKey") || undefined;
    const startDateKey = searchParams.get("startDateKey") || undefined;
    const endDateKey = searchParams.get("endDateKey") || undefined;
    const type = (searchParams.get("type") as "IN" | "OUT") || undefined;
    const query = searchParams.get("query") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await MBBankService.getTransactions({
      dateKey,
      startDateKey,
      endDateKey,
      type,
      query,
      page,
      limit,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi khi lấy dữ liệu MB Bank" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let parsed;
    if (body.rawNotification) {
      // Giả lập từ text thông báo
      parsed = MBBankService.parseAndroidNotification(body.rawNotification);
    } else {
      // Nhập thủ công các trường
      const amount = Number(body.amount) || 0;
      if (amount <= 0) {
        return NextResponse.json(
          { success: false, message: "Số tiền phải lớn hơn 0" },
          { status: 400 }
        );
      }

      parsed = {
        transactionRef: body.transactionRef || `MB_MANUAL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        bankName: "MBBank",
        accountNumber: body.accountNumber || "",
        type: (body.type as "IN" | "OUT") || "IN",
        amount,
        balanceAfter: Number(body.balanceAfter) || 0,
        senderName: body.senderName || "",
        content: body.content || "Nạp tiền thủ công",
        transactionDate: body.transactionDate ? new Date(body.transactionDate) : new Date(),
        dateKey: body.dateKey || new Date().toISOString().slice(0, 10),
        rawNotification: body.rawNotification || "Tạo thủ công bởi chủ quán",
      };
    }

    const { transaction, isNew } = await MBBankService.saveTransaction(parsed, "MANUAL");

    return NextResponse.json({
      success: true,
      message: isNew ? "Đã ghi nhận giao dịch thành công" : "Giao dịch đã tồn tại",
      isNew,
      data: transaction,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi khi tạo giao dịch MB Bank" },
      { status: 500 }
    );
  }
}
