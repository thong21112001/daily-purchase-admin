import { connectToDatabase } from "@/lib/mongodb";
import { CatalogItem, type ICatalogItem } from "@/models/catalog-item.model";
import { normalizeVietnamese } from "@/lib/utils/vietnamese-search";
import { COFFEE_SHOP_STARTER_ITEMS, COMMON_UNITS } from "@/lib/constants/categories";

export interface CreateCatalogItemDTO {
  name: string;
  category?: string;
  defaultUnit: string;
  lastUnitPrice?: number;
}

export interface CatalogQueryOptions {
  category?: string;
  query?: string;
  sort?: "usage" | "price_asc" | "price_desc" | "name" | "name_asc" | "name_desc" | "recent";
  page?: number;
  limit?: number;
}

export class CatalogService {
  /**
   * Lấy danh sách tất cả các đơn vị tính có sẵn (gồm đơn vị phổ biến và đơn vị người dùng tự tạo)
   */
  static async getAvailableUnits(): Promise<string[]> {
    await connectToDatabase();
    try {
      const customUnits = await CatalogItem.distinct("defaultUnit");
      const unitSet = new Set<string>(COMMON_UNITS);
      for (const u of customUnits) {
        if (u && typeof u === "string" && u.trim()) {
          unitSet.add(u.trim());
        }
      }
      return Array.from(unitSet);
    } catch {
      return [...COMMON_UNITS];
    }
  }
  /**
   * Tìm kiếm gợi ý mặt hàng tức thì theo từ khóa không dấu (Unaccented Search)
   * Sắp xếp theo độ phổ biến (usageCount giảm dần) để các món hay mua xuất hiện đầu tiên
   */
  static async searchCatalogItems(query: string, limit = 10): Promise<any[]> {
    await connectToDatabase();

    const cleanQuery = query.trim();
    if (!cleanQuery) {
      // Nếu không nhập gì, trả về top mặt hàng hay mua nhất
      return (CatalogItem.find().sort({ usageCount: -1 }).limit(limit).lean() as any);
    }

    const norm = normalizeVietnamese(cleanQuery);

    return (CatalogItem.find({
      normalizedName: { $regex: norm, $options: "i" },
    })
      .sort({ usageCount: -1, lastUnitPrice: -1 })
      .limit(limit)
      .lean() as any);
  }

