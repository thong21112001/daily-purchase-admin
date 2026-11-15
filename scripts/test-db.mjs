import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dns from "node:dns";

// Khắc phục triệt để lỗi ECONNREFUSED do DNS router gia đình (Viettel/VNPT/FPT) chặn SRV records trên Windows
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Bỏ qua nếu môi trường không cho phép setServers
}

// Đọc chuỗi MONGODB_URI từ .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
let uri = process.env.MONGODB_URI;

if (!uri && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("MONGODB_URI=") && !trimmed.startsWith("#")) {
      uri = trimmed.slice("MONGODB_URI=".length).trim();
      break;
    }
  }
}

console.log("--------------------------------------------------");
console.log("🔍 Đang kiểm tra kết nối tới MongoDB...");
console.log("URI:", uri ? uri.replace(/:([^@]+)@/, ":****@") : "Chưa cấu hình MONGODB_URI");
console.log("--------------------------------------------------");

if (!uri) {
  console.error("❌ Lỗi: Không tìm thấy MONGODB_URI trong .env.local!");
  process.exit(1);
}

try {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
  });
  console.log("✅ KẾT NỐI THÀNH CÔNG! MongoDB Atlas đã sẵn sàng.");
  console.log("Tên cơ sở dữ liệu (Database Name):", mongoose.connection.name);
  console.log("Trạng thái (ReadyState):", mongoose.connection.readyState === 1 ? "1 (Connected)" : mongoose.connection.readyState);
  await mongoose.disconnect();
  console.log("--------------------------------------------------");
  console.log("🚀 Bạn có thể chạy `npm run dev` và thêm dữ liệu bình thường!");
  process.exit(0);
} catch (error) {
  console.error("❌ KẾT NỐI THẤT BẠI:");
  console.error("Chi tiết lỗi:", error.message);
  console.log("--------------------------------------------------");
  if (error.message.includes("querySrv") || error.message.includes("ECONNREFUSED")) {
    console.log("👉 Nguyên nhân: DNS của Modem/Router mạng gia đình (Viettel/VNPT/FPT) chặn bản ghi DNS SRV.");
    console.log("   Khắc phục: Đổi DNS card mạng Wi-Fi sang Google DNS (8.8.8.8 / 8.8.4.4) hoặc Cloudflare (1.1.1.1).");
  } else if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
    console.log("👉 Nguyên nhân: Sai Username hoặc Password của Database User.");
    console.log("   Vào MongoDB Atlas -> Database Access -> kiểm tra lại username & password.");
  } else if (error.message.includes("ETIMEDOUT") || error.message.includes("ENOTFOUND") || error.message.includes("timed out")) {
    console.log("👉 Nguyên nhân: Chưa mở quyền truy cập IP trên MongoDB Atlas.");
    console.log("   Vào MongoDB Atlas -> Network Access -> Add IP Address -> Chọn 'Allow Access from Anywhere' (0.0.0.0/0).");
  }
  process.exit(1);
}
