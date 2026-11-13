---
description: Testing and verification standards for daily-purchase-admin. Automated tests, regression enforcement, build integrity, and audit passes.
alwaysApply: true
---

# TESTING & VERIFICATION STANDARDS (`testing-and-verification.md`)

## 1. Nguyên Tắc Cốt Lõi: Không Xác Nhận Nếu Chưa Chạy Thực Tế

> [!IMPORTANT]
> Agent TUYỆT ĐỐI KHÔNG BAO GIỜ tuyên bố "Đã kiểm thử thành công" hoặc "Test passed" nếu chưa thực sự kích hoạt lệnh kiểm thử và quan sát mã thoát (exit code 0) kèm output thực tế.

---

## 2. Kim Tự Tháp Kiểm Thử (Testing Pyramid)

Hệ thống `daily-purchase-admin` áp dụng 4 tầng kiểm thử:

### 2.1. Kiểm Tra Biên Dịch & Type (Build & Type Verification)
- Sau bất kỳ thay đổi nào về TypeScript hoặc cấu hình:
  ```bash
  npm run build
  ```
- Tiêu chí đạt: 0 lỗi biên dịch, không có cảnh báo nghiêm trọng, không dùng `any` bừa bãi để dập lỗi type.

### 2.2. Kiểm Thử Đơn Vị & Nghiệp Vụ Tài Chính (Unit Tests)
- Kiểm thử các hàm tính toán:
  + Công thức tính tổng tiền: $\text{total} = \sum (\text{qty} \times \text{price}) - \text{discount}$.
  + Xử lý làm tròn số nguyên đồng VNĐ.
  + Logic cảnh báo biến động giá nhập ($> 10\%$).
  + Cơ chế chống nhập số âm (quantity $\le 0$ hoặc price $< 0$).

### 2.3. Kiểm Thử Tích Hợp API & Cơ Sở Dữ Liệu (API Integration Tests)
- Kiểm thử toàn bộ API endpoints CRUD:
  + Tạo nhà cung cấp $\rightarrow$ Tạo hàng hóa $\rightarrow$ Tạo phiếu nhập hàng.
  + Kiểm tra tính độc nhất của `receiptCode` (không cho phép tạo trùng mã phiếu).
  + Kiểm tra Idempotency Key: Khi bấm đúp 2 request cùng lúc với cùng 1 khóa, chỉ có 1 phiếu được tạo.
  + Kiểm tra cập nhật công nợ nhà cung cấp chính xác sau khi nhập hàng.

### 2.4. Kiểm Thử Hiển Thị Di Động Galaxy A35 5G (Mobile Viewport Tests)
- Thiết lập viewport kiểm thử chuẩn di động: `width: 384px`, `height: 832px` (tương đương chuẩn Galaxy A35 5G).
- Kiểm tra tự động:
  + Không xuất hiện thanh cuộn ngang ngoài ý muốn (`document.body.scrollWidth === window.innerWidth`).
  + Tất cả các nút bấm và inputs có chiều cao $\ge 44\text{px}$.
  + Cỡ chữ input computed font-size $\ge 16\text{px}$.
  + Cột số lượng và tiền tệ có class `tabular-nums` / font monospace.

---

## 3. Kiểm Thử Hồi Quy (Regression Pass Protocol)

Trước khi nghiệm thu bất kỳ Phase nào (`[9/11] REGRESSION PASS`):
1. Toàn bộ các test suite từ Phase 1 đến Phase hiện tại phải được kích hoạt thông qua script tổng hợp (ví dụ: `npm run test:all` hoặc master runner).
2. Tỷ lệ vượt qua bắt buộc: **100% PASS** (0 failed, 0 error).
3. Không được phép bình luận (comment out) hoặc bỏ qua (`test.skip`) các ca kiểm thử cũ để làm đẹp kết quả.

---

## 4. Kiểm Toán Đối Kháng & Bảo Mật (Audit & Hardening Verification)

Tại bước `[7/11] AUDIT` và `[8/11] HARDEN`:
1. **Secret Scanning**: Quét toàn bộ repository để đảm bảo không có secret / password hardcode.
2. **Double-Click Protection**: Kiểm tra UI button có trạng thái `disabled` và spinner khi đang gửi request lưu phiếu nhập.
3. **Empty Data State**: Kiểm tra giao diện hiển thị gọn gàng khi danh sách hàng hóa hoặc phiếu nhập rỗng (Empty State chuẩn SaaS, không vỡ layout).
