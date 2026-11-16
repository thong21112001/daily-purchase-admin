import { connectToDatabase } from "@/lib/mongodb";
import { Supplier, type ISupplier } from "@/models/supplier.model";
import { normalizeVietnamese } from "@/lib/utils/vietnamese-search";

export interface CreateSupplierDTO {
  name: string;
  category?: string;
  note?: string;
}

export interface SupplierQueryOptions {
  category?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export class SupplierService {
  /**
   * Tìm kiếm gợi ý Nơi mua tức thì theo từ khóa không dấu
   * Sắp xếp theo tần suất sử dụng (usageCount) và lần dùng gần nhất
   */
  static async searchSuppliers(query: string, limit = 10): Promise<any[]> {
    await connectToDatabase();

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      return Supplier.find().sort({ usageCount: -1, lastUsedAt: -1 }).limit(limit).lean();
    }

    const norm = normalizeVietnamese(cleanQuery);
    return Supplier.find({
      normalizedName: { $regex: norm, $options: "i" },
    })
      .sort({ usageCount: -1, lastUsedAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Lấy danh sách Nơi mua có phân trang và lọc theo nhóm
   */
  static async getSuppliers(options: SupplierQueryOptions = {}) {
    await connectToDatabase();

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 50));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (options.category && options.category !== "Tất cả") {
      query.category = options.category;
    }
    if (options.query?.trim()) {
      const norm = normalizeVietnamese(options.query.trim());
      query.normalizedName = { $regex: norm, $options: "i" };
    }

    const [suppliers, totalCount] = await Promise.all([
      Supplier.find(query).sort({ usageCount: -1, lastUsedAt: -1 }).skip(skip).limit(limit).lean(),
      Supplier.countDocuments(query),
    ]);

    return {
      suppliers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Tự động học nơi mua khi lưu đơn hàng (Auto-Upsert)
   */
  static async upsertSupplier(name: string, category = "Chợ", note = ""): Promise<ISupplier | null> {
    const cleanName = name.trim();
    if (!cleanName) return null;

    await connectToDatabase();
    return Supplier.upsertByName(cleanName, category, note);
  }

  /**
   * Cập nhật thông tin nơi mua
   */
  static async updateSupplier(id: string, data: Partial<CreateSupplierDTO>): Promise<ISupplier | null> {
    await connectToDatabase();

    const supplier = await Supplier.findById(id);
    if (!supplier) return null;

    if (data.name !== undefined && data.name.trim()) {
      supplier.name = data.name.trim();
      supplier.normalizedName = normalizeVietnamese(data.name.trim());
    }
    if (data.category !== undefined) {
      supplier.category = data.category.trim();
    }
    if (data.note !== undefined) {
      supplier.note = data.note.trim();
    }

    await supplier.save();
    return supplier;
  }

  /**
   * Xóa nơi mua
   */
  static async deleteSupplier(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Supplier.findByIdAndDelete(id);
    return !!result;
  }
}
