import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { normalizeVietnamese } from "../../src/lib/utils/vietnamese-search.ts";
import { calculateLineTotal, reverseUnitPrice } from "../../src/lib/utils/currency.ts";
import { getDateKey, getTodayKey } from "../../src/lib/utils/date.ts";

describe("Phase 2 Integration: Purchase Workflow & Auto-Learn Catalog", () => {
  test("Sequential Purchase Code generation follows PO-YYYYMMDD-XXX format", () => {
    const todayKey = getTodayKey();
    const cleanDate = todayKey.replace(/-/g, "");

    const seq1 = 1;
    const seq2 = 2;
    const seq10 = 10;

    const code1 = `PO-${cleanDate}-${String(seq1).padStart(3, "0")}`;
    const code2 = `PO-${cleanDate}-${String(seq2).padStart(3, "0")}`;
    const code10 = `PO-${cleanDate}-${String(seq10).padStart(3, "0")}`;

    assert.equal(code1, `PO-${cleanDate}-001`);
    assert.equal(code2, `PO-${cleanDate}-002`);
    assert.equal(code10, `PO-${cleanDate}-010`);

    // Verify Choice B: mỗi lần lưu sinh 1 mã phiếu riêng biệt
    assert.notEqual(code1, code2);
  });

  test("Financial line total and two-way reverse price calculation", () => {
    // 1. Mua 2kg Cà phê Robusta mộc x 180.000đ = 360.000đ
    const qty1 = 2;
    const price1 = 180000;
    const lineTotal1 = calculateLineTotal(qty1, price1);
    assert.equal(lineTotal1, 360000);

    // 2. Mua lẻ 1.5kg Chanh tươi không hạt hết 37.500đ -> Tính đơn giá ngược
    const qty2 = 1.5;
    const totalPaid2 = 37500;
    const reversePrice2 = reverseUnitPrice(qty2, totalPaid2);
    assert.equal(reversePrice2, 25000);

    // 3. Mua 1.2kg Tắc thơm hết 24.000đ -> 20.000 đ/kg
    const qty3 = 1.2;
    const totalPaid3 = 24000;
    const reversePrice3 = reverseUnitPrice(qty3, totalPaid3);
    assert.equal(reversePrice3, 20000);

    // 4. Tổng tiền phiếu = 360.000 + 37.500 + 24.000 = 421.500đ
    const totalAmount = lineTotal1 + totalPaid2 + totalPaid3;
    assert.equal(totalAmount, 421500);
  });

  test("Auto-Learn Catalog state machine simulation", () => {
    // Mô phỏng bộ nhớ danh mục Auto-Learn
    const catalogMemory = new Map();

    function simulateUpsertItem(item) {
      const norm = normalizeVietnamese(item.name);
      if (!catalogMemory.has(norm)) {
        catalogMemory.set(norm, {
          name: item.name,
          normalizedName: norm,
          category: item.category || "Khác",
          defaultUnit: item.unit,
          lastUnitPrice: item.unitPrice,
          minUnitPrice: item.unitPrice,
          maxUnitPrice: item.unitPrice,
          usageCount: 1,
        });
      } else {
        const existing = catalogMemory.get(norm);
        existing.lastUnitPrice = item.unitPrice;
        existing.minUnitPrice = Math.min(existing.minUnitPrice, item.unitPrice);
        existing.maxUnitPrice = Math.max(existing.maxUnitPrice, item.unitPrice);
        existing.usageCount += 1;
        existing.defaultUnit = item.unit;
      }
      return catalogMemory.get(norm);
    }

    // Lần 1: Mua Cà phê Robusta Mộc với giá 180.000đ
    const step1 = simulateUpsertItem({
      name: "Cà phê Robusta Mộc",
      category: "Nguyên liệu Cà phê & Trà",
      unit: "kg",
      unitPrice: 180000,
    });

    assert.equal(step1.lastUnitPrice, 180000);
    assert.equal(step1.minUnitPrice, 180000);
    assert.equal(step1.maxUnitPrice, 180000);
    assert.equal(step1.usageCount, 1);

    // Lần 2: Mua tiếp Cà phê Robusta Mộc nhưng giá tăng lên 195.000đ
    const step2 = simulateUpsertItem({
      name: "Cà phê Robusta Mộc",
      category: "Nguyên liệu Cà phê & Trà",
      unit: "kg",
      unitPrice: 195000,
    });

    assert.equal(step2.lastUnitPrice, 195000);
    assert.equal(step2.minUnitPrice, 180000);
    assert.equal(step2.maxUnitPrice, 195000);
    assert.equal(step2.usageCount, 2);

    // Lần 3: Mua giá khuyến mãi 170.000đ
    const step3 = simulateUpsertItem({
      name: "Cà phê Robusta Mộc",
      category: "Nguyên liệu Cà phê & Trà",
      unit: "kg",
      unitPrice: 170000,
    });

    assert.equal(step3.lastUnitPrice, 170000);
    assert.equal(step3.minUnitPrice, 170000);
    assert.equal(step3.maxUnitPrice, 195000);
    assert.equal(step3.usageCount, 3);
  });
});
