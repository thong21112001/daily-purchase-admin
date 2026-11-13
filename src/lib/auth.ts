import crypto from "node:crypto";

/**
 * HỆ THỐNG XÁC THỰC SINGLE-OWNER ("CHỈ MÌNH TÔI DÙNG")
 * Sử dụng Web Crypto & Node Crypto nguyên bản (Zero-Dependency & Zero Cold-Start)
 * Tuân thủ nghiêm ngặt Secret Zero Policy (Hard Lock #3)
 */

export const AUTH_COOKIE_NAME = "daily_purchase_auth_session";
export const SESSION_MAX_AGE_SECONDS = 90 * 24 * 60 * 60; // 90 ngày

export interface OwnerTokenPayload {
  username: string;
  role: "OWNER";
  exp: number;
}

/**
 * Lấy JWT Secret từ biến môi trường
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "[Security Error] Biến môi trường JWT_SECRET chưa được cấu hình. Không thể ký/xác minh phiên đăng nhập."
    );
  }
  return secret;
}

/**
 * Ký mã JWT Token cho Owner bằng HMAC-SHA256 (Zero-Dependency)
 */
export function signOwnerToken(username: string): string {
  const secret = getJwtSecret();
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = Buffer.from(JSON.stringify({ username, role: "OWNER", exp })).toString("base64url");

  const data = `${header}.${payload}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");

  return `${data}.${signature}`;
}

/**
 * Xác minh mã JWT Token bằng timingSafeEqual chống timing attacks
 */
export function verifyOwnerToken(token: string): OwnerTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const secret = getJwtSecret();

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as OwnerTokenPayload;

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token hết hạn
    }

    if (decoded.role !== "OWNER") {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Kiểm tra thông tin đăng nhập của Owner
 * Sử dụng so sánh timingSafe chống tấn công timing
 */
export async function verifyOwnerCredentials(passwordOrPin: string): Promise<boolean> {
  const expectedPassword = process.env.OWNER_PASSWORD;

  if (!expectedPassword) {
    throw new Error(
      "[Security Error] Biến môi trường OWNER_PASSWORD chưa được cấu hình. Vui lòng thiết lập trong .env.local."
    );
  }

  const cleanInput = passwordOrPin.trim();
  const bufA = Buffer.from(cleanInput);
  const bufB = Buffer.from(expectedPassword);

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Thiết lập HttpOnly Cookie cho phiên đăng nhập Owner (Dùng trong Next.js Route Handlers)
 */
export async function setOwnerSessionCookie(token: string): Promise<void> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Xóa HttpOnly Cookie khi đăng xuất
 */
export async function clearOwnerSessionCookie(): Promise<void> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Lấy phiên đăng nhập hiện tại từ Cookies
 */
export async function getCurrentOwnerSession(): Promise<OwnerTokenPayload | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return null;
    return verifyOwnerToken(token);
  } catch {
    return null;
  }
}
