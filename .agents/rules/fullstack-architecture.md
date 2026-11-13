---
description: Fullstack Architecture and Data Modeling rules for daily-purchase-admin. Clean layer separation, Mongoose best practices, and API contracts.
alwaysApply: true
---

# FULLSTACK ARCHITECTURE & DATA MODELING (`fullstack-architecture.md`)

## 1. Ranh Giới Kiến Trúc (Architectural Boundaries)

Kế thừa mô hình phân tầng chặt chẽ từ `imenu-api-dev` và `imenu-menudientu-dev`:

```text
┌────────────────────────────────────────────────────────┐
│             Presentation Layer (UI / Mobile)           │
│  - Galaxy A35 5G Optimized Components                  │
│  - Fast Input Forms & Sticky Bottom Actions            │
│  - Tabular Numbers & Currency Formatters               │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / Fetch / Actions
┌───────────────────────────▼────────────────────────────┐
│               API Controller & DTO Validation           │
│  - Standard Response Envelope                          │
│  - Strict Input Sanitization & Type Coercion           │
│  - JWT Bearer Authentication / Owner Guard             │
└───────────────────────────┬────────────────────────────┘
                            │ Service Invocations
┌───────────────────────────▼────────────────────────────┐
│                Domain & Service Layer                  │
│  - Financial Computations (Exact Integer Arithmetic)   │
│  - Idempotency & Concurrency Locks                     │
│  - Activity & Audit Logging                            │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose Operations
┌───────────────────────────▼────────────────────────────┐
│               Data Access & Storage (MongoDB)          │
│  - Optimized Compound Indexes                          │
│  - Strict Schema Validation & Timestamps               │
└────────────────────────────────────────────────────────┘
```

---

## 2. Chuẩn Phản Hồi API (Standard API Envelope)

Mọi API endpoint phải trả về cấu trúc đồng nhất, không trả về raw arrays hoặc raw objects:

### Phản Hồi Thành Công (Success Envelope):
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... },
  "message": "Phiếu nhập hàng đã được lưu thành công",
  "timestamp": "2026-11-13T15:00:00.000Z"
}
```

### Phản Hồi Lỗi (Error Envelope):
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Số lượng nhập hàng phải lớn hơn 0",
  "timestamp": "2026-11-13T15:00:00.000Z"
}
```

---

## 3. Mô Hình Thực Thể Nghiệp Vụ Cốt Lõi (Core Domain Entities)

### 3.1. Danh Mục Hàng Hóa (`Item` / `Product`)
- `code`: Mã hàng hóa (ví dụ: `HH-001`), tự sinh hoặc người dùng nhập, unique index.
- `name`: Tên mặt hàng (ví dụ: "Cà phê Robusta Mộc").
- `category`: Nhóm phân loại (ví dụ: "Nguyên liệu pha chế", "Vật tư tiêu hao").
- `unit`: Đơn vị tính (kg, gói, hộp, chai, cái, thùng...).
- `defaultSupplierId`: Nhà cung cấp mặc định (ObjectId ref `Supplier`).
- `latestPurchasePrice`: Giá nhập gần nhất (dùng để gợi ý tự động khi nhập đơn mới).
- `status`: Trạng thái (`active`, `archived`).
- `timestamps`: `createdAt`, `updatedAt`.

### 3.2. Nhà Cung Cấp (`Supplier`)
- `name`: Tên nhà cung cấp / đại lý / người bán.
- `phone`: Số điện thoại liên hệ.
- `address`: Địa chỉ kho hàng / cửa hàng.
- `totalPurchased`: Tổng lũy kế giá trị đã mua.
- `currentDebt`: Công nợ hiện tại chưa thanh toán.
- `status`: `active` / `inactive`.

### 3.3. Phiếu Nhập & Mua Hàng Hóa (`PurchaseReceipt`)
- `receiptCode`: Mã phiếu nhập duy nhất (ví dụ: `PN-20261113-001`), unique index.
- `purchaseDate`: Ngày nhập hàng (mặc định là ngày tạo phiếu).
- `supplierId`: Tham chiếu nhà cung cấp (ObjectId ref `Supplier`).
- `supplierName`: Tên nhà cung cấp tại thời điểm tạo phiếu (denormalized).
- `items`: Mảng danh sách mặt hàng nhập:
  + `itemId`: ObjectId ref `Item`.
  + `itemName`: Tên mặt hàng.
  + `unit`: Đơn vị tính.
  + `quantity`: Số lượng nhập ($\ge 0$).
  + `unitPrice`: Đơn giá nhập ($\ge 0$).
  + `lineTotal`: Thành tiền dòng hàng ($\text{quantity} \times \text{unitPrice}$).
- `subTotal`: Tổng tiền hàng trước chiết khấu.
- `discountAmount`: Tiền giảm giá / chiết khấu.
- `totalAmount`: Tổng tiền phải thanh toán ($\text{subTotal} - \text{discountAmount}$).
- `paidAmount`: Số tiền đã trả thực tế.
- `debtAmount`: Tiền còn nợ lại ($\text{totalAmount} - \text{paidAmount}$).
- `paymentMethod`: Phương thức thanh toán (`Cash`, `VietQR`, `BankTransfer`, `Debt`).
- `note`: Ghi chú thêm.
- `status`: `completed`, `draft`, `cancelled`.
- `idempotencyKey`: Khóa chống bấm đúp tạo trùng phiếu trên mobile.

### 3.4. Báo Cáo & Thống Kê Tổng Hợp (`Analytics / DailySummary`)
- Truy vấn tổng hợp tổng tiền nhập theo ngày (`day`), theo tuần (`week`), theo tháng (`month`).
- Phát hiện biến động giá: Cảnh báo khi đơn giá nhập mới tăng $> 10\%$ so với `latestPurchasePrice`.

---

## 4. Quy Tắc Toàn Vẹn Số Học & Tài Chính (Financial Integrity)

1. **Không dùng số chấm động làm tròn tùy tiện**:
   - Mọi phép nhân $\text{quantity} \times \text{unitPrice}$ phải được làm tròn về số nguyên đồng VNĐ: `Math.round(quantity * unitPrice)`.
2. **Cập nhật lũy kế nguyên tử (Atomic Updates)**:
   - Khi hoàn tất phiếu nhập hàng, việc cập nhật công nợ nhà cung cấp và giá nhập gần nhất của mặt hàng phải thực thi thông qua `$inc` và `$set` nguyên tử của MongoDB hoặc trong MongoDB Transaction để chống tranh chấp dữ liệu (Race Condition).

