import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  getDateKey,
  getTodayKey,
  getYesterdayKey,
  getMonthKey,
  formatDateVN,
  formatDateTimeVN,
  getDateRange,
  getPastDaysOptions,
} from "../../src/lib/utils/date.ts";

describe("Vietnam Timezone & Date Utilities Tests", () => {
  test("getDateKey returns YYYY-MM-DD pattern", () => {
    const today = getTodayKey();
    assert.match(today, /^\d{4}-\d{2}-\d{2}$/);
  });

  test("getYesterdayKey returns date prior to today", () => {
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    assert.match(yesterday, /^\d{4}-\d{2}-\d{2}$/);
    assert.notEqual(today, yesterday);
    assert.ok(today > yesterday);
  });

  test("getMonthKey returns YYYY-MM pattern", () => {
    const month = getMonthKey();
    assert.match(month, /^\d{4}-\d{2}$/);
  });

  test("formatDateVN formats valid date into DD/MM/YYYY", () => {
    const sample = new Date("2026-11-13T08:30:00Z");
    const formatted = formatDateVN(sample);
    assert.match(formatted, /^\d{2}\/\d{2}\/\d{4}$/);
  });

  test("formatDateTimeVN formats into HH:mm - DD/MM/YYYY", () => {
    const sample = new Date("2026-11-13T08:30:00Z");
    const formatted = formatDateTimeVN(sample);
    assert.match(formatted, /^\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}$/);
  });

  test("getDateRange returns expected range objects", () => {
    const todayRange = getDateRange("today");
    assert.equal(todayRange.startDateKey, todayRange.endDateKey);

    const weekRange = getDateRange("7days");
    assert.ok(weekRange.startDateKey <= weekRange.endDateKey);
  });

  test("getPastDaysOptions returns 8 days with Today, Yesterday and valid ISO dates", () => {
    const days = getPastDaysOptions(8);
    assert.equal(days.length, 8);
    assert.ok(days[0].isToday);
    assert.ok(days[0].label.includes("Hôm nay"));
    assert.ok(days[1].isYesterday);
    assert.ok(days[1].label.includes("Hôm qua"));
    assert.match(days[0].dateKey, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(days[0].isoDate, /^\d{4}-\d{2}-\d{2}T12:00:00\+07:00$/);
  });
});

