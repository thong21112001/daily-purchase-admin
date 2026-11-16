import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { normalizeVietnamese } from "../../src/lib/utils/vietnamese-search.ts";
import { COMMON_UNITS } from "../../src/lib/constants/categories.ts";

describe("Phase 3 & 4 Integration: Auto-Learn Suppliers & Custom Units", () => {
  test("1. Supplier normalized name correctly strips accents and creates unique key", () => {
    const rawName1 = "Chợ Đầu Mối Hòa Cường";
    const rawName2 = "  cho dau moi hoa cuong  ";

    const norm1 = normalizeVietnamese(rawName1);
    const norm2 = normalizeVietnamese(rawName2);

    assert.equal(norm1, "cho dau moi hoa cuong");
    assert.equal(norm2, "cho dau moi hoa cuong");
    assert.equal(norm1, norm2, "Both variations must resolve to the identical normalized key");
  });

  test("2. Supplier usageCount and lastUsedAt state machine simulation", () => {
    // Giả lập logic upsertSupplier
    const suppliersDB = new Map();

    function mockUpsertSupplier(name, category = "Chợ") {
      const trimmed = name.trim();
      const norm = normalizeVietnamese(trimmed);

      if (suppliersDB.has(norm)) {
        const existing = suppliersDB.get(norm);
        existing.usageCount += 1;
        existing.lastUsedAt = new Date();
        return { supplier: existing, isNew: false };
      }

      const newSup = {
        name: trimmed,
        normalizedName: norm,
        category,
        usageCount: 1,
        lastUsedAt: new Date(),
      };
      suppliersDB.set(norm, newSup);
      return { supplier: newSup, isNew: true };
    }

    // Lần 1: Tạo mới
    const res1 = mockUpsertSupplier("Bách Hóa Xanh");
    assert.equal(res1.isNew, true);
    assert.equal(res1.supplier.usageCount, 1);

    // Lần 2: Tăng usageCount lên 2
    const res2 = mockUpsertSupplier("bách hóa xanh");
    assert.equal(res2.isNew, false);
    assert.equal(res2.supplier.usageCount, 2);

    // Lần 3: Tăng usageCount lên 3
    const res3 = mockUpsertSupplier("  BÁCH HÓA XANH  ");
    assert.equal(res3.isNew, false);
    assert.equal(res3.supplier.usageCount, 3);
  });

  test("3. Custom Units merged with COMMON_UNITS preserves defaults and adds novel units", () => {
    const recordedUnitsInDb = ["kg", "hộp", "thùng", "khay", "vỉ", "chục"];

    const unitSet = new Set(COMMON_UNITS);
    for (const u of recordedUnitsInDb) {
      if (u && typeof u === "string" && u.trim()) {
        unitSet.add(u.trim().toLowerCase());
      }
    }

    const merged = Array.from(unitSet);

    // Bắt buộc có các đơn vị chuẩn
    assert.ok(merged.includes("kg"));
    assert.ok(merged.includes("g"));
    assert.ok(merged.includes("lít"));

    // Bắt buộc tích hợp các đơn vị tự nhập mới
    assert.ok(merged.includes("khay"));
    assert.ok(merged.includes("vỉ"));
    assert.ok(merged.includes("chục"));
    assert.ok(merged.length > COMMON_UNITS.length);
  });
});
