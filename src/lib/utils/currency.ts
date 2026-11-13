/**
 * BỘ TIỆN ÍCH TÍNH TOÁN & ĐỊNH DẠNG TIỀN TỆ VNĐ (FINANCIAL UTILITIES)
 * Kế thừa từ tiêu chuẩn imenu-api-dev & imenu-menudientu-dev
 */

/**
 * Định dạng số tiền thành chuỗi VNĐ hiển thị chuẩn (Ví dụ: 150000 -> "150.000 ₫")
 */
export function formatVND(amount: number | null | undefined, includeSymbol: boolean = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? "0 ₫" : "0";
  }

  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString("vi-VN");

  return includeSymbol ? `${formatted} ₫` : formatted;
}

/**
 * Chuyển đổi chuỗi nhập liệu (có thể chứa dấu chấm hoặc phẩy) thành số nguyên VNĐ
 * Hỗ trợ: "150.000" -> 150000, "150,000 đ" -> 150000, "150k" -> 150000, "1.5tr" -> 1500000
 */
export function parseVND(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return 0;
  if (typeof input === "number") return isNaN(input) ? 0 : Math.round(input);

  const clean = input.trim().toLowerCase();
  if (!clean) return 0;

  // Hỗ trợ gõ tắt đơn vị triệu: 1.5tr, 1,5tr, 2tr, 2m
  if (clean.endsWith("tr") || clean.endsWith("m")) {
    const numPart = clean.replace(/tr|m/g, "").replace(/,/g, ".");
    const val = parseFloat(numPart);
    return isNaN(val) ? 0 : Math.round(val * 1000000);
  }

  // Hỗ trợ gõ tắt đơn vị nghìn: 150k, 1.5k
  if (clean.endsWith("k")) {
    const numPart = clean.replace(/k/g, "").replace(/,/g, ".");
    const val = parseFloat(numPart);
    return isNaN(val) ? 0 : Math.round(val * 1000);
  }

  // Loại bỏ tất cả ký tự không phải số (với chuỗi số thông thường có dấu chấm hàng nghìn như 150.000)
  const digitsOnly = clean.replace(/[^\d]/g, "");
  const result = parseInt(digitsOnly, 10);
  return isNaN(result) ? 0 : result;
}

/**
 * Tính thành tiền dòng hàng: Math.round(quantity * unitPrice)
 * Đảm bảo triệt tiêu hoàn toàn sai số số chấm động trong JS (floating-point precision)
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  if (quantity <= 0 || unitPrice <= 0) return 0;
  return Math.round(quantity * unitPrice);
}

/**
 * Tính ngược đơn giá khi đi chợ mua theo tổng tiền: lineTotal / quantity
 * Ví dụ mua 1.5kg hết 85.000đ -> Đơn giá = 85000 / 1.5 = 56.667 đ/kg
 */
export function reverseUnitPrice(quantity: number, lineTotal: number): number {
  if (quantity <= 0 || lineTotal <= 0) return 0;
  return Math.round(lineTotal / quantity);
}

/**
 * Sinh danh sách chip gợi ý tiền tệ thông minh khi gõ số (1 chạm trên Mobile)
 * Ví dụ gõ "45" -> gợi ý [45000, 450000]
 */
export function getQuickAmountSuggestions(input: string | number): number[] {
  const num = typeof input === "number" ? input : parseInt(input.replace(/[^\d]/g, ""), 10);
  if (isNaN(num) || num <= 0) return [10000, 20000, 50000, 100000];

  // Nếu số nhỏ hơn 1000 (Ví dụ gõ 15, 45, 120)
  if (num < 1000) {
    return [num * 1000, num * 10000].filter((val) => val <= 100000000);
  }

  return [];
}
