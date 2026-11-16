import mongoose, { Schema, Document, Model } from "mongoose";
import { normalizeVietnamese } from "../lib/utils/vietnamese-search";

/**
 * SUPPLIER MODEL - QUẢN LÝ VÀ TỰ ĐỘNG HỌC NƠI MUA / NHÀ CUNG CẤP
 */

export interface ISupplier extends Document {
  name: string;
  normalizedName: string;
  category: string;
  note?: string;
  usageCount: number;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupplierModel extends Model<ISupplier> {
  upsertByName(name: string, category?: string, note?: string): Promise<ISupplier>;
}

const SupplierSchema = new Schema<ISupplier>(
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
      unique: true,
      index: true,
    },
    category: {
      type: String,
      default: "Chợ",
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    usageCount: {
      type: Number,
      default: 1,
      min: 0,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "suppliers",
  }
);

SupplierSchema.index({ normalizedName: 1, usageCount: -1 });

SupplierSchema.statics.upsertByName = async function (
  name: string,
  category = "Chợ",
  note = ""
): Promise<ISupplier> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Tên nơi mua không được để trống");

  const normalized = normalizeVietnamese(cleanName);
  const existing = await this.findOne({ normalizedName: normalized });

  if (existing) {
    existing.usageCount += 1;
    existing.lastUsedAt = new Date();
    if (category && category !== "Khác" && existing.category === "Khác") {
      existing.category = category;
    }
    if (note && !existing.note) {
      existing.note = note;
    }
    await existing.save();
    return existing;
  }

  return this.create({
    name: cleanName,
    normalizedName: normalized,
    category: category || "Chợ",
    note: note || "",
    usageCount: 1,
    lastUsedAt: new Date(),
  });
};

export const Supplier: ISupplierModel =
  (mongoose.models.Supplier as ISupplierModel) ||
  mongoose.model<ISupplier, ISupplierModel>("Supplier", SupplierSchema);
