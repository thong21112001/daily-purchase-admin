---
description: Language policy and bilingual documentation standards for daily-purchase-admin. Enforces parity between README.md and README_en.md.
alwaysApply: true
---

# LANGUAGE POLICY & BILINGUAL DOCUMENTATION (`language-and-docs.md`)

## 1. Chuẩn Tài Liệu Song Ngữ (Bilingual Documentation - Hard Lock #5)

> [!IMPORTANT]
> **QUY TẮC CỐT LÕI (HARD LOCK #5):**
> Mọi tài liệu hướng dẫn kỹ thuật, kiến trúc, sơ đồ thực thể, quy trình vận hành và nhật ký nghiệm thu Phase bắt buộc phải được duy trì song song với độ tương đồng 100% nội dung giữa 2 phiên bản:
> - `README.md`: Phiên bản Tiếng Việt chuẩn.
> - `README_en.md`: Phiên bản Tiếng Anh kỹ thuật quốc tế (Professional English).

### 1.1. Yêu Cầu Đồng Bộ (Sync Requirement)
- Khi hoàn thành hoặc đóng một Phase (`[11/11] CLOSED`):
  + Cập nhật bảng trạng thái nghiệm thu đồng thời trong cả hai tệp `README.md` và `README_en.md`.
  + Ghi rõ số lượng test cases, kết quả kiểm toán AUDIT và các tính năng mới đã hoàn tất.
  + Không bao giờ để xảy ra tình trạng `README.md` có thông tin mới nhưng `README_en.md` bị bỏ quên hoặc tụt lại phía sau.

### 1.2. Cấu Trúc Khung Tài Liệu Chuẩn (Standard Documentation Outline)
Cả hai tệp `README.md` và `README_en.md` phải tuân thủ khung cấu trúc nhất quán:
1. Header & Shields/Badges (Tech stack, version, test status).
2. Mục lục (Table of Contents).
3. Giới thiệu & Phạm vi Nghiệp vụ (Introduction & Business Scope).
4. Kiến trúc Kỹ thuật & Công nghệ (Tech Stack & Architecture).
5. Chuẩn UI/UX Minimal SaaS & Galaxy A35 5G Mobile Specification.
6. Mô hình Dữ liệu & Sơ đồ Thực thể (Data Modeling & Entity Schemas).
7. Hướng dẫn Cài đặt & Khởi chạy (Installation & Quick Start).
8. Cấu hình Môi trường & Bảo mật Secret Zero (Environment Configuration).
9. Bộ Kiểm Thử Tự Động & Hồi Quy (Automated Testing & Full Regression).
10. Nhật Ký Tiến Độ 11 Bước & Lộ Trình Nghiệm Thu Các Phase (Phase Progress & Changelog).

---

## 2. Quy Định Ngôn Ngữ Trong Mã Nguồn (Code Language Standards)

### 2.1. Mã Nguồn Tiếng Anh 100% (English for Code Artifacts)
Toàn bộ định danh trong mã nguồn phải sử dụng tiếng Anh chuẩn kỹ thuật:
- Tên biến, hàm, class, module:
  + ✅ Đúng: `calculateReceiptTotal()`, `getLatestPurchasePrice()`, `PurchaseReceiptService`
  + ❌ Sai: `tinhTongTienPhieu()`, `layGiaNhapMoiNhat()`, `PhieuNhapHangService`
- Tên tệp và thư mục (kebab-case):
  + ✅ Đúng: `purchase-receipt.model.ts`, `supplier.controller.ts`
  + ❌ Sai: `phieu-nhap.ts`, `nha-cung-cap.controller.ts`
- Commit messages (khi được User cho phép thực thi git):
  + ✅ Đúng: `feat: implement fast-entry mobile purchase receipt form for Galaxy A35`
  + ❌ Sai: `them chuc nang nhap hang`

### 2.2. Nhãn Giao Diện Người Dùng Tiếng Việt (Vietnamese UI Copy)
- Do hệ thống phục vụ người dùng quản trị và chủ mua hàng tại Việt Nam:
  + Toàn bộ nhãn form, tiêu đề bảng, thông báo lỗi nghiệp vụ, placeholder, toast notification hiển thị trên màn hình phải bằng Tiếng Việt tự nhiên, chuẩn mực kế toán (ví dụ: *"Tên hàng hóa"*, *"Đơn giá nhập"*, *"Số lượng"*, *"Nhà cung cấp"*, *"Lưu phiếu nhập"*).

