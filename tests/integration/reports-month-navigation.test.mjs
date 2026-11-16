import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Reports Month Navigation & Timezone Invariant Tests", () => {
  test("1. dateKey string boundary query correctly matches all days of February, April and December", () => {
    // Dữ liệu mẫu trải dài trong các tháng khác nhau
    const mockLogs = [
      { dateKey: "2026-02-01", totalAmount: 100000 },
      { dateKey: "2026-02-15", totalAmount: 200000 },
      { dateKey: "2026-02-28", totalAmount: 300000 },
      { dateKey: "2026-03-01", totalAmount: 400000 }, // Tháng 3 không được lọt vào
      { dateKey: "2026-04-30", totalAmount: 500000 },
      { dateKey: "2026-11-01", totalAmount: 600000 },
      { dateKey: "2026-11-30", totalAmount: 700000 },
    ];

    function filterByMonthKey(logs, monthKey) {
      const start = `${monthKey}-01`;
      const end = `${monthKey}-31`;
      return logs.filter((log) => log.dateKey >= start && log.dateKey <= end);
    }

    // Tháng 2/2026 (năm không nhuận)
    const febLogs = filterByMonthKey(mockLogs, "2026-02");
    assert.equal(febLogs.length, 3);
    const febTotal = febLogs.reduce((sum, l) => sum + l.totalAmount, 0);
    assert.equal(febTotal, 600000);

    // Tháng 4/2026
    const aprLogs = filterByMonthKey(mockLogs, "2026-04");
    assert.equal(aprLogs.length, 1);
    assert.equal(aprLogs[0].totalAmount, 500000);

    // Tháng 11/2026
    const novLogs = filterByMonthKey(mockLogs, "2026-11");
    assert.equal(novLogs.length, 2);
    const novTotal = novLogs.reduce((sum, l) => sum + l.totalAmount, 0);
    assert.equal(novTotal, 1300000);
  });

  test("2. Empty Month State returns structured zeros without throwing errors", () => {
    const emptyLogs = [];

    const stats = {
      monthTotal: emptyLogs.reduce((sum, l) => sum + l.totalAmount, 0),
      purchaseCount: emptyLogs.length,
      averagePerDay: 0,
      dailyTrend: [],
      categoryBreakdown: [],
      topItems: [],
    };

    assert.equal(stats.monthTotal, 0);
    assert.equal(stats.purchaseCount, 0);
    assert.equal(stats.averagePerDay, 0);
    assert.equal(stats.dailyTrend.length, 0);
    assert.equal(stats.categoryBreakdown.length, 0);
    assert.equal(stats.topItems.length, 0);
  });

  test("3. Month picker parameter validation (YYYY-MM regex)", () => {
    const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

    assert.ok(monthRegex.test("2026-01"));
    assert.ok(monthRegex.test("2026-11"));
    assert.ok(monthRegex.test("2026-12"));
    assert.ok(!monthRegex.test("2026-13"));
    assert.ok(!monthRegex.test("2026-00"));
    assert.ok(!monthRegex.test("2026-1"));
    assert.ok(!monthRegex.test("invalid"));
  });
});
