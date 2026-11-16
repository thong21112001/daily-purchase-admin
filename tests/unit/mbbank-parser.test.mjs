import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { MBBankService } from "../../src/services/mbbank.service.ts";

describe("MB Bank Smart Regex & Webhook Parser Tests", () => {
  test("1. parseAndroidNotification parses standard MBBank app push notification", () => {
    const raw =
      "Thông báo biến động số dư: TK 0905123456|GD: +350,000VND 16/11/26 09:30 |SD: 12,500,000VND|ND: NGUYEN VAN A chuyen khoan";

    const parsed = MBBankService.parseAndroidNotification(raw);

    assert.equal(parsed.bankName, "MBBank");
    assert.equal(parsed.accountNumber, "0905123456");
    assert.equal(parsed.type, "IN");
    assert.equal(parsed.amount, 350000);
    assert.equal(parsed.balanceAfter, 12500000);
    assert.equal(parsed.content, "NGUYEN VAN A chuyen khoan");
    assert.equal(parsed.senderName, "NGUYEN VAN A");
    assert.equal(parsed.dateKey, "2026-11-16");
    assert.ok(parsed.transactionRef.startsWith("MB_20261116_"));
  });

  test("2. parseAndroidNotification parses money out (expense) with minus sign", () => {
    const raw =
      "TK 0905987654|GD: -45,000VND 15/11/26 15:45|SD: 5,400,000VND|ND: Mua ca phe";

    const parsed = MBBankService.parseAndroidNotification(raw);

    assert.equal(parsed.accountNumber, "0905987654");
    assert.equal(parsed.type, "OUT");
    assert.equal(parsed.amount, 45000);
    assert.equal(parsed.balanceAfter, 5400000);
    assert.equal(parsed.content, "Mua ca phe");
    assert.equal(parsed.dateKey, "2026-11-15");
  });

  test("3. parseAndroidNotification handles dot notation and 4-digit years", () => {
    const raw =
      "TK 0388112233|GD: +1.250.000d 20/11/2026 10:00:15|SD: 20.000.000d|ND: LE THI B tra tien dat coc";

    const parsed = MBBankService.parseAndroidNotification(raw);

    assert.equal(parsed.accountNumber, "0388112233");
    assert.equal(parsed.type, "IN");
    assert.equal(parsed.amount, 1250000);
    assert.equal(parsed.balanceAfter, 20000000);
    assert.equal(parsed.content, "LE THI B tra tien dat coc");
    assert.equal(parsed.dateKey, "2026-11-20");
  });

  test("4. parseSepayWebhook parses SePay JSON payload correctly", () => {
    const sepayPayload = {
      id: 998877,
      gateway: "MBBank",
      transactionDate: "2026-11-16 14:30:00",
      accountNumber: "0905123456",
      transferType: "in",
      transferAmount: 85000,
      accumulated: 12585000,
      referenceCode: "FT263200112345",
      content: "BAN 05 CA PHE DEN VA BAC XIU",
      corresponsiveName: "TRAN VAN C",
    };

    const parsed = MBBankService.parseSepayWebhook(sepayPayload);

    assert.equal(parsed.bankName, "MBBank");
    assert.equal(parsed.accountNumber, "0905123456");
    assert.equal(parsed.type, "IN");
    assert.equal(parsed.amount, 85000);
    assert.equal(parsed.balanceAfter, 12585000);
    assert.equal(parsed.content, "BAN 05 CA PHE DEN VA BAC XIU");
    assert.equal(parsed.senderName, "TRAN VAN C");
    assert.equal(parsed.transactionRef, "MB_SEPAY_FT263200112345");
  });

  test("5. Deduplication generates consistent deterministic transactionRef", () => {
    const raw1 =
      "TK 0905123456|GD: +100,000VND 16/11/26 12:00|SD: 1,000,000VND|ND: TEST DEDUPLICATION";
    const raw2 =
      "TK 0905123456|GD: +100,000VND 16/11/26 12:00|SD: 1,000,000VND|ND: TEST DEDUPLICATION";

    const parsed1 = MBBankService.parseAndroidNotification(raw1);
    const parsed2 = MBBankService.parseAndroidNotification(raw2);

    assert.equal(parsed1.transactionRef, parsed2.transactionRef);
  });
});
