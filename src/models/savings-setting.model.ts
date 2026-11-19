import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavingsSetting extends Document {
  key: string;
  defaultAmount: number;
  targetMonthlyDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const SavingsSettingSchema = new Schema<ISavingsSetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default_daily_amount",
      trim: true,
    },
    defaultAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 200000,
    },
    targetMonthlyDays: {
      type: Number,
      default: 30,
    },
  },
  {
    timestamps: true,
    collection: "savings_settings",
  }
);

export const SavingsSetting: Model<ISavingsSetting> =
  (mongoose.models.SavingsSetting as Model<ISavingsSetting>) ||
  mongoose.model<ISavingsSetting>("SavingsSetting", SavingsSettingSchema);
