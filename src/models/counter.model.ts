import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * COUNTER MODEL - QUẢN LÝ BỘ ĐẾM NGUYÊN TỬ (ATOMIC SEQUENCE)
 * Dùng để tự sinh mã phiếu mua hàng: PO-YYYYMMDD-001, PO-YYYYMMDD-002...
 */

export interface ICounter extends Document {
  key: string;
  seq: number;
}

interface ICounterModel extends Model<ICounter> {
  getNextSequence(key: string): Promise<number>;
  generatePurchaseCode(dateKey: string): Promise<string>;
}

const CounterSchema = new Schema<ICounter>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "counters",
  }
);

/**
 * Tăng bộ đếm nguyên tử và trả về số thứ tự kế tiếp
 */
CounterSchema.statics.getNextSequence = async function (key: string): Promise<number> {
  const result = await this.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return result.seq;
};

/**
 * Sinh mã phiếu theo ngày mua dạng: PO-20261113-001
 */
CounterSchema.statics.generatePurchaseCode = async function (dateKey: string): Promise<string> {
  const cleanDate = dateKey.replace(/-/g, ""); // "2026-11-13" -> "20261113"
  const counterKey = `PO-${cleanDate}`;
  const seq = await (this as ICounterModel).getNextSequence(counterKey);
  const padSeq = String(seq).padStart(3, "0");
  return `PO-${cleanDate}-${padSeq}`;
};

export const Counter: ICounterModel =
  (mongoose.models.Counter as ICounterModel) ||
  mongoose.model<ICounter, ICounterModel>("Counter", CounterSchema);

