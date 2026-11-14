# 🛒 Sổ Quản Trị Nhập Hàng Cá Nhân (Daily Purchase Admin)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel%20Serverless-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**Hệ thống Quản trị Theo dõi Chi phí Mua sắm & Nhập Hàng Hóa Cá nhân Siêu Tốc Chuẩn Minimal SaaS 2026–2027**  
*Tài liệu Tiếng Anh: [English README (README_en.md)](README_en.md)*

</div>

---

## 📋 Mục Lục
1. [Giới Thiệu & Mục Tiêu Dự Án](#1-giới-thiệu--mục-tiêu-dự-án)
2. [Kiến Trúc Kỹ Thuật & Tối Ưu Serverless](#2-kiến-trúc-kỹ-thuật--tối-ưu-serverless)
3. [Chuẩn Thiết Kế UI/UX & Samsung Galaxy A35 5G](#3-chuẩn-thiết-kế-uiux--samsung-galaxy-a35-5g)
4. [Mô Hình Dữ Liệu Cốt Lõi (Mongoose Schemas)](#4-mô-hình-dữ-liệu-cốt-lõi-mongoose-schemas)
5. [Hệ Thống API Endpoints & Nghiệp Vụ Phase 2](#5-hệ-thống-api-endpoints--nghiệp-vụ-phase-2)
6. [Hệ Thống Giao Diện & Trải Nghiệm Nhập Hàng Phase 3](#6-hệ-thống-giao-diện--trải-nghiệm-nhập-hàng-phase-3)
7. [Cơ Chế Bảo Mật Single-Owner (Secret-Zero)](#7-cơ-chế-bảo-mật-single-owner-secret-zero)
8. [Cài Đặt & Khởi Chạy Cục Bộ](#8-cài-đặt--khởi-chạy-cục-bộ)
9. [Bộ Kiểm Thử Tự Động (Automated Test Suites)](#9-bộ-kiểm-thử-tự-động-automated-test-suites)
10. [Lộ Trình Dự Án & Trạng Thái Nghiệm Thu](#10-lộ-trình-dự-án--trạng-thái-nghiệm-thu)

---

## 1. 📖 Giới Thiệu & Mục Tiêu Dự Án

**`daily-purchase-admin`** là ứng dụng Web Fullstack chuyên dụng, được thiết kế cho **một người dùng duy nhất (Single-Owner)** để ghi chép và theo dõi toàn bộ chi phí nhập/mua hàng hóa hằng ngày (đặc biệt tối ưu hóa cho mua sắm nguyên liệu & vật tư quán cà phê, đồ ăn thức uống, đi chợ hằng ngày):
- **Ghi chép tức thì tại thực địa**: Mở điện thoại Samsung Galaxy A35 5G ghi nhận ngay khi vừa thanh toán: mặt hàng, số lượng, đơn vị, đơn giá, thành tiền, nơi mua.
- **Mã phiếu độc lập theo đợt**: Mỗi lần lưu phiếu tự động sinh mã nguyên tử `PO-YYYYMMDD-XXX` độc lập, rõ ràng theo từng lần đi mua.
- **Tự động học danh mục (`Auto-Learn Catalog`)**: Tự động ghi nhớ mặt hàng, đơn vị và đơn giá lần mua gần nhất để tự động gợi ý và điền sẵn ở các lần mua kế tiếp (hỗ trợ danh mục mẫu sẵn có cho ngành cà phê).
- **Tính toán tiền tệ 2 chiều**: Tự động tính Thành tiền từ Số lượng $\times$ Đơn giá, hoặc tự động chia ngược Đơn giá khi mua cân/mớ lẻ (Ví dụ: mua 1.5kg hết 85.000đ $\rightarrow$ tự ra đơn giá $56.667\text{ đ/kg}$).
- **Miễn phí 100% Vercel + MongoDB Atlas (M0)**: Kiến trúc tối ưu hóa kết nối Serverless, không độ trễ Cold-Start, không tốn chi phí vận hành VPS.

---

## 2. 🛠️ Kiến Trúc Kỹ Thuật & Tối Ưu Serverless

### Tech Stack
| Hạng Mục | Công Nghệ | Mô Tả |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Fullstack React 19, Server Actions & API Route Handlers |
| **Database** | MongoDB Atlas (M0 Free) | Mongoose 8 với Singleton Connection Caching (`global.mongooseCache`) |
| **Styling** | Tailwind CSS v3.4 | Hệ màu Zinc/Slate trung tính, hệ lưới 4px/8px, viền 1px solid |
| **Bảo Mật** | Web Crypto & Native JWT | Cookie HttpOnly 90 ngày, so khớp mật khẩu Timing-Safe |
| **Biểu Tượng** | Lucide React | Bộ icon nghiệp vụ tối giản, triệt tiêu 100% icon AI màu mè |
| **Thời Gian** | Múi giờ `Asia/Ho_Chi_Minh` | Chuẩn hóa `dateKey` theo giờ Việt Nam (UTC+7), chống lệch ngày khi mua đêm muộn |

---

## 3. 📱 Chuẩn Thiết Kế UI/UX & Samsung Galaxy A35 5G

Hệ thống được thiết kế theo phong cách **Minimal SaaS 2026–2027** và chuẩn hóa Pixel-Perfect cho màn hình tham chiếu **Samsung Galaxy A35 5G**:
- **Không gian hiển thị**: Màn hình 6.6", tỷ lệ 19.5:9, CSS Viewport `360px – 412px`.
- **Chống Auto-Zoom trên Mobile**: Mọi thẻ `<input>`, `<select>`, `<textarea>` bắt buộc $\ge 16\text{px}$ (`text-base`).
- **Hitbox tối thiểu 44px**: Vùng chạm phím, nút bấm, tab điều hướng đáy tối thiểu $44\text{px} \times 44\text{px}$ (`min-h-[44px]`, `h-11`, `h-12`).
- **Căn thẳng hàng tiền tệ**: Dùng `tabular-nums font-mono` cho tất cả các số lượng, đơn giá, thành tiền VNĐ.
- **Không tràn ngang**: Layout bảo đảm `overflow-x: hidden` trên toàn bộ khung nhìn.
- **Triệt tiêu AI Icons**: Tuyệt đối không dùng sparkles, wand, robot hoặc hiệu ứng gradient neon lòe loẹt.

---

## 4. 🗄️ Mô Hình Dữ Liệu Cốt Lõi (Mongoose Schemas)

1. **`Counter` (`counter.model.ts`)**: Quản lý bộ đếm nguyên tử `seq` tăng dần theo ngày để sinh mã phiếu `PO-YYYYMMDD-XXX`.
2. **`CatalogItem` (`catalog-item.model.ts`)**: Lưu danh mục mặt hàng tự động học:
   - `name`, `normalizedName` (indexed), `category`, `defaultUnit`, `lastUnitPrice`, `minUnitPrice`, `maxUnitPrice`, `usageCount`.
3. **`PurchaseLog` (`purchase-log.model.ts`)**: Lưu phiếu nhập hàng:
   - `code` (unique), `purchaseDate`, `dateKey` (`YYYY-MM-DD` giờ VN), `supplier`, `paymentMethod` (`CASH` | `TRANSFER`), `items` (`name`, `category`, `unit`, `quantity`, `unitPrice`, `lineTotal`, `note`), `totalAmount`, `itemCount`, `note`.

---

## 5. 🔌 Hệ Thống API Endpoints & Nghiệp Vụ Phase 2

- `POST /api/purchases`: Tạo đợt nhập hàng mới (sinh mã nguyên tử `PO-YYYYMMDD-XXX`, cập nhật tự động học Catalog).
- `GET /api/purchases`: Tra cứu lịch sử theo ngày, khoảng ngày hoặc từ khóa không dấu.
- `GET /api/purchases/[id]` & `PUT`, `DELETE`: Xem, sửa và xóa phiếu.
- `GET /api/catalog`: Tìm kiếm gợi ý tức thì (`?q=...`) hoặc danh sách phân trang (`?category=...&page=...`).
- `GET /api/catalog?seed=true`: Nạp nhanh 17 mặt hàng mẫu ngành F&B / Quán Cà phê.
- `POST /api/catalog` & `PUT`, `DELETE`: Thao tác CRUD danh mục.
- `GET /api/reports`: Báo cáo KPI, biểu đồ chi tiêu ngày, cơ cấu nhóm hàng và Top 10 chi phí lớn nhất.
- `GET /api/export/csv`: Xuất bảng tính Excel với UTF-8 BOM (`\uFEFF`) không lỗi font.
- `GET /api/export/backup`: Tải file JSON sao lưu toàn bộ dữ liệu.
- `POST /api/export/backup`: Khôi phục dữ liệu theo cơ chế Merge/Upsert an toàn (Choice A).

---

## 6. 🎨 Hệ Thống Giao Diện & Trải Nghiệm Nhập Hàng Phase 3

### 6.1. Khung Điều Hướng Thích Ứng (Adaptive Layout Shell)
- **Desktop ($\ge 1024\text{px}$)**: `DesktopSidebar` cố định bên trái (`w-64`) với menu 4 mục và nút "+ Ghi hàng" nổi bật.
- **Galaxy A35 5G Mobile ($< 1024\text{px}$)**:
  - `MobileTopHeader`: Header mỏng hiển thị ngày hiện tại, tổng tiền hôm nay và nút làm mới nhanh.
  - `MobileBottomNav`: Thanh đáy cố định (`h-16`, `pb-safe`) với 4 tab và **nút tròn trung tâm `+ Ghi hàng`** nằm ngay tầm ngón cái.

### 6.2. Drawer Nhập Hàng Siêu Tốc 1 Chạm (`QuickEntryDrawer`)
- **Chế độ 1 - Ghi lẻ từng món siêu tốc (`QuickSingleItemForm`)**:
  - Gợi ý mặt hàng tức thì (`ItemAutocomplete`) 0.1s không dấu, tự điền đơn vị và giá cũ.
  - Tính toán 2 chiều (Số lượng $\times$ Đơn giá $\rightarrow$ Thành tiền, hoặc Số lượng + Tổng tiền trả $\rightarrow$ Đơn giá).
  - Chip mệnh giá tiền tệ cố định (10k, 20k, 50k, 100k, 200k, 500k) và gợi ý động theo số gõ.
- **Chế độ 2 - Ghi theo hóa đơn/lần đi chợ (`BatchReceiptForm`)**:
  - Nhập nhiều món liên tiếp trên cùng 1 phiếu đi chợ.
  - Tự động cộng dồn thành tiền thời gian thực.

### 6.3. Bốn Màn Hình Quản Trị Cốt Lõi
1. **Trang 1: Hôm nay (`/`)**:
   - 3 Bento KPI cards tối giản: Hôm nay, Hôm qua, Lũy kế tháng này.
   - Dòng thời gian các đợt mua hàng trong ngày, chi tiết từng món và nút xóa nhanh.
   - Empty state với nút kêu gọi hành động lớn.
2. **Trang 2: Sổ theo ngày (`/history`)**:
   - Bộ lọc thời gian (Hôm nay, Hôm qua, 7 ngày qua, Tháng này, Tất cả).
   - Tìm kiếm tức thì không dấu theo món, nơi mua, mã phiếu.
   - Gom nhóm dạng Accordion theo `dateKey` với tổng tiền ngày in đậm.
3. **Trang 3: Mặt hàng & Giá (`/catalog`)**:
   - Lọc theo nhóm hàng (Cà phê, Sữa, Bao bì, Nông sản...).
   - Thẻ mặt hàng hiển thị Giá gần nhất, Min - Max và số lần mua.
   - Modal thêm / sửa mặt hàng và nút nạp mẫu F&B một chạm.
4. **Trang 4: Báo cáo & Sao lưu (`/reports`)**:
   - Bộ chọn tháng với biểu đồ thanh CSS thuần (`SpendingBarList`).
   - Phân bổ theo nhóm danh mục (`CategoryBreakdown`) kèm thanh tỷ trọng %.
   - Bảng xếp hạng Top 10 mặt hàng tốn kém nhất (`TopSpendingList`).
   - Khối xuất file Excel (CSV) và sao lưu / khôi phục JSON (Merge Strategy).

---

## 7. 🔐 Cơ Chế Bảo Mật Single-Owner (Secret-Zero)

- Toàn bộ bí mật (`OWNER_USERNAME`, `OWNER_PASSWORD`, `JWT_SECRET`, `MONGODB_URI`) được đọc từ biến môi trường.
- JWT ký bằng thuật toán HMAC-SHA256 bản địa (Native Node.js Crypto / Web Crypto), lưu trong Cookie `HttpOnly; Secure; SameSite=Lax` thời hạn 90 ngày.
- Middleware Edge chặn toàn bộ truy cập trái phép vào Dashboard và `/api/*`.

---

## 8. 💻 Cài Đặt & Khởi Chạy Cục Bộ

```bash
# 1. Di chuyển vào thư mục dự án
cd 08_daily-purchase-admin

# 2. Cấu hình biến môi trường
cp .env.example .env.local

# 3. Chạy toàn bộ bộ kiểm thử tự động
npm test

# 4. Khởi chạy máy chủ phát triển
npm run dev
```

---

## 9. 🧪 Bộ Kiểm Thử Tự Động (Automated Test Suites)

| Nhóm Kiểm Thử | Số Ca Test | Trạng Thái | Mô Tả |
| :--- | :---: | :---: | :--- |
| **Phase 3 UI Logic & Workflow Verification** | 4 | ✅ PASS | Tính toán 2 chiều xuôi - ngược, dãy chip tiền tệ cố định & động, cộng dồn hóa đơn, auto-complete F&B |
| **Samsung Galaxy A35 5G UI/UX Audit** | 5 | ✅ PASS | Cỡ chữ $\ge 16\text{px}$ chống auto-zoom, touch targets $\ge 44\text{px}$, căn lề `tabular-nums`, triệt tiêu 100% icon AI, chống tràn ngang |
| **Purchase Workflow & Auto-Learn** | 3 | ✅ PASS | Sinh mã PO nguyên tử, tính toán 2 chiều, máy trạng thái Auto-Learn cập nhật dải giá |
| **Reports Aggregation & Analytics** | 3 | ✅ PASS | Tổng hợp KPI theo dateKey VN, tính tỷ trọng phần trăm nhóm hàng, xếp hạng Top chi tiêu |
| **CSV Export & JSON Backup Merge** | 3 | ✅ PASS | Tiền tố UTF-8 BOM, cấu trúc file backup JSON, cơ chế Merge / Upsert an toàn |
| **Financial Currency Utils** | 5 | ✅ PASS | Format VNĐ, parse chuỗi số (150k, 1.5tr), tính dòng hàng, tính ngược đơn giá, chip tiền tệ |
| **Vietnam Timezone & Date** | 6 | ✅ PASS | Sinh dateKey YYYY-MM-DD theo múi giờ Asia/Ho_Chi_Minh, hôm qua, tháng này, dải ngày |
| **Vietnamese Search Normalization** | 3 | ✅ PASS | Khử dấu tiếng Việt, tìm kiếm theo từ khóa token không dấu, sinh regex |
| **Single-Owner Authentication** | 4 | ✅ PASS | Ký và xác minh JWT HMAC-SHA256, từ chối token giả mạo, kiểm tra timing-safe password |
| **Secret-Zero Scanning Audit** | 1 | ✅ PASS | Quét toàn bộ repository, phát hiện 0 chuỗi mật khẩu/secret hardcode |
| **TỔNG CỘNG** | **36** | **100% PASS** | **36/36 tests PASS, sạch lỗi 100%, sẵn sàng bàn giao Phase 3** |

---

## 10. 🗺️ Lộ Trình Dự Án & Trạng Thái Nghiệm Thu

| Phase | Nội Dung Trọng Tâm | Trạng Thái Vòng Đời 11 Bước |
| :---: | :--- | :---: |
| **Phase 1** | Khởi tạo Next.js 15, Mongoose Singleton, 3 Schemas, Utils, Auth Single-Owner & Galaxy A35 Shell | ✅ **ĐÃ HOÀN TẤT & ĐẠT 100% TEST PASS** |
| **Phase 2** | API Route Handlers (`/purchases`, `/catalog`, `/reports`, `/export`), Auto-Learn Catalog & Integration Tests | ✅ **ĐÃ HOÀN TẤT & ĐẠT 100% TEST PASS** |
| **Phase 3** | UI Design System Minimal SaaS 2026-2027, 4 Màn hình Galaxy A35 5G & Desktop, Quick Entry Drawer | ✅ **ĐÃ HOÀN TẤT & ĐẠT 100% TEST PASS** |
| **Phase 4** | E2E Regression, Secret Scanning Audit, Cấu hình Vercel Deploy & Hướng dẫn MongoDB Atlas | ⏳ Sẵn sàng khởi động |
