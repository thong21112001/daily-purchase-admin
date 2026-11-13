/**
 * BỘ TIỆN ÍCH TÌM KIẾM & CHUẨN HÓA TIẾNG VIỆT KHÔNG DẤU (VIETNAMESE SEARCH)
 * Kế thừa từ imenu-api-dev (Phase 4 Menu search regex không dấu)
 */

/**
 * Chuẩn hóa chuỗi tiếng Việt thành không dấu, viết thường, cắt khoảng trắng thừa
 * Ví dụ: "Cà phê Robusta Mộc" -> "ca phe robusta moc"
 *        "Thịt bò xay (500g)"  -> "thit bo xay 500g"
 */
export function normalizeVietnamese(str: string | null | undefined): string {
  if (!str) return "";

  let text = str.trim().toLowerCase();

  // Chuẩn hóa Unicode tổ hợp sang dựng sẵn
  text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Thay thế ký tự đ/Đ
  text = text.replace(/đ/g, "d").replace(/Đ/g, "d");

  // Loại bỏ các ký tự đặc biệt ngoài chữ cái, số và khoảng trắng
  text = text.replace(/[^a-z0-9\s]/g, " ");

  // Rút gọn nhiều khoảng trắng thành 1
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Kiểm tra xem chuỗi đích (target) có chứa từ khóa tìm kiếm (query) không dấu hay không
 * Ví dụ: matchesUnaccented("Thịt bò phi lê", "bo") -> true
 *        matchesUnaccented("Cà chua đà lạt", "chua da") -> true
 */
export function matchesUnaccented(target: string | null | undefined, query: string | null | undefined): boolean {
  if (!target || !query) return false;

  const normTarget = normalizeVietnamese(target);
  const normQuery = normalizeVietnamese(query);

  if (!normQuery) return true;

  // Hỗ trợ tìm kiếm theo từng từ khóa rời rạc (Token match)
  const queryTokens = normQuery.split(" ").filter(Boolean);
  return queryTokens.every((token) => normTarget.includes(token));
}

/**
 * Tạo RegExp tìm kiếm linh hoạt cho MongoDB Mongoose
 * Cho phép tìm kiếm cả có dấu lẫn không dấu
 */
export function createVietnameseRegex(query: string): RegExp {
  const norm = normalizeVietnamese(query);
  const escaped = norm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped, "i");
}

