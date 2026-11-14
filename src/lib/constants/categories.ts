/**
 * DANH MỤC HÀNG HÓA TIÊU CHUẨN (BAO GỒM NGUYÊN LIỆU & VẬT TƯ QUÁN CÀ PHÊ)
 * Tối ưu cho nhu cầu mua sắm hằng ngày và kinh doanh quán cà phê
 */

export const DEFAULT_PURCHASE_CATEGORIES = [
  "Nguyên liệu Cà phê & Trà",
  "Sữa & Chế phẩm sữa",
  "Syrup, Mứt & Topping",
  "Vật tư & Bao bì mang về",
  "Rau củ quả & Nông sản",
  "Thực phẩm tươi sống",
  "Gia vị & Đồ khô",
  "Vật dụng & Tiêu hao",
  "Khác",
] as const;

export type PurchaseCategory = (typeof DEFAULT_PURCHASE_CATEGORIES)[number];

export const COMMON_UNITS = [
  "kg",
  "g",
  "lạng",
  "hộp",
  "thùng",
  "chai",
  "gói",
  "bịch",
  "lít",
  "lon",
  "cây",
  "cuộn",
  "cái",
  "bó",
  "túi",
] as const;

export type CommonUnit = (typeof COMMON_UNITS)[number];

/**
 * Danh mục mẫu sẵn có gợi ý cho ngành cà phê & đồ uống
 */
export const COFFEE_SHOP_STARTER_ITEMS = [
  { name: "Cà phê Robusta Mộc", category: "Nguyên liệu Cà phê & Trà", unit: "kg", defaultPrice: 180000 },
  { name: "Cà phê Arabica Cầu Đất", category: "Nguyên liệu Cà phê & Trà", unit: "kg", defaultPrice: 280000 },
  { name: "Trà Lài (Hoa Nhài)", category: "Nguyên liệu Cà phê & Trà", unit: "kg", defaultPrice: 150000 },
  { name: "Trà Đen Phúc Long", category: "Nguyên liệu Cà phê & Trà", unit: "gói", defaultPrice: 85000 },
  { name: "Sữa đặc Ngôi sao Phương Nam (Xanh lá)", category: "Sữa & Chế phẩm sữa", unit: "thùng", defaultPrice: 690000 },
  { name: "Sữa đặc Ngôi sao Phương Nam (Lon)", category: "Sữa & Chế phẩm sữa", unit: "lon", defaultPrice: 22000 },
  { name: "Sữa tươi thanh trùng Barista", category: "Sữa & Chế phẩm sữa", unit: "thùng", defaultPrice: 380000 },
  { name: "Kem béo Rich's lùn (Béo Thực Vật)", category: "Sữa & Chế phẩm sữa", unit: "hộp", defaultPrice: 32000 },
  { name: "Syrup Vani", category: "Syrup, Mứt & Topping", unit: "chai", defaultPrice: 160000 },
  { name: "Đào ngâm Kronos", category: "Syrup, Mứt & Topping", unit: "hộp", defaultPrice: 42000 },
  { name: "Ly nhựa nắp cầu 500ml", category: "Vật tư & Bao bì mang về", unit: "cây", defaultPrice: 38000 },
  { name: "Ống hút giấy / bọc màng", category: "Vật tư & Bao bì mang về", unit: "gói", defaultPrice: 25000 },
  { name: "Túi chữ T đựng ly", category: "Vật tư & Bao bì mang về", unit: "kg", defaultPrice: 45000 },
  { name: "Chanh tươi không hạt", category: "Rau củ quả & Nông sản", unit: "kg", defaultPrice: 25000 },
  { name: "Tắc (Quất) thơm", category: "Rau củ quả & Nông sản", unit: "kg", defaultPrice: 20000 },
  { name: "Đường cát trắng", category: "Gia vị & Đồ khô", unit: "bao", defaultPrice: 480000 },
  { name: "Đá bi tinh khiết", category: "Gia vị & Đồ khô", unit: "bao", defaultPrice: 15000 },
  { name: "Khăn giấy lau tay / ăn", category: "Vật dụng & Tiêu hao", unit: "gói", defaultPrice: 18000 },
  { name: "Nước rửa chén Sunlight", category: "Vật dụng & Tiêu hao", unit: "can", defaultPrice: 95000 },
] as const;
