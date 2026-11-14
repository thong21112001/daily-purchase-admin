import { connectToDatabase } from "@/lib/mongodb";
import { PurchaseLog, type IPurchaseItem, type IPurchaseLog } from "@/models/purchase-log.model";
import { CatalogItem } from "@/models/catalog-item.model";
import { Counter } from "@/models/counter.model";
import { getDateKey, getTodayKey } from "@/lib/utils/date";
import { normalizeVietnamese, matchesUnaccented } from "@/lib/utils/vietnamese-search";

export interface CreatePurchaseItemDTO {
  name: string;
  category?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

export interface CreatePurchaseLogDTO {
  purchaseDate?: Date | string;
  supplier?: string;
  paymentMethod?: "CASH" | "TRANSFER";
  items: CreatePurchaseItemDTO[];
  note?: string;
}

export interface PurchaseFilterOptions {
  dateKey?: string;
  startDateKey?: string;
  endDateKey?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export class PurchaseService {
  /**
   * Tạo một phiếu mua hàng mới (Choice B: Mỗi lần lưu sinh 1 mã phiếu PO-YYYYMMDD-XXX độc lập)
   * Tự động học danh mục mặt hàng và cập nhật giá mới nhất vào CatalogItem
   */
  static async createPurchaseLog(data: CreatePurchaseLogDTO): Promise<IPurchaseLog> {
    await connectToDatabase();

    const purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : new Date();
    const dateKey = getDateKey(purchaseDate);

    // 1. Sinh mã phiếu tự động nguyên tử theo ngày: PO-YYYYMMDD-001, 002...
    const code = await Counter.generatePurchaseCode(dateKey);

    // 2. Chuẩn hóa và tính toán dòng hàng
    const processedItems: IPurchaseItem[] = [];
    let totalAmount = 0;

    for (const item of data.items) {
      const quantity = Math.max(0.001, Number(item.quantity) || 0);
      const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      const lineTotal = Math.round(quantity * unitPrice);

      const normalized = normalizeVietnamese(item.name);

      processedItems.push({
        name: item.name.trim(),
        normalizedName: normalized,
        category: item.category?.trim() || "Khác",
        unit: item.unit.trim(),
        quantity,
        unitPrice,
        lineTotal,
        note: item.note?.trim() || "",
      });

      totalAmount += lineTotal;
    }

    // 3. Tạo bản ghi PurchaseLog
    const purchase = await PurchaseLog.create({
      code,
      purchaseDate,
      dateKey,
      supplier: data.supplier?.trim() || "",
      paymentMethod: data.paymentMethod || "CASH",
      items: processedItems,
      totalAmount,
      itemCount: processedItems.length,
      note: data.note?.trim() || "",
    });

    // 4. Kích hoạt Auto-Learn Catalog: Tự động học giá và cập nhật dải giá
    for (const item of processedItems) {
      try {
        await CatalogItem.upsertFromPurchaseItem({
          name: item.name,
          category: item.category,
          unit: item.unit,
          unitPrice: item.unitPrice,
        });
      } catch (err) {
        console.error(`[AutoLearnCatalog Error] Không thể cập nhật mặt hàng: ${item.name}`, err);
      }
    }

    return purchase;
  }

  /**
   * Lấy danh sách phiếu mua hàng với bộ lọc theo ngày/khoảng ngày và tìm kiếm không dấu
   */
  static async getPurchases(filters: PurchaseFilterOptions = {}) {
    await connectToDatabase();

    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 50));
    const skip = (page - 1) * limit;

    const queryConditions: Record<string, any> = {};

    // Lọc theo dateKey đơn lẻ
    if (filters.dateKey) {
      queryConditions.dateKey = filters.dateKey;
    }
    // Lọc theo khoảng ngày (Range)
    else if (filters.startDateKey || filters.endDateKey) {
      queryConditions.dateKey = {};
      if (filters.startDateKey) {
        queryConditions.dateKey.$gte = filters.startDateKey;
      }
      if (filters.endDateKey) {
        queryConditions.dateKey.$lte = filters.endDateKey;
      }
    }

    // Nếu có tìm kiếm từ khóa không dấu
    if (filters.query?.trim()) {
      const qNorm = normalizeVietnamese(filters.query);
      queryConditions.$or = [
        { "items.normalizedName": { $regex: qNorm, $options: "i" } },
        { supplier: { $regex: filters.query.trim(), $options: "i" } },
        { code: { $regex: filters.query.trim(), $options: "i" } },
      ];
    }

    const [purchases, totalCount] = await Promise.all([
      PurchaseLog.find(queryConditions)
        .sort({ dateKey: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseLog.countDocuments(queryConditions),
    ]);

    return {
      purchases,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  /**
   * Lấy chi tiết 1 phiếu mua hàng theo ID
   */
  static async getPurchaseById(id: string): Promise<IPurchaseLog | null> {
    await connectToDatabase();
    return PurchaseLog.findById(id);
  }

  /**
   * Cập nhật phiếu mua hàng
   */
  static async updatePurchaseLog(id: string, data: Partial<CreatePurchaseLogDTO>): Promise<IPurchaseLog | null> {
    await connectToDatabase();

    const purchase = await PurchaseLog.findById(id);
    if (!purchase) return null;

    if (data.supplier !== undefined) purchase.supplier = data.supplier.trim();
    if (data.paymentMethod !== undefined) purchase.paymentMethod = data.paymentMethod;
    if (data.note !== undefined) purchase.note = data.note.trim();

    if (data.purchaseDate) {
      purchase.purchaseDate = new Date(data.purchaseDate);
      purchase.dateKey = getDateKey(purchase.purchaseDate);
    }

    if (Array.isArray(data.items)) {
      const processedItems: IPurchaseItem[] = [];
      let totalAmount = 0;

      for (const item of data.items) {
        const quantity = Math.max(0.001, Number(item.quantity) || 0);
        const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
        const lineTotal = Math.round(quantity * unitPrice);

        processedItems.push({
          name: item.name.trim(),
          normalizedName: normalizeVietnamese(item.name),
          category: item.category?.trim() || "Khác",
          unit: item.unit.trim(),
          quantity,
          unitPrice,
          lineTotal,
          note: item.note?.trim() || "",
        });

        totalAmount += lineTotal;
      }

      purchase.items = processedItems;
      purchase.totalAmount = totalAmount;
      purchase.itemCount = processedItems.length;

      // Cập nhật lại catalog cho các món sửa
      for (const item of processedItems) {
        await CatalogItem.upsertFromPurchaseItem({
          name: item.name,
          category: item.category,
          unit: item.unit,
          unitPrice: item.unitPrice,
        });
      }
    }

    await purchase.save();
    return purchase;
  }

  /**
   * Xóa một phiếu mua hàng
   */
  static async deletePurchaseLog(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await PurchaseLog.findByIdAndDelete(id);
    return !!result;
  }
}
