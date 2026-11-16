import { NextRequest, NextResponse } from "next/server";
import { MBBankService } from "@/services/mbbank.service";

export const dynamic = "force-dynamic";

/**
 * WEBHOOK TIẾP NHẬN BIẾN ĐỘNG SỐ DƯ MB BANK
 * Hỗ trợ:
 * 1. Android Notification Forwarder / Tasker / MacroDroid (raw notification text hoặc JSON)
 * 2. Cổng Webhook tự động SePay / Casso (JSON)
 */

function verifySecret(request: NextRequest): boolean {
  const secretEnv = process.env.MBBANK_WEBHOOK_SECRET;
  if (!secretEnv || !secretEnv.trim()) {
    // Nếu chưa cấu hình secret thì cho phép để hỗ trợ test nhanh ở môi trường dev
    return true;
  }

  // 1. Kiểm tra header Authorization: Bearer <secret>
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ") && authHeader.slice(7).trim() === secretEnv) {
    return true;
  }

  // 2. Kiểm tra header X-Secret
  const xSecret = request.headers.get("x-secret") || request.headers.get("x-api-key");
  if (xSecret && xSecret.trim() === secretEnv) {
    return true;
  }

  // 3. Kiểm tra query param ?secret=...
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  if (querySecret && querySecret.trim() === secretEnv) {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized webhook secret" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "MB Bank Webhook listener is running",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  if (!verifySecret(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized webhook secret" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let parsedData;
    let source: "SEPAY_WEBHOOK" | "ANDROID_FORWARDER" | "MANUAL" = "ANDROID_FORWARDER";

    if (contentType.includes("application/json")) {
      const json = await request.json();

      // Kiểm tra xem là JSON SePay/Casso hay JSON của Android Notification Forwarder
      if (
        json.transferAmount !== undefined ||
        json.referenceCode !== undefined ||
        json.accumulated !== undefined ||
        (json.gateway && String(json.gateway).toLowerCase().includes("mb")) ||
        (json.bankName && String(json.bankName).toLowerCase().includes("mb"))
      ) {
        // SePay / Casso Webhook
        source = "SEPAY_WEBHOOK";
        parsedData = MBBankService.parseSepayWebhook(json);
      } else {
        // Android Forwarder gửi JSON dạng { title, text / message / content }
        source = "ANDROID_FORWARDER";
        const rawText = json.text || json.message || json.content || json.body || JSON.stringify(json);
        parsedData = MBBankService.parseAndroidNotification(rawText);
      }
    } else {
      // Plain text hoặc urlencoded
      const text = await request.text();
      source = "ANDROID_FORWARDER";
      parsedData = MBBankService.parseAndroidNotification(text);
    }

    if (!parsedData || !parsedData.amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Không trích xuất được số tiền hợp lệ từ thông báo",
          parsed: parsedData,
        },
        { status: 400 }
      );
    }

    const { transaction, isNew } = await MBBankService.saveTransaction(parsedData, source);

    return NextResponse.json({
      success: true,
      message: isNew ? "Đã ghi nhận biến động số dư mới" : "Giao dịch đã tồn tại (bỏ qua trùng lặp)",
      isNew,
      data: transaction,
    });
  } catch (error: any) {
    console.error("Lỗi xử lý Webhook MBBank:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Lỗi nội bộ khi lưu biến động số dư: " + (error?.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}
