import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateLineTotal, reverseUnitPrice, getQuickAmountSuggestions, formatVND } from "../../src/lib/utils/currency.ts";
import { matchesUnaccented } from "../../src/lib/utils/vietnamese-search.ts";
import { COFFEE_SHOP_STARTER_ITEMS } from "../../src/lib/constants/categories.ts";

describe("Phase 3 UI Logic & Workflow Verification", () => {
  test("1. Trải nghiệm Ghi lẻ từng món siêu tốc (Mode 1): Tính toán 2 chiều xuôi - ngược", () => {
    // Chiều xuôi: Số lượng + Đơn giá -> Thành tiền
    const qty = 1.5;
    const unitPrice = 65000;
    const total = calculateLineTotal(qty, unitPrice);
    assert.equal(total, 97500);

    // Chiều ngược: Đi chợ mua 1.5kg hết tròn 100.000đ -> Tự suy ra đơn giá/kg
    const reversePrice = reverseUnitPrice(qty, 100000);
    assert.equal(reversePrice, 66667);
  });

  test("2. Dãy Chip Mệnh Giá Cố Định & Động (Quick Cash Chips): Gợi ý tức thì", () => {
    // Khi gõ "45", hệ thống phải gợi ý 45.000đ và 450.000đ
    const suggestions = getQuickAmountSuggestions("45");
    assert.ok(suggestions.includes(45000), "Phải có gợi ý 45.000đ");
    assert.ok(suggestions.includes(450000), "Phải có gợi ý 450.000đ");

    // Dãy chip cố định phổ biến tại Việt Nam
    const fixedChips = [10000, 20000, 50000, 100000, 200000, 500000];
    for (const chip of fixedChips) {
      assert.ok(chip > 0, "Chip cố định phải là số tiền dương");
      assert.match(formatVND(chip), /₫/, "Định dạng chip phải có ký hiệu VNĐ");
    }
  });

  test("3. Chế độ Ghi theo hóa đơn/lần đi chợ (Mode 2): Cộng dồn thành tiền thời gian thực", () => {
    const receiptItems = [
      { name: "Cà phê Robusta Mộc", quantity: 2, unitPrice: 180000 },
      { name: "Sữa đặc Ngôi sao Phương Nam", quantity: 1, unitPrice: 690000 },
      { name: "Ly nhựa nắp cầu 500ml", quantity: 5, unitPrice: 38000 },
    ];

    const processedItems = receiptItems.map((item) => ({
      ...item,
      lineTotal: calculateLineTotal(item.quantity, item.unitPrice),
    }));

    const totalAmount = processedItems.reduce((sum, item) => sum + item.lineTotal, 0);

    assert.equal(processedItems[0].lineTotal, 360000);
    assert.equal(processedItems[1].lineTotal, 690000);
    assert.equal(processedItems[2].lineTotal, 190000);
    assert.equal(totalAmount, 1240000);
  });

  test("4. Auto-complete gợi ý 0.1s không dấu: Tìm kiếm chính xác danh mục F&B", () => {
    // Tìm "ca phe"
    const coffeeResults = COFFEE_SHOP_STARTER_ITEMS.filter((item) =>
      matchesUnaccented(item.name, "ca phe")
    );
    assert.ok(coffeeResults.length >= 2, "Phải tìm thấy ít nhất 2 mặt hàng cà phê");
    assert.ok(coffeeResults.some((i) => i.name.includes("Robusta")));

    // Tìm "sua"
    const milkResults = COFFEE_SHOP_STARTER_ITEMS.filter((item) =>
      matchesUnaccented(item.name, "sua")
    );
    assert.ok(milkResults.length >= 3, "Phải tìm thấy ít nhất 3 mặt hàng sữa");

    // Tìm "ly"
    const cupResults = COFFEE_SHOP_STARTER_ITEMS.filter((item) =>
      matchesUnaccented(item.name, "ly")
    );
    assert.ok(cupResults.length >= 1, "Phải tìm thấy ly nhựa");
  });
});
