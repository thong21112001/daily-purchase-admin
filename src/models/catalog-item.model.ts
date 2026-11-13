import mongoose, { Schema, Document, Model } from "mongoose";
import { normalizeVietnamese } from "../lib/utils/vietnamese-search";

/**
 * CATALOG ITEM MODEL - DANH MỤC HÀNG HÓA TỰ ĐỘNG HỌC TỪ LỊCH SỬ MUA
 * Tự động cập nhật giá nhập gần nhất, dải giá min-max và tần suất sử dụng (usageCount)
 */

export interface ICatalogItem extends Document {
  name: string;
  normalizedName: string;
  category: string;
  defaultUnit: string;
  lastUnitPrice: number;
  minUnitPrice: number;
  maxUnitPrice: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ICatalogItemModel extends Model<ICatalogItem> {
  upsertFromPurchaseItem(item: {
    name: string;
    category?: string;
    unit: string;
    unitPrice: number;
  }): Promise<ICatalogItem>;
}

const CatalogItemSchema = new Schema<ICatalogItem>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      default: "Khác",
      trim: true,
    },
    defaultUnit: {
      type: String,
      required: true,
      trim: true,
    },
    lastUnitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minUnitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    maxUnitPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    usageCount: {
      type: Number,
      default: 1,
      min: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "catalog_items",
  }
);

// Compound Index tối ưu hóa tìm kiếm gợi ý sắp xếp theo tần suất mua nhiều nhất
CatalogItemSchema.index({ normalizedName: 1, usageCount: -1 });

/**
 * Tự động học mặt hàng khi lưu phiếu mua:
 * - Nếu chưa có: Tạo mới với giá hiện tại là cả last, min, max.
 * - Nếu đã có: Cập nhật lastUnitPrice, tính lại min/max, tăng usageCount + 1.
 */
CatalogItemSchema.statics.upsertFromPurchaseItem = async function (item: {
  name: string;
  category?: string;
  unit: string;
  unitPrice: number;
}): Promise<ICatalogItem> {
  const norm = normalizeVietnamese(item.name);
  const existing = await this.findOne({ normalizedName: norm });

  if (!existing) {
    return this.create({
      name: item.name.trim(),
      normalizedName: norm,
      category: item.category?.trim() || "Khác",
      defaultUnit: item.unit.trim(),
      lastUnitPrice: item.unitPrice,
      minUnitPrice: item.unitPrice,
      maxUnitPrice: item.unitPrice,
      usageCount: 1,
    });
  }

  // Cập nhật mặt hàng đã tồn tại
  existing.lastUnitPrice = item.unitPrice;
  existing.minUnitPrice =
    existing.minUnitPrice === 0 ? item.unitPrice : Math.min(existing.minUnitPrice, item.unitPrice);
  existing.maxUnitPrice = Math.max(existing.maxUnitPrice, item.unitPrice);
  existing.usageCount += 1;
  if (item.category && item.category !== "Khác") {
    existing.category = item.category.trim();
  }
  if (item.unit) {
    existing.defaultUnit = item.unit.trim();
  }

  await existing.save();
  return existing;
};

export const CatalogItem: ICatalogItemModel =
  (mongoose.models.CatalogItem as ICatalogItemModel) ||
  mongoose.model<ICatalogItem, ICatalogItemModel>("CatalogItem", CatalogItemSchema);

