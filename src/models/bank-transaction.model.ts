import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * BANK TRANSACTION MODEL - QUẢN LÝ BIẾN ĐỘNG SỐ DƯ MB BANK
 */

export interface IBankTransaction extends Document {
  transactionRef: string;
  bankName: string;
  accountNumber: string;
  type: "IN" | "OUT";
  amount: number;
  balanceAfter: number;
  senderName: string;
  content: string;
  transactionDate: Date;
  dateKey: string;
  rawNotification?: string;
  source: "SEPAY_WEBHOOK" | "ANDROID_FORWARDER" | "MANUAL";
  createdAt: Date;
  updatedAt: Date;
}

const BankTransactionSchema = new Schema<IBankTransaction>(
  {
    transactionRef: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    bankName: {
      type: String,
      default: "MBBank",
      trim: true,
    },
    accountNumber: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["IN", "OUT"],
      default: "IN",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
    senderName: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      index: true, // YYYY-MM-DD
    },
    rawNotification: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      enum: ["SEPAY_WEBHOOK", "ANDROID_FORWARDER", "MANUAL"],
      default: "MANUAL",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
BankTransactionSchema.index({ dateKey: -1, transactionDate: -1 });
BankTransactionSchema.index({ type: 1, dateKey: -1 });

export const BankTransaction: Model<IBankTransaction> =
  (mongoose.models && mongoose.models.BankTransaction) ||
  mongoose.model<IBankTransaction>("BankTransaction", BankTransactionSchema);
