import { NextResponse } from "next/server";
import { clearOwnerSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearOwnerSessionCookie();
    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Đã đăng xuất phiên làm việc an toàn",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Lỗi khi đăng xuất",
      },
      { status: 500 }
    );
  }
}

