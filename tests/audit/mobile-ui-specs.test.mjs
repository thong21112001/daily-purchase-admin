import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const SRC_DIR = path.resolve(process.cwd(), "src");

function getAllFiles(dir, extensions = [".tsx", ".ts", ".css"]) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

describe("Samsung Galaxy A35 5G & Minimal SaaS 2026-2027 UI/UX Audit", () => {
  const tsxFiles = getAllFiles(SRC_DIR, [".tsx"]);

  test("1. Cỡ chữ trong mọi thẻ <input>, <select>, <textarea> bắt buộc >= 16px (text-base) để chống auto-zoom", () => {
    const inputRegex = /<(input|textarea|select)[^>]*className=["'`]([^"'`]*)["'`]/g;
    const violations = [];

    for (const filePath of tsxFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      let match;
      while ((match = inputRegex.exec(content)) !== null) {
        const tag = match[1];
        const className = match[2];

        // Bỏ qua checkbox, radio, file input (ẩn)
        if (content.slice(match.index, match.index + 120).includes('type="hidden"') ||
            content.slice(match.index, match.index + 120).includes('type="file"') ||
            content.slice(match.index, match.index + 120).includes('type="checkbox"') ||
            className.includes("hidden")) {
          continue;
        }

        // Kiểm tra xem có text-base hoặc >= 16px không
        const hasTextBase = className.includes("text-base") || className.includes("text-lg") || className.includes("text-xl");
        const hasTextSmall = className.includes("text-xs") || className.includes("text-sm") || className.includes("text-[11px]") || className.includes("text-[12px]");

        if (hasTextSmall && !hasTextBase) {
          violations.push({
            file: path.relative(process.cwd(), filePath),
            tag,
            className,
          });
        }
      }
    }

    assert.equal(
      violations.length,
      0,
      `Phát hiện input có font-size < 16px gây lỗi auto-zoom trên mobile: ${JSON.stringify(violations, null, 2)}`
    );
  });

  test("2. Touch targets tối thiểu 44px x 44px (h-11, h-12, min-h-[44px], etc.) trên nút bấm chính và nav", () => {
    const buttonFile = path.join(SRC_DIR, "components", "ui", "Button.tsx");
    const buttonContent = fs.readFileSync(buttonFile, "utf-8");

    // Button size default/md phải >= 44px (h-11 = 44px hoặc min-h-[44px])
    assert.match(
      buttonContent,
      /h-11|min-h-\[44px\]/,
      "Button.tsx phải định nghĩa kích thước tối thiểu 44px (h-11 hoặc min-h-[44px])"
    );

    // MobileBottomNav phải có min-h-[44px] và h-16
    const bottomNavFile = path.join(SRC_DIR, "components", "layout", "MobileBottomNav.tsx");
    const bottomNavContent = fs.readFileSync(bottomNavFile, "utf-8");
    assert.match(bottomNavContent, /min-h-\[44px\]|h-16/, "MobileBottomNav phải tuân thủ touch targets >= 44px");
  });

  test("3. Cột số lượng và tiền tệ VNĐ bắt buộc dùng tabular-nums / font-mono để căn thẳng hàng dọc", () => {
    const currencyUtil = path.join(SRC_DIR, "lib", "utils", "currency.ts");
    assert.ok(fs.existsSync(currencyUtil), "currency.ts phải tồn tại");

    // Kiểm tra các component báo cáo và hiển thị số tiền có sử dụng tabular-nums
    const reportFiles = [
      path.join(SRC_DIR, "components", "reports", "SpendingBarList.tsx"),
      path.join(SRC_DIR, "components", "reports", "CategoryBreakdown.tsx"),
      path.join(SRC_DIR, "components", "reports", "TopSpendingList.tsx"),
      path.join(SRC_DIR, "components", "ui", "QuickAmountChips.tsx"),
    ];

    for (const file of reportFiles) {
      const content = fs.readFileSync(file, "utf-8");
      assert.match(
        content,
        /tabular-nums/,
        `File ${path.basename(file)} phải chứa tabular-nums để căn thẳng hàng dọc`
      );
    }
  });

  test("4. TUYỆT ĐỐI KHÔNG dùng icon kiểu AI (sparkles, wand, robot)", () => {
    const allSrcFiles = getAllFiles(SRC_DIR, [".tsx", ".ts"]);
    const forbiddenPattern = /\b(sparkles|magic-wand|sparkle|wand|robot)\b/i;
    const violations = [];

    for (const filePath of allSrcFiles) {
      const content = fs.readFileSync(filePath, "utf-8");
      if (forbiddenPattern.test(content)) {
        // Bỏ qua comments nếu có
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
          if (forbiddenPattern.test(line) && !line.trim().startsWith("//") && !line.trim().startsWith("/*")) {
            violations.push(`${path.relative(process.cwd(), filePath)}:${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }

    assert.equal(
      violations.length,
      0,
      `Phát hiện từ khóa / icon AI bị cấm: ${JSON.stringify(violations, null, 2)}`
    );
  });

  test("5. Chống tràn ngang trên màn hình di động (overflow-x: hidden / overflow-x-hidden)", () => {
    const layoutShell = path.join(SRC_DIR, "components", "layout", "AdminLayoutShell.tsx");
    const content = fs.readFileSync(layoutShell, "utf-8");
    assert.match(
      content,
      /overflow-x-hidden/,
      "AdminLayoutShell phải có overflow-x-hidden để chống tràn ngang trên Galaxy A35"
    );
  });
});