  /**
   * Lấy danh sách toàn bộ danh mục mặt hàng có phân trang, tìm kiếm & sắp xếp đa năng
   */
  static async getCatalogItems(options: CatalogQueryOptions = {}) {
    await connectToDatabase();

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 50));
    const skip = (page - 1) * limit;

    const matchFilter: Record<string, any> = {};
    if (options.category && options.category !== "Tất cả") {
      matchFilter.category = options.category;
    }

    if (options.query && options.query.trim()) {
      const norm = normalizeVietnamese(options.query.trim());
      matchFilter.normalizedName = { $regex: norm, $options: "i" };
    }

    const sortType = options.sort || "usage";

    // Trường hợp 1: Sắp xếp theo giá (Mặt hàng chưa có giá / giá = 0 luôn xuống cuối)
    if (sortType === "price_asc" || sortType === "price_desc") {
      const priceSortDirection = sortType === "price_asc" ? 1 : -1;

      const pipeline: any[] = [
        { $match: matchFilter },
        {
          $addFields: {
            // zeroPriceFlag: 0 nếu có giá > 0, 1 nếu không có giá (đẩy xuống sau)
            zeroPriceFlag: {
              $cond: [{ $gt: ["$lastUnitPrice", 0] }, 0, 1],
            },
          },
        },
        {
          $sort: {
            zeroPriceFlag: 1,
            lastUnitPrice: priceSortDirection,
            usageCount: -1,
            _id: -1,
          },
        },
        {
          $facet: {
            metadata: [{ $count: "totalCount" }],
            data: [{ $skip: skip }, { $limit: limit }],
          },
        },
      ];

      const [result] = await CatalogItem.aggregate(pipeline);
      const totalCount = result?.metadata?.[0]?.totalCount || 0;
      const items = result?.data || [];

      return {
        items,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }

    // Trường hợp 2: Sắp xếp theo Tên tiếng Việt (Collation vi chuẩn)
    if (sortType === "name" || sortType === "name_asc" || sortType === "name_desc") {
      const direction: 1 | -1 = sortType === "name_desc" ? -1 : 1;

      const [items, totalCount] = await Promise.all([
        CatalogItem.find(matchFilter)
          .collation({ locale: "vi", strength: 1 })
          .sort({ name: direction, _id: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        CatalogItem.countDocuments(matchFilter),
      ]);

      return {
        items,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    }

    // Trường hợp 3: Mặc định (hay dùng nhất) hoặc mới cập nhật gần nhất
    let sortOptions: Record<string, 1 | -1> = { usageCount: -1, updatedAt: -1, _id: -1 };
    if (sortType === "recent") {
      sortOptions = { updatedAt: -1, _id: -1 };
    }

    const [items, totalCount] = await Promise.all([
      CatalogItem.find(matchFilter).sort(sortOptions).skip(skip).limit(limit).lean(),
      CatalogItem.countDocuments(matchFilter),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Tạo mặt hàng thủ công
   */
  static async createCatalogItem(data: CreateCatalogItemDTO): Promise<ICatalogItem> {
    await connectToDatabase();

    const norm = normalizeVietnamese(data.name);
    const unitPrice = Math.max(0, Number(data.lastUnitPrice) || 0);

    const existing = await CatalogItem.findOne({ normalizedName: norm });
    if (existing) {
      existing.defaultUnit = data.defaultUnit.trim();
      if (data.category) existing.category = data.category.trim();
      if (unitPrice > 0) {
        existing.lastUnitPrice = unitPrice;
        existing.maxUnitPrice = Math.max(existing.maxUnitPrice, unitPrice);
        existing.minUnitPrice = existing.minUnitPrice === 0 ? unitPrice : Math.min(existing.minUnitPrice, unitPrice);
      }
      await existing.save();
      return existing;
    }

    return CatalogItem.create({
      name: data.name.trim(),
      normalizedName: norm,
      category: data.category?.trim() || "Khác",
      defaultUnit: data.defaultUnit.trim(),
      lastUnitPrice: unitPrice,
      minUnitPrice: unitPrice,
      maxUnitPrice: unitPrice,
      usageCount: 1,
    });
  }

  /**
   * Chỉnh sửa thông tin mặt hàng
   */
  static async updateCatalogItem(id: string, data: Partial<CreateCatalogItemDTO>): Promise<ICatalogItem | null> {
    await connectToDatabase();

    const item = await CatalogItem.findById(id);
    if (!item) return null;

    if (data.name !== undefined) {
      item.name = data.name.trim();
      item.normalizedName = normalizeVietnamese(data.name);
    }
    if (data.category !== undefined) item.category = data.category.trim();
    if (data.defaultUnit !== undefined) item.defaultUnit = data.defaultUnit.trim();
    if (data.lastUnitPrice !== undefined) {
      const price = Math.max(0, Number(data.lastUnitPrice));
      item.lastUnitPrice = price;
      item.maxUnitPrice = Math.max(item.maxUnitPrice, price);
      item.minUnitPrice = item.minUnitPrice === 0 ? price : Math.min(item.minUnitPrice, price);
    }

    await item.save();
    return item;
  }

  /**
   * Xóa mặt hàng khỏi danh mục
   */
  static async deleteCatalogItem(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await CatalogItem.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * Khởi tạo bộ mặt hàng mẫu ban đầu cho ngành Cà phê nếu danh mục đang trống
   */
  static async seedStarterItemsIfEmpty(): Promise<number> {
    await connectToDatabase();
    const count = await CatalogItem.countDocuments();
    if (count > 0) return 0;

    let seeded = 0;
    for (const starter of COFFEE_SHOP_STARTER_ITEMS) {
      await CatalogItem.create({
        name: starter.name,
        normalizedName: normalizeVietnamese(starter.name),
        category: starter.category,
        defaultUnit: starter.unit,
        lastUnitPrice: starter.defaultPrice,
        minUnitPrice: starter.defaultPrice,
        maxUnitPrice: starter.defaultPrice,
        usageCount: 1,
      });
      seeded++;
    }

    return seeded;
  }
}
