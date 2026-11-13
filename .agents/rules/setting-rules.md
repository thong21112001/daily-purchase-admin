---
description: Master rules for daily-purchase-admin project. Defines rule priority, hard locks, architecture boundaries, safety constraints, and core engineering principles.
alwaysApply: true
---

# DAILY PURCHASE ADMIN - MASTER RULES (`setting-rules.md`)

## 1. Mục đích & Phạm vi Dự án (Purpose & Scope)

Tài liệu này xác định các quy tắc kỹ thuật và tiêu chuẩn kỹ thuật bắt buộc áp dụng cho toàn bộ dự án **`daily-purchase-admin`** (Hệ thống Quản trị Theo dõi Nhập & Mua hàng Hóa Cá nhân).

Hệ thống phục vụ cho việc:
- Quản lý danh mục hàng hóa, nhà cung cấp, phân loại vật tư và mặt hàng tiêu dùng / kinh doanh cá nhân.
- Theo dõi lịch sử nhập hàng, chi phí mua hàng hằng ngày, công nợ, đối soát hóa đơn / phiếu chi.
- Báo cáo tài chính, tổng chi tiêu mua sắm, cảnh báo biến động giá nhập, thống kê chi phí trực quan.
- Tối ưu hóa tối đa cho thao tác nhập liệu thực địa trên điện thoại di động cầm tay (đặc biệt chuẩn hóa trên **Samsung Galaxy A35 5G**).

AI Agent và Kỹ sư phát triển BẮT BUỘC tuân thủ các quy tắc này trong mọi thao tác phân tích, thiết kế, viết mã, kiểm thử, tái cấu trúc và tài liệu hóa.

---

## 2. Các Quy Tắc Cốt Lõi Bắt Buộc (Hard Locks)

Bất kỳ hành vi vi phạm nào đối với 5 Hard Locks dưới đây đều được xem là lỗi nghiêm trọng (Critical Violation):

1. **Vòng đời phát triển 11 bước (11-Stage Lifecycle):**
   Mọi Phase / Task phát triển phải tuân thủ nghiêm ngặt theo đúng trình tự tuần tự 11 bước:
   $$\text{GRILL} \rightarrow \text{PLAN APPROVED} \rightarrow \text{IMPLEMENT} \rightarrow \text{TEST} \rightarrow \text{FIX ↺} \rightarrow \text{TEST PASS} \rightarrow \text{AUDIT} \rightarrow \text{HARDEN} \rightarrow \text{REGRESSION PASS} \rightarrow \text{ACCEPTED} \rightarrow \text{CLOSED}$$
   - **TUYỆT ĐỐI KHÔNG NHẢY BƯỚC.**
   - Phải báo cáo rõ ràng trạng thái hiện tại kèm tiêu chí đầu ra (Exit Criteria) trước khi chuyển bước.

2. **Khóa an toàn Git tuyệt đối (Git Safety Lock):**
   - **TUYỆT ĐỐI KHÔNG** tự ý thực thi các lệnh `git add`, `git commit`, `git push` hoặc tạo tag / switch branch phá hủy trong bất kỳ hoàn cảnh nào nếu chưa có sự phê duyệt rõ ràng bằng văn bản (Explicit Approval) từ Chủ sở hữu (User).

3. **Bảo mật Thông tin xác thực (Secret Zero Policy):**
   - **TUYỆT ĐỐI KHÔNG** hardcode mật khẩu, mã PIN, JWT Secret, URL cơ sở dữ liệu hoặc tài khoản thử nghiệm vào source code, script hay tài liệu.
   - Toàn bộ thông tin đăng nhập và kết nối nhạy cảm (`OWNER_USERNAME`, `OWNER_PASSWORD`, `JWT_SECRET`, `MONGODB_URI`) bắt buộc phải nạp qua biến môi trường (`.env.local` / `.env.example`).
   - Tệp `.gitignore` phải bảo vệ nghiêm ngặt mọi biến thể tệp môi trường (`.env*`).

