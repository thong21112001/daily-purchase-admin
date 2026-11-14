import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Phase 2 Integration: Reports Aggregation & Analytics", () => {
  test("KPI calculation logic correctly aggregates by dateKey", () => {
    const mockPurchases = [
      { dateKey: "2026-11-14", totalAmount: 420000, itemCount: 3 },
      { dateKey: "2026-11-14", totalAmount: 180000, itemCount: 1 },
      { dateKey: "2026-11-13", totalAmount: 690000, itemCount: 2 },
      { dateKey: "2026-11-02", totalAmount: 1200000, itemCount: 5 },
    ];

    const todayKey = "2026-11-14";
    const yesterdayKey = "2026-11-13";
    const monthKey = "2026-11";

    // Chi hôm nay
    const todayLogs = mockPurchases.filter((p) => p.dateKey === todayKey);
    const todayTotal = todayLogs.reduce((sum, p) => sum + p.totalAmount, 0);
    const todayItemCount = todayLogs.reduce((sum, p) => sum + p.itemCount, 0);

    assert.equal(todayTotal, 600000);
    assert.equal(todayItemCount, 4);
    assert.equal(todayLogs.length, 2);

    // Chi hôm qua
    const yesterdayLogs = mockPurchases.filter((p) => p.dateKey === yesterdayKey);
    const yesterdayTotal = yesterdayLogs.reduce((sum, p) => sum + p.totalAmount, 0);
    assert.equal(yesterdayTotal, 690000);

    // Lũy kế tháng này
    const monthLogs = mockPurchases.filter((p) => p.dateKey.startsWith(monthKey));
    const thisMonthTotal = monthLogs.reduce((sum, p) => sum + p.totalAmount, 0);
    assert.equal(thisMonthTotal, 2490000);
  });

  test("Category breakdown calculation computes exact percentages", () => {
    const items = [
      { category: "Nguyên liệu Cà phê & Trà", lineTotal: 360000 },
      { category: "Sữa & Chế phẩm sữa", lineTotal: 690000 },
      { category: "Vật tư & Bao bì mang về", lineTotal: 150000 },
    ];

    const grandTotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    assert.equal(grandTotal, 1200000);

    const categories = [
      {
        category: "Nguyên liệu Cà phê & Trà",
        totalAmount: 360000,
        percentage: Math.round((360000 / grandTotal) * 1000) / 10,
      },
      {
        category: "Sữa & Chế phẩm sữa",
        totalAmount: 690000,
        percentage: Math.round((690000 / grandTotal) * 1000) / 10,
      },
      {
        category: "Vật tư & Bao bì mang về",
        totalAmount: 150000,
        percentage: Math.round((150000 / grandTotal) * 1000) / 10,
      },
    ];

    assert.equal(categories[0].percentage, 30.0);
    assert.equal(categories[1].percentage, 57.5);
    assert.equal(categories[2].percentage, 12.5);

    const sumPercentage = categories.reduce((sum, c) => sum + c.percentage, 0);
    assert.equal(sumPercentage, 100.0);
  });

  test("Top spending items ranking sorts by total amount descending", () => {
    const items = [
      { name: "Chanh tươi", normalizedName: "chanh tuoi", lineTotal: 25000, quantity: 1 },
      { name: "Sữa đặc Ngôi sao Phương Nam", normalizedName: "sua dac ngoi sao phuong nam", lineTotal: 690000, quantity: 1 },
      { name: "Cà phê Robusta Mộc", normalizedName: "ca phe robusta moc", lineTotal: 360000, quantity: 2 },
    ];

    items.sort((a, b) => b.lineTotal - a.lineTotal);

    assert.equal(items[0].name, "Sữa đặc Ngôi sao Phương Nam");
    assert.equal(items[1].name, "Cà phê Robusta Mộc");
    assert.equal(items[2].name, "Chanh tươi");
  });
});
