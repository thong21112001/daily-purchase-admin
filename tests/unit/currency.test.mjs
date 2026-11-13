import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Import modules to test (ESM compatible)
import {
  formatVND,
  parseVND,
  calculateLineTotal,
  reverseUnitPrice,
  getQuickAmountSuggestions,
} from "../../src/lib/utils/currency.ts";

describe("Financial Currency Utilities Tests", () => {
  test("formatVND formats numbers with dot separators and currency symbol", () => {
    assert.equal(formatVND(150000), "150.000 ₫");
    assert.equal(formatVND(0), "0 ₫");
    assert.equal(formatVND(null), "0 ₫");
    assert.equal(formatVND(undefined), "0 ₫");
    assert.equal(formatVND(1250000, false), "1.250.000");
  });

  test("parseVND parses formatted strings correctly", () => {
    assert.equal(parseVND("150.000"), 150000);
    assert.equal(parseVND("150,000 đ"), 150000);
    assert.equal(parseVND("150k"), 150000);
    assert.equal(parseVND("1.5tr"), 1500000);
    assert.equal(parseVND("2tr"), 2000000);
    assert.equal(parseVND(85000), 85000);
    assert.equal(parseVND(""), 0);
    assert.equal(parseVND(null), 0);
  });

  test("calculateLineTotal rounds correctly to integer VNĐ", () => {
    // 1.5 kg x 30,000 = 45,000
    assert.equal(calculateLineTotal(1.5, 30000), 45000);
    // 0.33 kg x 100,000 = 33,000
    assert.equal(calculateLineTotal(0.33, 100000), 33000);
    // Edge cases
    assert.equal(calculateLineTotal(0, 50000), 0);
    assert.equal(calculateLineTotal(-1, 50000), 0);
  });

  test("reverseUnitPrice computes unit price from lineTotal / quantity", () => {
    // Mua 1.5kg hết 85.000đ -> Đơn giá = 85000 / 1.5 = 56667
    assert.equal(reverseUnitPrice(1.5, 85000), 56667);
    // Mua 2 hộp hết 150.000đ -> Đơn giá = 75000
    assert.equal(reverseUnitPrice(2, 150000), 75000);
    // Edge cases
    assert.equal(reverseUnitPrice(0, 100000), 0);
  });

  test("getQuickAmountSuggestions generates 1-touch chips", () => {
    const chips45 = getQuickAmountSuggestions(45);
    assert.deepEqual(chips45, [45000, 450000]);

    const chips120 = getQuickAmountSuggestions("120");
    assert.deepEqual(chips120, [120000, 1200000]);
  });
});