4. **Chuẩn Thiết kế UI/UX (Minimal SaaS 2026–2027 & Galaxy A35 5G Pixel-Perfect):**
   - **Phong cách**: Minimal SaaS 2026–2027 (chuẩn thẩm mỹ Linear / Stripe / Vercel). Bề mặt phẳng, sạch sẽ, đường viền `1px solid` tinh tế (`border-zinc-200` / dark `border-zinc-800`), độ tương phản cao, tối ưu 100% cho tốc độ quét mắt và tốc độ nhập dữ liệu.
   - **Nghiêm cấm tuyệt đối**: Không sử dụng các hiệu ứng màu mè thừa thãi (glow, neon, gradients lòe loẹt, glassmorphism mờ đục quá đà). Không sử dụng các biểu tượng phong cách AI (sparkles, robot, magic wand) trong giao diện nghiệp vụ.
   - **Chuẩn Samsung Galaxy A35 5G Pixel-Perfect** (Màn hình 6.6", 1080x2340px, tỷ lệ 19.5:9, CSS viewport `360px–412px`):
     + Hệ lưới 4px/8px nghiêm ngặt. Triệt tiêu hoàn toàn tràn ngang màn hình (`overflow-x: hidden`).
     + Vùng chạm cảm ứng (Touch Targets) tối thiểu `44px x 44px` (`h-11` hoặc `h-12`).
     + Kích thước chữ trong tất cả thẻ `<input>`, `<select>`, `<textarea>` bắt buộc $\ge 16\text{px}$ (`text-base`) để ngăn trình duyệt di động tự động phóng to (auto-zoom).
     + Toàn bộ cột hiển thị số lượng, đơn giá, tổng tiền VNĐ và ngày tháng bắt buộc áp dụng `tabular-nums` (`font-mono` hoặc `tabular-nums`) để căn thẳng hàng dọc tuyệt đối.

5. **Tài liệu Song ngữ (Bilingual Documentation):**
   - Mọi tài liệu kỹ thuật, hướng dẫn sử dụng, roadmap và báo cáo nghiệm thu phải có đầy đủ 2 phiên bản song song: `README.md` (Tiếng Việt) và `README_en.md` (Tiếng Anh), đảm bảo tương đồng 100% về nội dung và cấu trúc.

---

## 3. Thứ Tự Ưu Tiên Áp Dụng Quy Tắc (Rule Priority)

Khi có sự chồng chéo hoặc mâu thuẫn, áp dụng theo thứ tự ưu tiên giảm dần:

1. **Yêu cầu chỉ đạo trực tiếp của User (User's Explicit Directive)**
2. **Quy tắc an toàn Git & Bảo mật Secret Zero (`git-safety-and-secrets.md`)**
3. **Quy chuẩn UI/UX Minimal SaaS & Galaxy A35 5G (`ui-ux-design-rules.md`)**
4. **Quy tắc Vòng đời phát triển 11 bước (`lifecycle-11-stages.md`)**
5. **Quy tắc chung Master này (`setting-rules.md`)**
6. **Kiến trúc Fullstack & Cơ sở dữ liệu (`fullstack-architecture.md`)**
7. **Quy chuẩn Kiểm thử & Nghiệm thu (`testing-and-verification.md`)**
8. **Chính sách Ngôn ngữ & Tài liệu song ngữ (`language-and-docs.md`)**

*Lưu ý: Nếu có mâu thuẫn ảnh hưởng tới an ninh dữ liệu, tính tương thích ngược hoặc an toàn mã nguồn, Agent phải dừng lại và xin ý kiến User.*

---

## 4. Nguyên Tắc Kỹ Thuật Kế Thừa (Core Engineering Principles)

Kế thừa các tinh hoa kỹ thuật từ `imenu-menudientu-dev` và `imenu-api-dev`:

1. **Kiến trúc Zero-Bloat & Tái sử dụng tối đa**:
   - Không cài đặt thêm thư viện bên thứ ba nếu bài toán có thể giải quyết sạch sẽ bằng Web APIs tiêu chuẩn hoặc các tiện ích cốt lõi sẵn có.
   - Thư viện giao diện và icons chỉ sử dụng icons nghiệp vụ tiêu chuẩn (Lucide Icons: Plus, Trash2, Search, Filter, Calendar, DollarSign, ArrowUpDown, ChevronDown...).

2. **Tính Đóng gói & Phân tách Rõ Ràng (Separation of Concerns)**:
   - Tách biệt rõ ràng giữa Data Access (Schema/Model) $\rightarrow$ Business Logic (Service) $\rightarrow$ API / Action Controller $\rightarrow$ Presentation (UI Components).
   - Component giao diện phải mỏng (Thin Components), không nhồi nhét xử lý tính toán tài chính trực tiếp bên trong JSX/TSX.

3. **Toàn vẹn Dữ liệu Tài chính (Financial & Calculation Precision)**:
   - Các phép tính cộng/trừ tiền tệ, số lượng nhập hàng, đơn giá phải đảm bảo độ chính xác số học nguyên vẹn (xử lý làm tròn chuẩn mực theo đơn vị đồng VNĐ).
   - Không để xảy ra lỗi sai lệch số thập phân (floating-point precision issues).

4. **Kiểm tra và Khảo sát trước khi Triển khai (Inspect Before Action)**:
   - Luôn đọc và kiểm tra cấu trúc hiện có trước khi tạo file mới hoặc sửa đổi code.
   - Tuyệt đối không giả định hay đoán mò sự tồn tại của các hàm, schema hoặc biến môi trường.

