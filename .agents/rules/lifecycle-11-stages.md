---
description: 11-Stage Development Lifecycle protocol for daily-purchase-admin. Mandatory process for all phases and tasks.
alwaysApply: true
---

# 11-STAGE DEVELOPMENT LIFECYCLE (`lifecycle-11-stages.md`)

## 1. Trình Tự Bắt Buộc 11 Bước (Mandatory Sequence)

Mọi Phase kỹ thuật, tính năng hoặc tác vụ refactor trong dự án **`daily-purchase-admin`** bắt buộc phải thực thi tuần tự theo đúng 11 bước sau:

$$\boxed{\text{GRILL}} \longrightarrow \boxed{\text{PLAN APPROVED}} \longrightarrow \boxed{\text{IMPLEMENT}} \longrightarrow \boxed{\text{TEST}} \longrightarrow \boxed{\text{FIX ↺}} \longrightarrow \boxed{\text{TEST PASS}} \longrightarrow \boxed{\text{AUDIT}} \longrightarrow \boxed{\text{HARDEN}} \longrightarrow \boxed{\text{REGRESSION PASS}} \longrightarrow \boxed{\text{ACCEPTED}} \longrightarrow \boxed{\text{CLOSED}}$$

> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG ĐƯỢC NHẢY BƯỚC.**
> Không tự ý chuyển từ PLAN sang IMPLEMENT khi chưa có sự xác nhận của User.
> Không tự ý nghiệm thu (ACCEPTED/CLOSED) khi chưa vượt qua AUDIT, HARDEN và REGRESSION PASS.

---

## 2. Chi Tiết Từng Bước & Tiêu Chí Đầu Ra (Exit Criteria)

### Bước 1: GRILL (Chất vấn & Làm rõ Yêu cầu Nghiệp vụ)
- **Mục tiêu**: Làm rõ toàn bộ góc khuất kỹ thuật, ràng buộc nghiệp vụ, các tình huống biên (edge cases) và cấu trúc dữ liệu trước khi viết kế hoạch.
- **Hành động của Agent**:
  + Đặt câu hỏi khảo sát cấu trúc, luồng người dùng, định dạng dữ liệu đầu vào.
  + Xác định phạm vi ảnh hưởng tới cơ sở dữ liệu, màn hình Galaxy A35 5G và tính toán tài chính.
- **Tiêu chí đầu ra**: Không còn bất kỳ điểm mơ hồ nào về mặt nghiệp vụ hoặc kiến trúc.

### Bước 2: PLAN APPROVED (Kế hoạch Chi tiết được Phê duyệt)
- **Mục tiêu**: Thiết lập lộ trình triển khai chi tiết, chia nhỏ thành các nhiệm vụ con có thể kiểm thử độc lập.
- **Hành động của Agent**:
  + Soạn thảo kế hoạch kỹ thuật chi tiết: danh sách file cần tạo/sửa, schema models, components, API endpoints, test cases dự kiến.
  + Trình bày bảng phân rã công việc cho User phê duyệt.
- **Tiêu chí đầu ra**: User phản hồi phê duyệt rõ ràng ("Approved", "Đồng ý", "Tiến hành").

### Bước 3: IMPLEMENT (Triển khai Mã nguồn Tinh gọn)
- **Mục tiêu**: Hiện thực hóa tính năng theo đúng bản kế hoạch đã được duyệt.
- **Hành động của Agent**:
  + Tuân thủ nguyên tắc Zero-Bloat và thiết kế Minimal SaaS 2026-2027.
  + Tuân thủ chuẩn Galaxy A35 5G (touch targets $\ge 44\text{px}$, font $\ge 16\text{px}$, `tabular-nums`).
  + Tuân thủ Secret Zero: không hardcode chuỗi nhạy cảm.
- **Tiêu chí đầu ra**: Mã nguồn hoàn thiện, không phát sinh lỗi biên dịch TypeScript.

### Bước 4: TEST (Kiểm thử Mục tiêu Tự động & Thủ công)
- **Mục tiêu**: Chạy các ca kiểm thử trực tiếp trên các module và component vừa tạo.
- **Hành động của Agent**:
  + Viết và thực thi unit tests, integration tests hoặc kịch bản kiểm thử API.
  + Kiểm tra hiển thị responsive trên viewport Galaxy A35 5G (`360px - 412px`).
- **Tiêu chí đầu ra**: Thu thập đầy đủ kết quả chạy test (log pass/fail cụ thể).

### Bước 5: FIX ↺ (Vòng lặp Sửa lỗi Triệt để)
- **Mục tiêu**: Sửa chữa các lỗi phát sinh được phát hiện từ Bước 4.
- **Hành động của Agent**:
  + Khắc phục nguyên nhân gốc rễ (Root Cause), không vá tạm bợ (patchwork).
  + Lặp lại việc chạy test cho đến khi toàn bộ lỗi biến mất.
- **Tiêu chí đầu ra**: Mã nguồn sạch lỗi, sẵn sàng cho nghiệm thu kiểm thử.

