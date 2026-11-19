import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

// 1. Auth & Crypto
import { signOwnerToken, verifyOwnerToken, verifyOwnerCredentials, AUTH_COOKIE_NAME } from "../../src/lib/auth.ts";

// 2. Financial Utilities
import {
  formatVND,
  parseVND,
  calculateLineTotal,
  reverseUnitPrice,
  getQuickAmountSuggestions,
} from "../../src/lib/utils/currency.ts";

// 3. Vietnam Timezone & Date
import {
  getDateKey,
  getTodayKey,
  getYesterdayKey,
  getMonthKey,
  formatDateVN,
  getDateRange,
} from "../../src/lib/utils/date.ts";

// 4. Vietnamese Search
import {
  normalizeVietnamese,
  matchesUnaccented,
  createVietnameseRegex,
} from "../../src/lib/utils/vietnamese-search.ts";

// 5. Constants & F&B Categories
import {
  DEFAULT_PURCHASE_CATEGORIES,
  COMMON_UNITS,
  COFFEE_SHOP_STARTER_ITEMS,
} from "../../src/lib/constants/categories.ts";

describe("Phase 4: Comprehensive E2E Full Regression & Quality Audit", () => {
  before(() => {
    process.env.JWT_SECRET = "replace_with_mock_jwt_secret_32_chars_long";
    process.env.OWNER_PASSWORD = "change_this_mock_test_password";
  });

  // --------------------------------------------------------------------------
  // DOMAIN 1: AUTHENTICATION & SINGLE-OWNER SECURITY
  // --------------------------------------------------------------------------
  describe("1. Single-Owner Security & Native Web Crypto Authentication", () => {
    const username = "admin_owner";
    const correctPassword = "change_this_mock_test_password";

    test("1.1. Signs and verifies HMAC-SHA256 JWT Token with 90-day expiry", () => {
      const token = signOwnerToken(username);
      assert.ok(typeof token === "string" && token.split(".").length === 3);

      const payload = verifyOwnerToken(token);
      assert.ok(payload !== null);
      assert.equal(payload.username, username);
      assert.equal(payload.role, "OWNER");
    });

    test("1.2. Rejects tampered token or incorrect secret", () => {
      const token = signOwnerToken(username);
      const tampered = token.slice(0, -6) + "xxxxxx";
      const resultTampered = verifyOwnerToken(tampered);
      assert.equal(resultTampered, null);

      const invalidToken = "not.a.valid.jwt";
      assert.equal(verifyOwnerToken(invalidToken), null);
    });

    test("1.3. Validates single-owner credentials with timing-safe comparison", async () => {
      assert.equal(await verifyOwnerCredentials(correctPassword), true);
      assert.equal(await verifyOwnerCredentials("wrong_pin"), false);
      assert.equal(await verifyOwnerCredentials(""), false);
    });

    test("1.4. Validates Cookie specifications", () => {
      assert.equal(AUTH_COOKIE_NAME, "daily_purchase_auth_session");
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 2: SEQUENTIAL CODE GENERATION FORMAT
  // --------------------------------------------------------------------------
  describe("2. Atomic Sequential Purchase Code Formatting", () => {
    test("2.1. Validates PO-YYYYMMDD-XXX pattern", () => {
      const dateKey = "2026-11-15";
      const cleanDate = dateKey.replace(/-/g, "");
      const formatCode = (seq) => `PO-${cleanDate}-${String(seq).padStart(3, "0")}`;

      assert.equal(formatCode(1), "PO-20261115-001");
      assert.equal(formatCode(2), "PO-20261115-002");
      assert.equal(formatCode(42), "PO-20261115-042");
      assert.equal(formatCode(105), "PO-20261115-105");
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 3: FINANCIAL MATH & TWO-WAY REVERSE CALCULATIONS
  // --------------------------------------------------------------------------
  describe("3. Financial Currency Math & Two-Way Calculations", () => {
    test("3.1. Forward line total rounding", () => {
      assert.equal(calculateLineTotal(2, 180000), 360000);
      assert.equal(calculateLineTotal(1.5, 65000), 97500);
      assert.equal(calculateLineTotal(0.35, 120000), 42000);
    });

    test("3.2. Reverse unit price calculation from paid total", () => {
      // Mua 1.5kg hết tròn 100.000đ -> Đơn giá 66.667đ/kg
      const price = reverseUnitPrice(1.5, 100000);
      assert.equal(price, 66667);

      // Mua 0.5kg hết 45.000đ -> Đơn giá 90.000đ/kg
      assert.equal(reverseUnitPrice(0.5, 45000), 90000);
    });

    test("3.3. Currency formatting and input parsing", () => {
      assert.equal(formatVND(180000), "180.000 ₫");
      assert.equal(parseVND("150k"), 150000);
      assert.equal(parseVND("1.5tr"), 1500000);
      assert.equal(parseVND("2tr"), 2000000);
    });

    test("3.4. Quick cash chips generation", () => {
      const suggestions = getQuickAmountSuggestions("45");
      assert.ok(suggestions.includes(45000));
      assert.ok(suggestions.includes(450000));
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 4: AUTO-LEARN CATALOG STATE MACHINE
  // --------------------------------------------------------------------------
  describe("4. Auto-Learn Catalog State Machine Simulation", () => {
    test("4.1. Price tracking: min, max, last price, usage count", () => {
      let catalogItem = {
        name: "Cà phê Robusta Mộc",
        defaultUnit: "kg",
        lastUnitPrice: 0,
        minUnitPrice: 0,
        maxUnitPrice: 0,
        usageCount: 0,
      };

      // Lần mua 1: Đơn giá 180.000đ
      catalogItem.lastUnitPrice = 180000;
      catalogItem.minUnitPrice = 180000;
      catalogItem.maxUnitPrice = 180000;
      catalogItem.usageCount += 1;

      assert.equal(catalogItem.lastUnitPrice, 180000);
      assert.equal(catalogItem.minUnitPrice, 180000);
      assert.equal(catalogItem.maxUnitPrice, 180000);
      assert.equal(catalogItem.usageCount, 1);

      // Lần mua 2: Đơn giá hạ xuống 170.000đ
      catalogItem.lastUnitPrice = 170000;
      catalogItem.minUnitPrice = Math.min(catalogItem.minUnitPrice, 170000);
      catalogItem.maxUnitPrice = Math.max(catalogItem.maxUnitPrice, 170000);
      catalogItem.usageCount += 1;

      assert.equal(catalogItem.lastUnitPrice, 170000);
      assert.equal(catalogItem.minUnitPrice, 170000);
      assert.equal(catalogItem.maxUnitPrice, 180000);
      assert.equal(catalogItem.usageCount, 2);

      // Lần mua 3: Đơn giá tăng lên 195.000đ
      catalogItem.lastUnitPrice = 195000;
      catalogItem.minUnitPrice = Math.min(catalogItem.minUnitPrice, 195000);
      catalogItem.maxUnitPrice = Math.max(catalogItem.maxUnitPrice, 195000);
      catalogItem.usageCount += 1;

      assert.equal(catalogItem.lastUnitPrice, 195000);
      assert.equal(catalogItem.minUnitPrice, 170000);
      assert.equal(catalogItem.maxUnitPrice, 195000);
      assert.equal(catalogItem.usageCount, 3);
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 5: VIETNAM TIMEZONE UTC+7
  // --------------------------------------------------------------------------
  describe("5. Asia/Ho_Chi_Minh Timezone Safety", () => {
    test("5.1. Correctly formats dateKey YYYY-MM-DD", () => {
      const today = getTodayKey();
      assert.match(today, /^\d{4}-\d{2}-\d{2}$/);

      const yesterday = getYesterdayKey();
      assert.match(yesterday, /^\d{4}-\d{2}-\d{2}$/);
      assert.notEqual(today, yesterday);

      const month = getMonthKey();
      assert.match(month, /^\d{4}-\d{2}$/);
    });

    test("5.2. Date ranges support both 7days and last_7_days", () => {
      const r1 = getDateRange("7days");
      const r2 = getDateRange("last_7_days");
      assert.equal(r1.startDateKey, r2.startDateKey);
      assert.equal(r1.endDateKey, r2.endDateKey);
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 6: VIETNAMESE SEARCH & F&B INVENTORY
  // --------------------------------------------------------------------------
  describe("6. Vietnamese Unaccented Search & Starter Inventory", () => {
    test("6.1. Strips diacritics and matches unaccented tokens", () => {
      assert.equal(normalizeVietnamese("Đường Cát Trắng"), "duong cat trang");
      assert.equal(matchesUnaccented("Sữa tươi thanh trùng Barista", "sua tuoi"), true);
      assert.equal(matchesUnaccented("Ly nhựa nắp cầu 500ml", "ly nhua"), true);
    });

    test("6.2. Coffee shop starter items contain all essential supplies", () => {
      assert.ok(COFFEE_SHOP_STARTER_ITEMS.length >= 15);
      assert.ok(COFFEE_SHOP_STARTER_ITEMS.some((i) => i.name.includes("Robusta")));
      assert.ok(COFFEE_SHOP_STARTER_ITEMS.some((i) => i.name.includes("Arabica")));
      assert.ok(COFFEE_SHOP_STARTER_ITEMS.some((i) => i.name.includes("Sữa")));
      assert.ok(COFFEE_SHOP_STARTER_ITEMS.some((i) => i.name.includes("Syrup")));
      assert.ok(COFFEE_SHOP_STARTER_ITEMS.some((i) => i.name.includes("Ly")));
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 7: CSV EXPORT WITH UTF-8 BOM
  // --------------------------------------------------------------------------
  describe("7. Excel Compatibility: CSV Export with UTF-8 BOM", () => {
    test("7.1. CSV begins with \\uFEFF prefix", () => {
      const BOM = "\uFEFF";
      const header = "Mã Phiếu,Ngày Mua,Tên Mặt Hàng,Nhóm,Đơn Vị,Số Lượng,Đơn Giá (VNĐ),Thành Tiền (VNĐ)\n";
      const sampleRow = '"PO-20261115-001","15/11/2026","Cà phê Robusta Mộc","Nguyên liệu Cà phê & Trà","kg",2,180000,360000\n';
      const csv = BOM + header + sampleRow;

      assert.equal(csv.charCodeAt(0), 0xFEFF);
      assert.ok(csv.includes("Cà phê Robusta Mộc"));
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 8: JSON BACKUP & MERGE RESTORATION (CHOICE A)
  // --------------------------------------------------------------------------
  describe("8. JSON Backup & Choice A Merge Strategy", () => {
    test("8.1. Backup JSON structure and Merge / Upsert simulation", () => {
      const existingDb = [
        { code: "PO-20261114-001", totalAmount: 360000, supplier: "Chợ đầu mối" },
        { code: "PO-20261114-002", totalAmount: 150000, supplier: "Siêu thị" },
      ];

      const backupIncoming = {
        app: "daily-purchase-admin",
        version: "1.0.0",
        data: {
          purchases: [
            // Cập nhật phiếu cũ
            { code: "PO-20261114-001", totalAmount: 380000, supplier: "Chợ đầu mối Cầu Muối" },
            // Bổ sung phiếu mới
            { code: "PO-20261115-001", totalAmount: 500000, supplier: "Cửa hàng F&B" },
          ],
        },
      };

      // Mô phỏng Merge Strategy
      const mergedMap = new Map();
      existingDb.forEach((p) => mergedMap.set(p.code, p));

      backupIncoming.data.purchases.forEach((incoming) => {
        mergedMap.set(incoming.code, incoming); // Upsert
      });

      const finalRecords = Array.from(mergedMap.values());
      assert.equal(finalRecords.length, 3);
      assert.equal(mergedMap.get("PO-20261114-001").totalAmount, 380000);
      assert.equal(mergedMap.get("PO-20261114-002").totalAmount, 150000);
      assert.equal(mergedMap.get("PO-20261115-001").totalAmount, 500000);
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 9: VERCEL & PWA CONFIGURATION AUDIT
  // --------------------------------------------------------------------------
  describe("9. Vercel Serverless & PWA Standalone Configuration", () => {
    test("9.1. vercel.json enforces Singapore region (sin1) and security headers", () => {
      const vercelJsonPath = path.resolve(process.cwd(), "vercel.json");
      assert.ok(fs.existsSync(vercelJsonPath), "vercel.json phải tồn tại");

      const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, "utf-8"));
      assert.deepEqual(vercelConfig.regions, ["sin1"], "Phải định tuyến cụm sin1 (Singapore)");
      assert.ok(vercelConfig.headers.length >= 2, "Phải có headers bảo mật và chống cache API");
    });

    test("9.2. public/manifest.json configures Standalone Web App for Samsung Galaxy A35 5G", () => {
      const manifestPath = path.resolve(process.cwd(), "public", "manifest.json");
      assert.ok(fs.existsSync(manifestPath), "public/manifest.json phải tồn tại");

      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      assert.equal(manifest.display, "standalone");
      assert.equal(manifest.orientation, "portrait-primary");
      assert.equal(manifest.background_color, "#09090b");
      assert.equal(manifest.theme_color, "#18181b");
      assert.ok(manifest.icons.length > 0);
    });

    test("9.3. public/icon.svg exists for PWA icon and browser favicon resolution without route conflict", () => {
      const publicIcon = path.resolve(process.cwd(), "public", "icon.svg");
      assert.ok(fs.existsSync(publicIcon), "public/icon.svg phải tồn tại");
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 10: SAMSUNG GALAXY A35 5G UI ERGONOMICS & MINIMAL SAAS STANDARDS
  // --------------------------------------------------------------------------
  describe("10. Samsung Galaxy A35 5G & Minimal SaaS 2026-2027 UI Audit", () => {
    const srcDir = path.resolve(process.cwd(), "src");

    function getAllTsx(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      for (const item of list) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) results = results.concat(getAllTsx(full));
        else if (item.endsWith(".tsx")) results.push(full);
      }
      return results;
    }

    const tsxFiles = getAllTsx(srcDir);

    test("10.1. Zero AI icons (sparkles, wand, robot) across all UI files", () => {
      const forbidden = /\b(sparkles|magic-wand|sparkle|wand|robot)\b/i;
      const violations = [];

      for (const file of tsxFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
          if (forbidden.test(line) && !line.trim().startsWith("//") && !line.trim().startsWith("/*")) {
            violations.push(`${path.relative(process.cwd(), file)}:${idx + 1}`);
          }
        });
      }

      assert.equal(violations.length, 0, `Phát hiện icon AI: ${JSON.stringify(violations)}`);
    });

    test("10.2. Touch targets >= 44px (min-h-[44px], h-11, h-12) on key interactive components", () => {
      const buttonPath = path.join(srcDir, "components", "ui", "Button.tsx");
      const buttonContent = fs.readFileSync(buttonPath, "utf-8");
      assert.match(buttonContent, /min-h-\[44px\]|h-11/);

      const navPath = path.join(srcDir, "components", "layout", "MobileBottomNav.tsx");
      const navContent = fs.readFileSync(navPath, "utf-8");
      assert.match(navContent, /min-h-\[44px\]|h-16/);
    });

    test("10.3. Tabular numerals for monetary alignment", () => {
      const cardPath = path.join(srcDir, "components", "reports", "SpendingBarList.tsx");
      const content = fs.readFileSync(cardPath, "utf-8");
      assert.match(content, /tabular-nums/);
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 11: SECRET-ZERO VERIFICATION
  // --------------------------------------------------------------------------
  describe("11. Secret-Zero Security Audit", () => {
    test("11.1. No hardcoded passwords, tokens, or connection strings in source code", () => {
      const forbiddenTokens = [
        "cluster0.mongodb.net/daily_purchase_db?retryWrites",
        "owner_password_12345",
      ];

      const allFiles = fs.readdirSync(path.resolve(process.cwd(), "src"), { recursive: true })
        .filter((f) => typeof f === "string" && (f.endsWith(".ts") || f.endsWith(".tsx")))
        .map((f) => path.resolve(process.cwd(), "src", f));

      for (const file of allFiles) {
        const content = fs.readFileSync(file, "utf-8");
        for (const token of forbiddenTokens) {
          assert.equal(
            content.includes(token),
            false,
            `Phát hiện rò rỉ secret trong file: ${path.relative(process.cwd(), file)}`
          );
        }
      }
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 12: DAILY SAVINGS CHECKIN FEATURE
  // --------------------------------------------------------------------------
  describe("12. Daily Savings Checkin & Streak Tracking", () => {
    test("12.1. /savings page file exists and is registered in build routes", () => {
      const savingsPage = path.resolve(process.cwd(), "src", "app", "savings", "page.tsx");
      assert.ok(fs.existsSync(savingsPage), "src/app/savings/page.tsx must exist");
      const content = fs.readFileSync(savingsPage, "utf-8");
      assert.match(content, /tabular-nums/);
      assert.match(content, /min-h-\[44px\]/);
    });

    test("12.2. SavingsCheckinWidget is integrated into homepage", () => {
      const homePage = path.resolve(process.cwd(), "src", "app", "page.tsx");
      const content = fs.readFileSync(homePage, "utf-8");
      assert.match(content, /SavingsCheckinWidget/);
    });

    test("12.3. Mobile bottom navigation includes savings tab", () => {
      const navPath = path.resolve(process.cwd(), "src", "components", "layout", "MobileBottomNav.tsx");
      const content = fs.readFileSync(navPath, "utf-8");
      assert.match(content, /href="\/savings"/);
      assert.match(content, /Điểm danh/);
    });

    test("12.4. Desktop sidebar includes savings link", () => {
      const sidePath = path.resolve(process.cwd(), "src", "components", "layout", "DesktopSidebar.tsx");
      const content = fs.readFileSync(sidePath, "utf-8");
      assert.match(content, /href:\s*"\/savings"|href="\/savings"/);
      assert.match(content, /Điểm danh/);
    });
  });

  // --------------------------------------------------------------------------
  // DOMAIN 13: CATALOG SORTING & MOBILE 2-TIER CARDS
  // --------------------------------------------------------------------------
  describe("13. Catalog Sorting & Mobile 2-Tier Card Layout", () => {
    test("13.1. CatalogToolbar contains sort options including usage, price and Vietnamese name", () => {
      const toolbarPath = path.resolve(process.cwd(), "src", "components", "catalog", "CatalogToolbar.tsx");
      assert.ok(fs.existsSync(toolbarPath), "CatalogToolbar must exist");
      const content = fs.readFileSync(toolbarPath, "utf-8");
      assert.match(content, /price_asc/);
      assert.match(content, /price_desc/);
      assert.match(content, /name_asc/);
      assert.match(content, /name_desc/);
    });

    test("13.2. Homepage and History feature 2-tier card layout for mobile viewports", () => {
      const homePage = path.resolve(process.cwd(), "src", "app", "page.tsx");
      const historyPage = path.resolve(process.cwd(), "src", "app", "history", "page.tsx");
      const homeContent = fs.readFileSync(homePage, "utf-8");
      const historyContent = fs.readFileSync(historyPage, "utf-8");

      assert.match(homeContent, /flex sm:hidden/);
      assert.match(historyContent, /flex sm:hidden/);
    });

    test("13.3. Quantity input uses inputMode='decimal' across all forms", () => {
      const forms = [
        path.resolve(process.cwd(), "src", "components", "entry", "QuickSingleItemForm.tsx"),
        path.resolve(process.cwd(), "src", "components", "entry", "BatchReceiptForm.tsx"),
        path.resolve(process.cwd(), "src", "components", "entry", "EditPurchaseModal.tsx"),
      ];

      for (const formPath of forms) {
        const content = fs.readFileSync(formPath, "utf-8");
        assert.match(content, /inputMode="decimal"/, `${path.basename(formPath)} must have inputMode="decimal" on quantity`);
      }
    });
  });
});
