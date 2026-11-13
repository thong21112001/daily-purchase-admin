---
description: UI/UX Design Standards for daily-purchase-admin. Minimal SaaS 2026-2027 aesthetic and Samsung Galaxy A35 5G Pixel-Perfect mobile specifications.
alwaysApply: true
---

# UI/UX DESIGN STANDARDS & GALAXY A35 5G PIXEL-PERFECT (`ui-ux-design-rules.md`)

## 1. Phong Cách Thiết Kế Minimal SaaS 2026–2027

Hệ thống **`daily-purchase-admin`** tuân thủ chuẩn thẩm mỹ công nghệ tối giản hiện đại (Linear / Stripe / Vercel Aesthetic):

### 1.1. Bề Mặt & Màu Sắc (Surfaces & Palette)
- **Bảng màu trung tính cao cấp**: Slate / Zinc palette làm nền tảng (`zinc-50` đến `zinc-950`).
- **Đường viền sắc nét**: Hairline borders `1px solid` (`border-zinc-200` ở light mode, `border-zinc-800` ở dark mode).
- **Phẳng & Sạch sẽ (Flat & Clean)**: Loại bỏ bóng đổ nặng nề (no heavy `box-shadow`), chỉ dùng `shadow-xs` hoặc `shadow-sm` khi nâng nhẹ modal/dropdown.
- **Tập trung 100% vào dữ liệu và tốc độ**: Tối đa hóa mật độ thông tin hữu ích (Data Density), giảm khoảng trống vô nghĩa, ưu tiên các trường nhập số lượng và tiền tệ hiển thị tức thì.

### 1.2. Danh Sách Cấm Tuyệt Đối (Strictly Prohibited)
- ❌ **KHÔNG** sử dụng hiệu ứng viền phát sáng (glow, neon, pulse borders).
- ❌ **KHÔNG** sử dụng glassmorphism quá đà (background blur mờ mịt gây giảm độ tương phản và lag trên di động).
- ❌ **KHÔNG** sử dụng gradients màu mè lòe loẹt làm nền chính.
- ❌ **TUYỆT ĐỐI KHÔNG** dùng các biểu tượng mang tính chất "AI ảo hóa": `Sparkles`, `Magic Wand`, `Robot`, `Brain`, `Bot`, cũng như emojis trang trí trên các nút bấm chức năng nghiệp vụ.

### 1.3. Thư Viện Biểu Tượng Chuẩn (Permitted Utility Icons)
Chỉ sử dụng bộ icon công cụ / nghiệp vụ tối giản từ `lucide-react`:
- Thao tác: `Plus`, `Trash2`, `Edit3`, `Save`, `X`, `Check`, `RefreshCw`.
- Tìm kiếm & Lọc: `Search`, `Filter`, `Calendar`, `ArrowUpDown`, `SlidersHorizontal`.
- Điều hướng & Chỉ số: `ChevronLeft`, `ChevronRight`, `ChevronDown`, `DollarSign`, `Package`, `Truck`, `FileSpreadsheet`, `TrendingUp`, `AlertCircle`.

---

## 2. Tiêu Chuẩn Samsung Galaxy A35 5G Pixel-Perfect

Hệ thống là công cụ quản trị theo dõi nhập hàng cá nhân thực địa, do đó trải nghiệm trên điện thoại thông minh là ưu tiên hàng đầu. Thiết bị tham chiếu chuẩn xác định là **Samsung Galaxy A35 5G**:

| Thông Số Phần Cứng & Hiển Thị | Giá Trị Thực Tế | Tác Động Kỹ Thuật UI |
| :--- | :--- | :--- |
| **Kích thước màn hình** | 6.6 inch Super AMOLED | Không gian chiều dọc lớn, bố trí nội dung thoải mái |
| **Độ phân giải vật lý** | 1080 x 2340 pixels | Mật độ điểm ảnh ~390 ppi, font chữ sắc nét |
| **Tỷ lệ khung hình** | 19.5:9 | Chiều dài màn hình lớn, tối ưu danh sách cuộn dọc |
| **CSS Viewport Width** | **360px – 412px** | Viewport kiểm thử chuẩn: `384px` và `412px` |

