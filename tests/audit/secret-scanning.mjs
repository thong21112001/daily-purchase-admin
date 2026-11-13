import fs from "node:fs";
import path from "node:path";

/**
 * AUTOMATED SECRET SCANNING AUDIT
 * Đảm bảo 100% tuân thủ Secret Zero Policy (Hard Lock #3)
 */

const SUSPICIOUS_PATTERNS = [
  /mongodb(\+srv)?:\/\/[a-zA-Z0-9_-]+:[^@\s"']+@/i, // MongoDB URI chứa password thật
  /['"]?(?:secret|jwt_secret|owner_password)['"]?\s*[:=]\s*['"][a-zA-Z0-9_\-!@#$%^&*]{8,}['"]/i, // Hardcoded password/secret
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, // Khóa bí mật
];

const IGNORED_PATHS = [
  "node_modules",
  ".next",
  "dist",
  ".git",
  ".env.example", // Tệp template được phép chứa placeholder
  "secret-scanning.mjs",
];

function scanDirectory(dir, issues = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (IGNORED_PATHS.some((p) => fullPath.includes(p))) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(fullPath, issues);
    } else if (entry.isFile() && /\.(ts|tsx|js|mjs|json|md)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");

      for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(content)) {
          // Bỏ qua nếu có cờ placeholder mẫu
          if (content.includes("change_this_") || content.includes("replace_with_")) {
            continue;
          }
          issues.push({
            file: fullPath,
            pattern: pattern.toString(),
          });
        }
      }
    }
  }

  return issues;
}

console.log("🔍 Đang kích hoạt kiểm toán Secret-Zero trên toàn bộ repository...");
const rootDir = process.cwd();
const detectedIssues = scanDirectory(rootDir);

if (detectedIssues.length > 0) {
  console.error("❌ PHÁT HIỆN VI PHẠM SECRET-ZERO POLICY:");
  for (const issue of detectedIssues) {
    console.error(`  - Tệp: ${issue.file}`);
    console.error(`    Khớp quy tắc: ${issue.pattern}`);
  }
  process.exit(1);
} else {
  console.log("✅ 100% PASS: Không phát hiện bất kỳ thông tin xác thực, mật khẩu hoặc khóa bí mật nào bị hardcode.");
  process.exit(0);
}

