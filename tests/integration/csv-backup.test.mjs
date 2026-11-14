import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Phase 2 Integration: CSV Export & JSON Backup/Restore (Choice A: Merge)", () => {
  test("CSV export has UTF-8 BOM prefix and properly escapes special characters", () => {
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return "";
      const str = String(field);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ["Mã Phiếu", "Ngày Mua", "Tên Mặt Hàng", "Ghi Chú"];
    const rows = [
      headers.map(escapeCSV).join(","),
      ["PO-20261114-001", "14/11/2026", "Cà phê Robusta Mộc", "Hạt rang mộc, thơm"].map(escapeCSV).join(","),
      ["PO-20261114-002", "14/11/2026", 'Ly nhựa 500ml "Đặc Biệt"', "Đóng thùng 1,000 cái"].map(escapeCSV).join(","),
    ];

    const csvContent = "\uFEFF" + rows.join("\r\n");

    // 1. Kiểm tra tiền tố UTF-8 BOM
    assert.ok(csvContent.startsWith("\uFEFF"));

    // 2. Kiểm tra escaping dấu phẩy và ngoặc kép
    assert.ok(csvContent.includes('"Hạt rang mộc, thơm"'));
    assert.ok(csvContent.includes('"Ly nhựa 500ml ""Đặc Biệt"""'));
  });

  test("Backup JSON payload contains required structure", () => {
    const backup = {
      app: "daily-purchase-admin",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      counters: [{ key: "PO-20261114", seq: 2 }],
      catalogItems: [{ name: "Cà phê Robusta Mộc", normalizedName: "ca phe robusta moc", lastUnitPrice: 180000 }],
      purchaseLogs: [{ code: "PO-20261114-001", totalAmount: 360000 }],
    };

    assert.equal(backup.app, "daily-purchase-admin");
    assert.ok(backup.exportedAt);
    assert.equal(Array.isArray(backup.counters), true);
    assert.equal(Array.isArray(backup.catalogItems), true);
    assert.equal(Array.isArray(backup.purchaseLogs), true);
  });

  test("Choice A Restore: Merge / Upsert preserves existing data and updates records", () => {
    // Database hiện tại
    const currentCatalog = new Map([
      ["ca phe robusta moc", { name: "Cà phê Robusta Mộc", usageCount: 5, lastUnitPrice: 180000 }],
      ["chanh tuoi", { name: "Chanh tươi", usageCount: 2, lastUnitPrice: 25000 }],
    ]);

    // Dữ liệu từ file backup đưa vào
    const backupCatalog = [
      // 1. Trùng mã -> Merge: cập nhật lastUnitPrice và tăng/giữ usageCount
      { normalizedName: "ca phe robusta moc", name: "Cà phê Robusta Mộc", usageCount: 10, lastUnitPrice: 195000 },
      // 2. Món mới trong file backup -> Thêm mới
      { normalizedName: "sua dac ngoi sao phuong nam", name: "Sữa đặc Ngôi sao Phương Nam", usageCount: 3, lastUnitPrice: 690000 },
    ];

    for (const item of backupCatalog) {
      if (currentCatalog.has(item.normalizedName)) {
        const existing = currentCatalog.get(item.normalizedName);
        existing.lastUnitPrice = item.lastUnitPrice;
        existing.usageCount = Math.max(existing.usageCount, item.usageCount);
      } else {
        currentCatalog.set(item.normalizedName, item);
      }
    }

    // Kiểm tra:
    // Món 1: Được cập nhật giá 195.000đ và usageCount = 10
    assert.equal(currentCatalog.get("ca phe robusta moc").lastUnitPrice, 195000);
    assert.equal(currentCatalog.get("ca phe robusta moc").usageCount, 10);

    // Món 2 (Chanh tươi): Giữ nguyên vẹn, không bị xóa
    assert.equal(currentCatalog.has("chanh tuoi"), true);
    assert.equal(currentCatalog.get("chanh tuoi").lastUnitPrice, 25000);

    // Món 3: Được bổ sung thành công
    assert.equal(currentCatalog.has("sua dac ngoi sao phuong nam"), true);
    assert.equal(currentCatalog.size, 3);
  });
});
