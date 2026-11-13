import { NextResponse } from "next/server";
import { signOwnerToken, setOwnerSessionCookie, verifyOwnerCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const expectedUsername = process.env.OWNER_USERNAME || "admin";

    // Kiểm tra tên đăng nhập (nếu có gửi)
    if (username && username.trim() !== expectedUsername) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "Tên đăng nhập hoặc mật khẩu không chính xác",
        },
        { status: 401 }
      );
    }

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Vui lòng nhập mật khẩu hoặc mã PIN quản trị",
        },
        { status: 400 }
      );
    }

    // Xác thực mật khẩu hoặc mã PIN
    const isPasswordValid = await verifyOwnerCredentials(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "Mật khẩu hoặc mã PIN không chính xác",
        },
        { status: 401 }
      );
    }

    // Ký JWT Token và lưu vào HttpOnly Cookie
    const token = signOwnerToken(expectedUsername);
    await setOwnerSessionCookie(token);

    return NextResponse.json({
      success: true,
      statusCode: 200,
      message: "Đăng nhập thành công",
      data: {
        username: expectedUsername,
        role: "OWNER",
      },
    });
  } catch (error: any) {
    console.error("[Login API Error]", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error.message || "Đã xảy ra lỗi máy chủ trong quá trình xác thực",
      },
      { status: 500 }
    );
  }
}

