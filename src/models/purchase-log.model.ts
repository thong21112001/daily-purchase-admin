import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { normalizeVietnamese } from "../lib/utils/vietnamese-search";
import { getDateKey } from "../lib/utils/date";

/**
 * PURCHASE LOG MODEL - SỔ THEO DÕI NHẬP & MUA HÀNG HÓA HẰNG NGÀY
 */

export interface IPurchaseItem {
  _id?: Types.ObjectId;
  catalogItemId?: Types.ObjectId;
  name: string;
  normalizedName: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  note?: string;
}

export interface IPurchaseLog extends Document {
  code: string;
  purchaseDate: Date;
  dateKey: string;
  supplier: string;
  paymentMethod: "CASH" | "TRANSFER";
  items: IPurchaseItem[];
  totalAmount: number;
  itemCount: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema = new Schema<IPurchaseItem>(
  {
    catalogItemId: {
      type: Schema.Types.ObjectId,
      ref: "CatalogItem",
      required: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Khác",
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: true }
);

const PurchaseLogSchema = new Schema<IPurchaseLog>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      index: true, // "2026-11-13" theo giờ Việt Nam
    },
    supplier: {
      type: String,
      default: "",
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "TRANSFER"],
      default: "CASH",
    },
    items: {
      type: [PurchaseItemSchema],
      required: true,
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    itemCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "purchase_logs",
  }
);

// Compound Indexes tối ưu hóa truy vấn lọc theo ngày và tìm kiếm mặt hàng
PurchaseLogSchema.index({ dateKey: -1, createdAt: -1 });
PurchaseLogSchema.index({ "items.normalizedName": 1, dateKey: -1 });

// Middleware pre-validate: Tự động chuẩn hóa dữ liệu items và tổng tiền
PurchaseLogSchema.pre("validate", function (next) {
  if (this.purchaseDate && !this.dateKey) {
    this.dateKey = getDateKey(this.purchaseDate);
  }

  if (Array.isArray(this.items)) {
    let calculatedTotal = 0;

    for (const item of this.items) {
      if (!item.normalizedName && item.name) {
        item.normalizedName = normalizeVietnamese(item.name);
      }
      // Đảm bảo lineTotal luôn bằng Math.round(quantity * unitPrice)
      item.lineTotal = Math.round(item.quantity * item.unitPrice);
      calculatedTotal += item.lineTotal;
    }

    this.totalAmount = calculatedTotal;
    this.itemCount = this.items.length;
  }

  next();
});

export const PurchaseLog: Model<IPurchaseLog> =
  (mongoose.models.PurchaseLog as Model<IPurchaseLog>) ||
  mongoose.model<IPurchaseLog>("PurchaseLog", PurchaseLogSchema);

