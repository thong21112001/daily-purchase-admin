import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavingsCheckin extends Document {
  dateKey: string; // YYYY-MM-DD theo giờ VN (Asia/Ho_Chi_Minh)
  amount: number; // Mức tiền tích lũy của ngày đó (VNĐ)
  isMakeup: boolean; // Điểm danh bù
  note?: string;
  checkedInAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SavingsCheckinSchema = new Schema<ISavingsCheckin>(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 200000,
    },
    isMakeup: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    checkedInAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "savings_checkins",
  }
);

SavingsCheckinSchema.index({ dateKey: -1 });

export const SavingsCheckin: Model<ISavingsCheckin> =
  (mongoose.models.SavingsCheckin as Model<ISavingsCheckin>) ||
  mongoose.model<ISavingsCheckin>("SavingsCheckin", SavingsCheckinSchema);
