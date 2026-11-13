import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeVietnamese,
  matchesUnaccented,
  createVietnameseRegex,
} from "../../src/lib/utils/vietnamese-search.ts";

describe("Vietnamese Search & Normalization Tests", () => {
  test("normalizeVietnamese strips diacritics and special characters", () => {
    assert.equal(normalizeVietnamese("Cà phê Robusta Mộc"), "ca phe robusta moc");
    assert.equal(normalizeVietnamese("Đường mía hữu cơ"), "duong mia huu co");
    assert.equal(normalizeVietnamese("Thịt bò phi-lê (500g)!"), "thit bo phi le 500g");
    assert.equal(normalizeVietnamese("   RAU   CẢI   NGỌT   "), "rau cai ngot");
  });

  test("matchesUnaccented matches token-based queries regardless of accents", () => {
    const item = "Cà chua bi Đà Lạt";

    // Tìm kiếm không dấu
    assert.ok(matchesUnaccented(item, "ca chua"));
    assert.ok(matchesUnaccented(item, "da lat"));
    assert.ok(matchesUnaccented(item, "chua bi"));
    // Có dấu
    assert.ok(matchesUnaccented(item, "Đà Lạt"));

    // Không khớp
    assert.equal(matchesUnaccented(item, "thit bo"), false);
  });

  test("createVietnameseRegex creates case-insensitive regex for queries", () => {
    const regex = createVietnameseRegex("Thịt Bò");
    assert.ok(regex.test("thit bo xay"));
    assert.ok(!regex.test("thit ga"));
  });
});