### 2.1. Hệ Lưới 4px/8px Nghiêm Ngặt & Chống Tràn Ngang
- Toàn bộ padding, margin, khoảng cách (gap) và kích thước chiều cao phải là bội số của 4px / 8px:
  + Khoảng cách nhỏ: `gap-1` (4px), `gap-2` (8px), `p-2` (8px).
  + Khoảng cách trung bình: `p-3` (12px), `p-4` (16px), `gap-4` (16px).
  + Chiều cao thành phần: `h-8` (32px), `h-9` (36px), `h-10` (40px), `h-11` (44px), `h-12` (48px).
- **Khóa triệt để tràn ngang**:
  + Thẻ `body` và layout bao ngoài bắt buộc có `overflow-x: hidden; width: 100%; max-width: 100vw;`.
  + Tuyệt đối không để phần tử con có `width: 100vw` gây hiện tượng thanh cuộn ngang xuất hiện làm giật layout trên trình duyệt di động Samsung Internet hoặc Chrome Mobile.

### 2.2. Vùng Chạm Cảm Ứng Tối Thiểu (Touch Targets $\ge 44\text{px} \times 44\text{px}$)
- Bất kỳ phần tử nào cho phép người dùng chạm/bấm (nút bấm, dropdown select, nút xóa dòng hàng, checkbox, date picker trigger):
  + Chiều cao tối thiểu bắt buộc: `min-h-[44px]` (khuyên dùng `h-11` = 44px hoặc `h-12` = 48px).
  + Chiều rộng tối thiểu bắt buộc: `min-w-[44px]`.
  + Đối với icon buttons nhỏ (ví dụ nút xóa `Trash2`), vùng bao ngoài chạm (hitbox padding) phải đạt tối thiểu `44px x 44px` dù icon kích thước 18px hay 20px.

### 2.3. Cỡ Chữ Input Bắt Buộc $\ge 16\text{px}$ (Ngăn Mobile Auto-Zoom)
- **Nguyên nhân**: Trên cả iOS Safari và Android Chrome / Samsung Internet, khi người dùng focus vào thẻ `<input>`, `<select>` hoặc `<textarea>` có cỡ chữ nhỏ hơn 16px, trình duyệt sẽ tự động zoom-in toàn bộ màn hình, phá vỡ layout và gây ức chế khi nhập liệu nhiều dòng hàng liên tiếp.
- **Quy tắc bắt buộc**:
  + Mọi thẻ input, select, textarea phải có class: `text-base` ($\ge 16\text{px}$) trên mobile view.
  + CSS khai báo chuẩn: `font-size: 16px;` (hoặc `text-base sm:text-sm`).

### 2.4. Số Liệu Căn Dọc Tuyệt Đối Bằng `tabular-nums`
- Trong sổ sách kế toán và quản trị nhập hàng, việc so sánh các con số theo cột dọc là cốt lõi. Font chữ thông thường có độ rộng ký tự số khác nhau (số 1 hẹp hơn số 8, số 0), gây hiện tượng lệch hàng.
- **Quy tắc bắt buộc**:
  + Mọi trường hiển thị số lượng (`quantity`), đơn giá (`unitPrice`), thành tiền (`totalAmount`), thuế, chiết khấu và tổng công nợ VNĐ phải có class:
    ```css
    font-mono tabular-nums
    /* Hoặc áp dụng style CSS inline: font-variant-numeric: tabular-nums; */
    ```
  + Căn lề: Cột chữ căn trái (`text-left`), cột số lượng và tiền tệ bắt buộc căn phải (`text-right tabular-nums`).

---

## 3. Kiến Trúc Màn Hình Nhập Liệu Tốc Độ Cao (Fast Entry Pattern)

Để người dùng nhập liệu nhanh chóng ngay tại kho hàng hoặc quầy mua:
1. **Sticky Bottom Action Bar**: Nút "Lưu Phiếu Nhập" (`h-12`, full-width hoặc nổi bật) luôn ghim cố định ở đáy màn hình di động kèm hiển thị tổng tiền tức thời (`Total: 1,250,000 đ`).
2. **Numpad-Friendly Input**: Các ô nhập số lượng và tiền phải có thuộc tính `inputMode="numeric"` hoặc `inputMode="decimal"` để bàn phím số mở ra ngay lập tức khi người dùng bấm vào.
3. **Format Tiền Tệ Tự Động**: Tự động hiển thị dấu phân cách hàng nghìn (`1.000.000 đ`) khi người dùng gõ, tránh nhầm lẫn số 0.

