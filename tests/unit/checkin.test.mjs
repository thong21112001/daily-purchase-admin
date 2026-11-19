import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { getDateKey, getVNParts, VIETNAM_TIMEZONE } from "../../src/lib/utils/date.ts";

/**
 * Pure streak calculation test simulating checkin service logic
 */
function calculateStreaks(sortedAscDateKeys, todayDateKey) {
  if (!sortedAscDateKeys || sortedAscDateKeys.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dateSet = new Set(sortedAscDateKeys);
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dateStr of sortedAscDateKeys) {
    const curDate = new Date(dateStr + "T00:00:00+07:00");
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffMs = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
      if (diffDays === 1) {
        tempStreak += 1;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = curDate;
  }

  // Current streak
  let currentStreak = 0;
  let checkDate = new Date(todayDateKey + "T00:00:00+07:00");
  const todayKeyStr = getDateKey(checkDate);

  if (!dateSet.has(todayKeyStr)) {
    // Check yesterday
    checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
  }

  while (true) {
    const key = getDateKey(checkDate);
    if (dateSet.has(key)) {
      currentStreak += 1;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

describe("Daily Savings Checkin Unit Tests", () => {
  test("UTC+7 Timezone dateKey consistency across boundary hours", () => {
    // Test 01:00 AM UTC+7 (18:00 UTC previous day)
    const earlyMorningVN = new Date("2026-11-19T01:15:00+07:00");
    assert.equal(getDateKey(earlyMorningVN), "2026-11-19");

    // Test 23:45 PM UTC+7 (16:45 UTC same day)
    const lateNightVN = new Date("2026-11-19T23:45:00+07:00");
    assert.equal(getDateKey(lateNightVN), "2026-11-19");
  });

  test("Streak calculation when checked in today", () => {
    const dates = ["2026-11-17", "2026-11-18", "2026-11-19"];
    const result = calculateStreaks(dates, "2026-11-19");
    assert.equal(result.currentStreak, 3);
    assert.equal(result.longestStreak, 3);
  });

  test("Streak calculation keeps streak active on today even before checking in (grace period)", () => {
    const dates = ["2026-11-17", "2026-11-18", "2026-11-19"];
    // Today is Nov 20, user hasn't checked in yet, but checked in yesterday (Nov 19)
    const result = calculateStreaks(dates, "2026-11-20");
    assert.equal(result.currentStreak, 3);
    assert.equal(result.longestStreak, 3);
  });

  test("Streak resets to 0 if a day was completely missed", () => {
    const dates = ["2026-11-16", "2026-11-17", "2026-11-18"];
    // Today is Nov 20. Last checkin was Nov 18 (missed Nov 19)
    const result = calculateStreaks(dates, "2026-11-20");
    assert.equal(result.currentStreak, 0);
    assert.equal(result.longestStreak, 3);
  });

  test("Streak calculation spans across month boundary", () => {
    const dates = ["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"];
    const result = calculateStreaks(dates, "2026-11-02");
    assert.equal(result.currentStreak, 4);
    assert.equal(result.longestStreak, 4);
  });

  test("Streak calculation spans across leap year February", () => {
    const dates = ["2024-02-28", "2024-02-29", "2024-03-01"];
    const result = calculateStreaks(dates, "2024-03-01");
    assert.equal(result.currentStreak, 3);
    assert.equal(result.longestStreak, 3);
  });

  test("Streak calculation spans across year boundary", () => {
    const dates = ["2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"];
    const result = calculateStreaks(dates, "2027-01-02");
    assert.equal(result.currentStreak, 4);
    assert.equal(result.longestStreak, 4);
  });

  test("Longest streak retains record even after current streak is broken", () => {
    // 5-day streak, then 2 days missed, then 2-day streak
    const dates = [
      "2026-11-01",
      "2026-11-02",
      "2026-11-03",
      "2026-11-04",
      "2026-11-05",
      // missed 06, 07
      "2026-11-08",
      "2026-11-09",
    ];
    const result = calculateStreaks(dates, "2026-11-09");
    assert.equal(result.currentStreak, 2);
    assert.equal(result.longestStreak, 5);
  });
});
