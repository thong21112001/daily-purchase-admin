import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Daily Savings Check-in Integration & Backup Sync Tests", () => {
  // Mock In-memory store for integration logic test
  class MockSavingsStore {
    constructor() {
      this.checkins = new Map(); // dateKey -> checkin
      this.settings = new Map(); // key -> value
      this.settings.set("default_daily_amount", 200000);
    }

    getDefaultAmount() {
      return this.settings.get("default_daily_amount") || 200000;
    }

    setDefaultAmount(amount) {
      const val = Math.max(0, Math.round(amount));
      this.settings.set("default_daily_amount", val);
      return val;
    }

    checkInToday(todayKey, customAmount, note) {
      if (this.checkins.has(todayKey)) {
        return { checkin: this.checkins.get(todayKey), isNew: false };
      }
      const amt = customAmount !== undefined && customAmount >= 0 ? customAmount : this.getDefaultAmount();
      const record = {
        dateKey: todayKey,
        amount: amt,
        isMakeup: false,
        note: note || "",
        checkedInAt: new Date().toISOString(),
      };
      this.checkins.set(todayKey, record);
      return { checkin: record, isNew: true };
    }

    checkInMakeup(dateKey, todayKey, customAmount, note) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        throw new Error("Invalid dateKey format");
      }
      if (dateKey > todayKey) {
        throw new Error("Cannot check-in for a future date");
      }
      if (this.checkins.has(dateKey)) {
        return { checkin: this.checkins.get(dateKey), isNew: false };
      }
      const amt = customAmount !== undefined && customAmount >= 0 ? customAmount : this.getDefaultAmount();
      const isToday = dateKey === todayKey;
      const record = {
        dateKey,
        amount: amt,
        isMakeup: !isToday,
        note: note || (isToday ? "" : "Điểm danh bù"),
        checkedInAt: new Date().toISOString(),
      };
      this.checkins.set(dateKey, record);
      return { checkin: record, isNew: true };
    }

    updateCheckin(dateKey, amount, note) {
      const existing = this.checkins.get(dateKey);
      if (!existing) return null;
      if (amount !== undefined && amount >= 0) existing.amount = Math.round(amount);
      if (note !== undefined) existing.note = note.trim();
      return existing;
    }

    deleteCheckin(dateKey) {
      return this.checkins.delete(dateKey);
    }

    getMonthStats(monthKey) {
      const records = Array.from(this.checkins.values()).filter((c) =>
        c.dateKey.startsWith(monthKey)
      );
      const allRecords = Array.from(this.checkins.values());
      const monthTotal = records.reduce((s, c) => s + c.amount, 0);
      const allTimeTotal = allRecords.reduce((s, c) => s + c.amount, 0);

      return {
        monthTotal,
        allTimeTotal,
        monthCount: records.length,
        allTimeCount: allRecords.length,
      };
    }

    exportBackup() {
      return {
        app: "daily-purchase-admin",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        savingsCheckins: Array.from(this.checkins.values()),
        savingsSettings: Array.from(this.settings.entries()).map(([k, v]) => ({
          key: k,
          defaultAmount: v,
        })),
      };
    }

    restoreBackup(backupPayload) {
      let restoredCheckins = 0;
      let restoredSettings = 0;

      if (Array.isArray(backupPayload.savingsCheckins)) {
        for (const c of backupPayload.savingsCheckins) {
          if (c.dateKey) {
            this.checkins.set(c.dateKey, c);
            restoredCheckins++;
          }
        }
      }

      if (Array.isArray(backupPayload.savingsSettings)) {
        for (const s of backupPayload.savingsSettings) {
          if (s.key && s.defaultAmount !== undefined) {
            this.settings.set(s.key, s.defaultAmount);
            restoredSettings++;
          }
        }
      }

      return { restoredCheckins, restoredSettings };
    }
  }

  test("Idempotent checkin today prevents duplicate records", () => {
    const store = new MockSavingsStore();
    const todayKey = "2026-11-19";

    const res1 = store.checkInToday(todayKey, 200000, "Ngày 1");
    assert.equal(res1.isNew, true);
    assert.equal(res1.checkin.amount, 200000);

    // Call checkin again for same day
    const res2 = store.checkInToday(todayKey, 300000, "Thử bấm lần 2");
    assert.equal(res2.isNew, false);
    // Amount preserved from first call
    assert.equal(res2.checkin.amount, 200000);
    assert.equal(store.checkins.size, 1);
  });

  test("Makeup checkin sets isMakeup=true and rejects future dates", () => {
    const store = new MockSavingsStore();
    const todayKey = "2026-11-19";

    // Past date makeup
    const pastRes = store.checkInMakeup("2026-11-17", todayKey, 200000, "Bù thứ 3");
    assert.equal(pastRes.isNew, true);
    assert.equal(pastRes.checkin.isMakeup, true);

    // Future date should be rejected
    assert.throws(() => {
      store.checkInMakeup("2026-11-25", todayKey, 200000);
    }, /Cannot check-in for a future date/);
  });

  test("Update checkin modifies amount and note correctly", () => {
    const store = new MockSavingsStore();
    store.checkInToday("2026-11-19", 200000);

    const updated = store.updateCheckin("2026-11-19", 500000, "Tăng tiết kiệm");
    assert.equal(updated.amount, 500000);
    assert.equal(updated.note, "Tăng tiết kiệm");

    const stats = store.getMonthStats("2026-11");
    assert.equal(stats.monthTotal, 500000);
  });

  test("Delete checkin removes record and updates totals", () => {
    const store = new MockSavingsStore();
    store.checkInToday("2026-11-19", 200000);
    assert.equal(store.checkins.size, 1);

    const ok = store.deleteCheckin("2026-11-19");
    assert.equal(ok, true);
    assert.equal(store.checkins.size, 0);

    const stats = store.getMonthStats("2026-11");
    assert.equal(stats.monthTotal, 0);
  });

  test("Backup and restore syncs savings checkins and settings without loss", () => {
    const storeA = new MockSavingsStore();
    storeA.setDefaultAmount(250000);
    storeA.checkInToday("2026-11-18", 250000, "Ngày 18");
    storeA.checkInToday("2026-11-19", 250000, "Ngày 19");

    const backup = storeA.exportBackup();
    assert.ok(backup.savingsCheckins);
    assert.equal(backup.savingsCheckins.length, 2);
    assert.equal(backup.savingsSettings[0].defaultAmount, 250000);

    // Restore to another clean store
    const storeB = new MockSavingsStore();
    const result = storeB.restoreBackup(backup);
    assert.equal(result.restoredCheckins, 2);
    assert.equal(result.restoredSettings, 1);
    assert.equal(storeB.getDefaultAmount(), 250000);
    assert.equal(storeB.checkins.get("2026-11-19").amount, 250000);
  });
});