### Bước 6: TEST PASS (100% Bộ Test Mới Đạt Chuẩn)
- **Mục tiêu**: Xác nhận toàn bộ kịch bản kiểm thử của Phase/Task hiện tại đã chạy thành công 100%.
- **Hành động của Agent**:
  + Cung cấp bảng tổng kết số lượng test case, thời gian thực thi và trạng thái `100% PASS`.
- **Tiêu chí đầu ra**: 0 failed, 0 error, build production không có cảnh báo.

### Bước 7: AUDIT (Kiểm toán Đối kháng Chuyên sâu)
- **Mục tiêu**: Chủ động "tự tấn công" và rà soát lỗ hổng tiềm ẩn.
- **Hành động của Agent**:
  + **Security Audit**: Kiểm toán Secret Zero, SQL/NoSQL Injection, XSS, xác thực, rò rỉ biến môi trường.
  + **UI/UX Audit**: Rà soát từng pixel trên Galaxy A35 5G, kiểm tra tràn ngang (`overflow-x`), kiểm tra độ nảy bàn phím ảo di động che input, kiểm tra touch target $< 44\text{px}$.
  + **Data Integrity Audit**: Kiểm tra sai số làm tròn số tiền VNĐ, trùng lặp bản ghi nhập hàng.
- **Tiêu chí đầu ra**: Bảng danh sách các điểm phát hiện kiểm toán (Findings: AUD-X.1, AUD-X.2...).

### Bước 8: HARDEN (Gia cố Hệ thống Chống Lỗi)
- **Mục tiêu**: Triển khai giải pháp gia cố cho toàn bộ các phát hiện từ Bước 7.
- **Hành động của Agent**:
  + Bổ sung guards, validation rules, debounce, tối ưu bộ nhớ.
  + Thắt chặt regex, chống nhập âm tiền, chống click đúp gây tạo trùng đơn nhập hàng.
- **Tiêu chí đầu ra**: Tất cả các phát hiện trong bản kiểm toán AUDIT đều có giải pháp gia cố hoàn tất.

### Bước 9: REGRESSION PASS (Kiểm thử Hồi quy Toàn diện)
- **Mục tiêu**: Bảo đảm tính năng mới không làm hỏng bất kỳ tính năng cũ nào của các Phase trước.
- **Hành động của Agent**:
  + Chạy toàn bộ master test runner từ Phase 1 đến Phase hiện tại.
  + Chạy `npm run build` để kiểm tra khả năng biên dịch toàn dự án.
- **Tiêu chí đầu ra**: 100% suite hồi quy đạt PASS, 0 suy thoái (Zero-Regression).

### Bước 10: ACCEPTED (Khách hàng Nghiệm thu Tính năng)
- **Mục tiêu**: Trình diễn thành quả và nhận sự phê duyệt nghiệm thu từ User.
- **Hành động của Agent**:
  + Báo cáo tóm tắt tính năng hoàn thành, hình ảnh/kết quả thực thi, báo cáo test và audit.
  + Chờ User xác nhận nghiệm thu.
- **Tiêu chí đầu ra**: User xác nhận đồng ý nghiệm thu Phase/Task.

### Bước 11: CLOSED (Đóng Phase & Đồng bộ Tài liệu Song ngữ)
- **Mục tiêu**: Hoàn tất bàn giao và lưu trữ trạng thái sạch sẽ.
- **Hành động của Agent**:
  + Cập nhật đồng thời `README.md` (Tiếng Việt) và `README_en.md` (Tiếng Anh).
  + Dọn dẹp các tệp log tạm, file nháp thử nghiệm.
  + Ghi nhận trạng thái Phase: `✅ ĐÃ NGHIỆM THU — ĐÓNG CHÍNH THỨC`.
  + **Nhắc nhở User về Git**: Báo cáo sẵn sàng cho lệnh Git (nhưng KHÔNG tự ý thực thi).
- **Tiêu chí đầu ra**: Tài liệu song ngữ đồng bộ 100%, sẵn sàng cho Phase tiếp theo.

---

## 3. Định Dạng Báo Cáo Trạng Thái Bắt Buộc (Status Badge Reporting)

Trong mọi câu trả lời trao đổi tiến độ với User, Agent BẮT BUỘC phải mở đầu hoặc kết thúc bằng khối trạng thái chuẩn hóa:

```markdown
### 🔄 TIẾN ĐỘ VÒNG ĐỜI 11 BƯỚC (LIFECYCLE STATUS)
- **Dự án**: daily-purchase-admin
- **Phase hiện tại**: Phase X - [Tên Phase]
- **Bước hiện tại**: [TÊN_BƯỚC] (ví dụ: `[1/11] GRILL` hoặc `[2/11] PLAN APPROVED`)
- **Trạng thái**: [Đang thảo luận / Chờ User phê duyệt / Đang thực thi / Đã hoàn tất]
- **Tiêu chí chuyển bước**: [Mô tả điều kiện cần để chuyển sang bước kế tiếp]
```

