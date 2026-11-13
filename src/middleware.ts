import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "daily_purchase_auth_session";

/**
 * XÁC MINH JWT BẰNG WEB CRYPTO API (EDGE RUNTIME COMPATIBLE)
 * Không phụ thuộc thư viện bên ngoài, chạy mượt mà 0ms trên Vercel Edge
 */
async function verifyJwtEdge(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Kiểm tra thời hạn hết hạn từ payload trước
    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false; // Token đã hết hạn
    }

    if (payload.role !== "OWNER") {
      return false;
    }

    // 2. Xác minh chữ ký số HMAC-SHA256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const dataToVerify = encoder.encode(`${headerB64}.${payloadB64}`);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = Buffer.from(signatureB64, "base64url");

    return await crypto.subtle.verify("HMAC", cryptoKey, signatureBytes, dataToVerify);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bỏ qua các tệp tĩnh và manifest PWA
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json"
  ) {
    return NextResponse.next();
  }

  // 2. Bỏ qua endpoint đăng nhập và kiểm tra health
  if (pathname === "/login" || pathname === "/api/auth/login" || pathname === "/api/health") {
    return NextResponse.next();
  }

  // 3. Đọc cookie phiên
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  let isValid = false;
  if (token && secret) {
    isValid = await verifyJwtEdge(token, secret);
  }

  // 4. Nếu chưa đăng nhập hoặc token không hợp lệ
  if (!isValid) {
    // Nếu là request API -> trả về JSON 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Nếu là trang web -> chuyển hướng về /login
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Nếu đã đăng nhập mà vẫn cố truy cập /login -> chuyển hướng về trang chủ /
  if (pathname === "/login" && isValid) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Khớp toàn bộ các route ngoại trừ các tệp tĩnh cụ thể
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

