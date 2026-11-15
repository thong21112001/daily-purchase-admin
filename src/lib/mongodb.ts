import mongoose from "mongoose";
import dns from "node:dns";

// Tự động dùng Google DNS / Cloudflare DNS khi chạy ở Local Windows
// Khắc phục triệt để lỗi DNS router ISP (Viettel/VNPT/FPT) từ chối phân giải MongoDB SRV record (querySrv ECONNREFUSED)
if (process.env.NODE_ENV !== "production") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
  } catch {
    // Bỏ qua nếu môi trường không hỗ trợ tùy chỉnh DNS
  }
}

/**
 * SINGLETON MONGOOSE CONNECTION CACHING CHO VERCEL SERVERLESS
 * Giải quyết triệt để lỗi Cold-Start và cạn kiệt Connection Pool trên MongoDB Atlas M0 Free Tier
 */

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "[Database Error] Biến môi trường MONGODB_URI chưa được thiết lập. Vui lòng kiểm tra tệp .env.local hoặc Vercel Environment Variables."
    );
  }

  // Nếu kết nối đã mở và sẵn sàng, trả về ngay lập tức (0ms latency)
  if (cached && cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached && !cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10, // Tối ưu cho M0 Free tier (tránh chiếm dụng 500 connections tối đa)
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        if (cached) cached.promise = null;
        throw err;
      });
  }

  try {
    if (cached) {
      cached.conn = await cached.promise;
      return cached.conn!;
    }
  } catch (e) {
    if (cached) cached.promise = null;
    throw e;
  }

  throw new Error("[Database Error] Không thể khởi tạo kết nối Mongoose Singleton.");
}

