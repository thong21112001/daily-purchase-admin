---
description: Git Safety Lock and Secret Zero Policy for daily-purchase-admin. Strictly enforced rules for source code safety and credential management.
alwaysApply: true
---

# GIT SAFETY & SECRET ZERO POLICY (`git-safety-and-secrets.md`)

## 1. Khóa An Toàn Git Tuyệt Đối (Git Safety Lock)

> [!CAUTION]
> **QUY TẮC CỐT LÕI (HARD LOCK #2):**
> Agent TUYỆT ĐỐI KHÔNG BAO GIỜ tự ý thực thi các lệnh thay đổi trạng thái kho lưu trữ Git nếu không nhận được lệnh rõ ràng, trực tiếp bằng văn bản từ User trong lượt hội thoại hiện tại.

### 1.1. Các Lệnh Bị Khóa Nghiêm Ngặt (Prohibited Without Explicit Directive)
- `git add ...`
- `git commit ...`
- `git push ...`
- `git tag ...`
- `git checkout -b ...` / `git switch ...`
- `git reset ...` / `git revert ...`
- `git clean -fd` / `git restore ...`
- `git stash ...` / `git branch -D ...`

### 1.2. Quy Trình Xin Phép & Gợi Ý Git (Authorized Protocol)
Khi một Phase hoặc tính năng đã hoàn tất bước `[11/11] CLOSED`:
1. Agent **CHỈ ĐƯỢC PHÉP** chuẩn bị sẵn câu lệnh Git đề xuất trong khối mã (markdown codeblock).
2. Agent hỏi User:  
   *"Toàn bộ quá trình kiểm thử và đồng bộ tài liệu đã hoàn tất. Bạn có muốn tôi thực thi lệnh git commit sau không?"*
3. **CHỈ KHI** User phản hồi đồng ý rõ ràng (ví dụ: *"Có", "Commit đi", "Chạy lệnh đó đi"*), Agent mới được phép thực thi lệnh `git add` và `git commit`.
4. Tuyệt đối không tự ý `git push` lên remote repository trừ khi User ghi rõ: *"Hãy push lên GitHub/GitLab"*.

---

## 2. Chính Sách Bảo Mật Tuyệt Đối (Secret Zero Policy)

> [!CAUTION]
> **QUY TẮC CỐT LÕI (HARD LOCK #3):**
> TUYỆT ĐỐI KHÔNG hardcode mật khẩu, mã PIN, JWT Secret, kết nối database URI, hoặc tài khoản test vào source code, script, fixtures, test cases hoặc tài liệu markdown.

### 2.1. Quản Lý Biến Môi Trường (Environment Variables)
Toàn bộ thông tin nhạy cảm của hệ thống `daily-purchase-admin` bắt buộc phải đọc từ biến môi trường qua tệp `.env.local` (phát triển nội bộ) hoặc môi trường runtime container/VPS:

| Biến Môi Trường | Mô Tả | Yêu Cầu Bảo Mật |
| :--- | :--- | :--- |
| `OWNER_USERNAME` | Tên đăng nhập chủ quản trị duy nhất | Đọc từ `process.env`, không gán mặc định chuỗi nhạy cảm |
| `OWNER_PASSWORD` | Mật khẩu tài khoản chủ quản trị | Băm với bcrypt/argon2, không lưu plain-text |
| `JWT_SECRET` | Khóa bí mật ký mã xác thực JWT | Tối thiểu 32 ký tự ngẫu nhiên, nạp từ môi trường |
| `MONGODB_URI` | Chuỗi kết nối cơ sở dữ liệu MongoDB | Tuyệt đối không ghi thông tin user/pass DB trong code |
| `PORT` | Cổng dịch vụ lắng nghe | Mặc định linh hoạt (ví dụ: `3001` hoặc `4000`) |

### 2.2. Quy Chuẩn Tệp Mẫu `.env.example`
Mọi biến môi trường mới khi được thêm vào hệ thống bắt buộc phải được khai báo trong `.env.example` với giá trị giữ chỗ (placeholders), ví dụ:
```bash
# ==========================================
# DAILY-PURCHASE-ADMIN - ENVIRONMENT TEMPLATE
# ==========================================
OWNER_USERNAME=admin_owner
OWNER_PASSWORD=change_this_strong_password_in_env_local
JWT_SECRET=replace_with_a_secure_random_32_char_secret_string
MONGODB_URI=mongodb://localhost:27017/daily_purchase_db
PORT=4000
```

### 2.3. Quy Định Tệp `.gitignore`
Tệp `.gitignore` của dự án phải có cấu hình chặn toàn bộ các biến thể sau:
```gitignore
# Environment files
.env
.env*.local
.env.development
.env.production
.env.test

# Test outputs & logs
test-artifacts/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Node modules & build
node_modules/
dist/
.next/
out/
```

### 2.4. Kiểm Toán Quét Khóa Bí Mật Tự Động (Secret Scanning Audit)
- Ở bước `[7/11] AUDIT` của mỗi Phase, bắt buộc chạy script quét source code để đảm bảo:
  + Không tồn tại regex khớp các chuỗi mật khẩu hardcode: `password\s*[:=]\s*["'][^"']+["']`.
  + Không tồn tại private key, token JWT hoặc connection string có chứa credentials thực tế.

