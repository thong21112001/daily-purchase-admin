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
5. [Cơ Chế Bảo Mật Single-Owner (Secret-Zero)](#5-cơ-chế-bảo-mật-single-owner-secret-zero)
6. [Cài Đặt & Khởi Chạy Cục Bộ](#6-cài-đặt--khởi-chạy-cục-bộ)
7. [Bộ Kiểm Thử Tự Động (Automated Test Suites)](#7-bộ-kiểm-thử-tự-động-automated-test-suites)
8. [Lộ Trình Dự Án & Trạng Thái Nghiệm Thu](#8-lộ-trình-dự-án--trạng-thái-nghiệm-thu)

---

## 1. 📖 Giới Thiệu & Mục Tiêu Dự Án

**`daily-purchase-admin`** là ứng dụng Web Fullstack chuyên dụng, được thiết kế cho **một người dùng duy nhất (Single-Owner)** để ghi chép và theo dõi toàn bộ chi phí nhập/mua hàng hóa hằng ngày (đi chợ, siêu thị hoặc nhập hàng kinh doanh cá nhân):
- **Ghi chép tức thì tại thực địa**: Mở điện thoại Samsung Galaxy A35 5G ghi nhận ngay khi vừa thanh toán: mặt hàng, số lượng, đơn vị, đơn giá, thành tiền, nơi mua.
- **Tự động học danh mục (`Auto-Learn Catalog`)**: Tự động ghi nhớ mặt hàng, đơn vị và đơn giá lần mua gần nhất để tự động gợi ý và điền sẵn ở các lần mua kế tiếp.
- **Tính toán tiền tệ 2 chiều**: Tự động tính Thành tiền từ Số lượng $\times$ Đơn giá, hoặc tự động chia ngược Đơn giá khi mua cân/mớ lẻ (Ví dụ: mua 1.5kg hết 85.000đ $\rightarrow$ tự ra đơn giá $56.667\text{ đ/kg}$).
- **Miễn phí 100% Vercel + MongoDB Atlas (M0)**: Kiến trúc tối ưu hóa kết nối Serverless, không độ trễ Cold-Start, không tốn chi phí vận hành VPS.

---

## 2. 🛠️ Kiến Trúc Kỹ Thuật & Tối Ưu Serverless

### Tech Stack
| Hạng Mục | Công Nghệ | Mô Tả |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Fullstack React 19, Server Actions & API Route Handlers |
| **Database** | MongoDB Atlas (M0 Free) | Mongoose 8 với Singleton Connection Caching (`global.mongooseCache`) |
| **Styling** | Tailwind CSS v3.4 | Hệ màu Slate/Zinc trung tính, hệ lưới 4px/8px, viền 1px solid |
| **Bảo Mật** | Web Crypto & Native JWT | Cookie HttpOnly 90 ngày, so khớp mật khẩu Timing-Safe |
| **Biểu Tượng** | Lucide React | Bộ icon nghiệp vụ tối giản, triệt tiêu 100% icon AI màu mè |
| **Thời Gian** | Múi giờ `Asia/Ho_Chi_Minh` | Chuẩn hóa `dateKey` theo giờ Việt Nam (UTC+7), chống lệch ngày khi mua đêm muộn |

---

## 3. 📱 Chuẩn Thiết Kế UI/UX & Samsung Galaxy A35 5G

Hệ thống được thiết kế theo phong cách **Minimal SaaS 2026–2027** và chuẩn hóa Pixel-Perfect cho màn hình tham chiếu **Samsung Galaxy A35 5G**:
- **Không gian hiển thị**: Màn hình 6.6", tỷ lệ 19.5:9, CSS Viewport `360px – 412px`.
- **Triệt tiêu tràn ngang**: `overflow-x: hidden` trên toàn bộ layout.
- **Vùng chạm tối thiểu (Touch Targets)**: Tất cả nút bấm và ô chọn tối thiểu `44px x 44px` (`h-11`/`h-12`).
- **Ngăn Mobile Auto-Zoom**: Cỡ chữ trong mọi thẻ `<input>`, `<select>` bắt buộc $\ge 16\text{px}$ (`text-base`).
- **Căn thẳng hàng số liệu**: Toàn bộ số lượng và tiền tệ VNĐ áp dụng `font-mono tabular-nums`.
- **Thumb Zone Ergonomics**: Nút **`+ Ghi hàng`** nằm tại trung tâm thanh điều hướng đáy (`BottomNav` `h-16`, `pb-safe`), cho phép bấm mở form nhập liệu chỉ bằng 1 chạm ngón cái.

---

## 4. 🗄️ Mô Hình Dữ Liệu Cốt Lõi (Mongoose Schemas)

1. **`Counter` (`counters`)**:
   - Quản lý bộ đếm nguyên tử (`seq`) để sinh mã phiếu mua hàng tự động theo ngày: `PO-YYYYMMDD-001`, `002`...
2. **`CatalogItem` (`catalog_items`)**:
   - Tự động tích lũy từ lịch sử: `name`, `normalizedName` (index), `category`, `defaultUnit`, `lastUnitPrice`, `minUnitPrice`, `maxUnitPrice`, `usageCount`.
3. **`PurchaseLog` (`purchase_logs`)**:
   - Lưu trữ từng đợt đi mua hàng: `code`, `purchaseDate`, `dateKey` (index), `supplier`, `paymentMethod` (`CASH` / `TRANSFER`), `items` array, `totalAmount`, `itemCount`, `note`.

---

## 5. 🔐 Cơ Chế Bảo Mật Single-Owner (Secret-Zero)

- **Không mở đăng ký công khai**: Chỉ một tài khoản Chủ sở hữu duy nhất.
- **Secret-Zero Policy (Hard Lock #3)**: Không hardcode bất kỳ mật khẩu hoặc secret nào trong source code. Toàn bộ thông tin đăng nhập đọc từ biến môi trường:
  - `OWNER_USERNAME`: Tên đăng nhập chủ quản trị.
  - `OWNER_PASSWORD`: Mật khẩu hoặc mã PIN 6 số.
  - `JWT_SECRET`: Khóa bí mật ký phiên JWT.
  - `MONGODB_URI`: Chuỗi kết nối MongoDB Atlas.
- **Middleware Guard**: `src/middleware.ts` sử dụng Web Crypto native bảo vệ toàn bộ các trang và API, chuyển hướng người dùng chưa đăng nhập về `/login`.

---

## 6. 💻 Cài Đặt & Khởi Chạy Cục Bộ

```bash
# 1. Di chuyển vào thư mục dự án
cd d:\01_HOME\005_VIBE_AI\08_daily-purchase-admin

# 2. Cấu hình biến môi trường
cp .env.example .env.local
# Mở .env.local và điền OWNER_PASSWORD, JWT_SECRET, MONGODB_URI của bạn

# 3. Chạy kiểm thử tự động
npm test

# 4. Khởi chạy môi trường phát triển (khi đã cài dependencies)
npm run dev
```

---

## 7. 🧪 Bộ Kiểm Thử Tự Động (Automated Test Suites)

| Nhóm Kiểm Thử | Số Ca Test | Trạng Thái | Mô Tả |
| :--- | :---: | :---: | :--- |
| **Financial Currency Utils** | 5 | ✅ PASS | Format VNĐ, parse chuỗi số (150k, 1.5tr), tính dòng hàng, tính ngược đơn giá, chip tiền tệ |
| **Vietnam Timezone & Date** | 6 | ✅ PASS | Sinh dateKey YYYY-MM-DD theo múi giờ Asia/Ho_Chi_Minh, hôm qua, tháng này, dải ngày |
| **Vietnamese Search Normalization** | 3 | ✅ PASS | Khử dấu tiếng Việt, tìm kiếm theo từ khóa token không dấu, sinh regex |
| **Single-Owner Authentication** | 4 | ✅ PASS | Ký và xác minh JWT HMAC-SHA256, từ chối token giả mạo, kiểm tra timing-safe password |
| **Secret-Zero Scanning Audit** | 1 | ✅ PASS | Quét toàn bộ repository, phát hiện 0 chuỗi mật khẩu/secret hardcode |
| **TỔNG CỘNG** | **19** | **100% PASS** | **Sạch lỗi 100%, sẵn sàng cho Phase 2** |

---

## 8. 🗺️ Lộ Trình Dự Án & Trạng Thái Nghiệm Thu

| Phase | Nội Dung Trọng Tâm | Trạng Thái Vòng Đời 11 Bước |
| :---: | :--- | :---: |
| **Phase 1** | Khởi tạo Next.js 15, Mongoose Singleton, 3 Schemas, Utils, Auth Single-Owner & Galaxy A35 Shell | ✅ **ĐÃ HOÀN TẤT & ĐẠT 100% TEST PASS** |
| **Phase 2** | API Route Handlers (`/purchases`, `/catalog`, `/reports`, `/export`), Auto-Learn Catalog & Integration Tests | ⏳ Sẵn sàng triển khai |
| **Phase 3** | UI Design System Minimal SaaS 2026-2027, 4 Màn hình chính Galaxy A35 5G & Desktop, Quick Entry Drawer | ⏳ Chờ Phase 2 |
| **Phase 4** | E2E Regression, Secret Scanning Audit, Cấu hình Vercel Deploy & Hướng dẫn MongoDB Atlas | ⏳ Chờ Phase 3 |

