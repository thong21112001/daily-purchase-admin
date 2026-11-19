import crypto from "crypto";
import { connectToDatabase } from "../lib/mongodb.ts";
import { BankTransaction, type IBankTransaction } from "../models/bank-transaction.model.ts";
import { getDateKey, getTodayKey, getMonthKey, getVNParts } from "../lib/utils/date.ts";

export interface ParsedBankTransaction {
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
}

export interface BankTransactionQueryOptions {
  dateKey?: string;
  startDateKey?: string;
  endDateKey?: string;
  type?: "IN" | "OUT";
  query?: string;
  page?: number;
  limit?: number;
}

export interface BankDashboardStats {
  todayInAmount: number;
  todayOutAmount: number;
  todayInCount: number;
  monthInAmount: number;
  monthInCount: number;
  balanceLatest: number;
  lastUpdated?: string;
}

export class MBBankService {
  /**
   * Smart Regex Parser cho thông báo đẩy App MBBank hoặc SMS trên Android
   * Mẫu phổ biến:
   * "Thông báo biến động số dư: TK 0905xxxxxx|GD: +350,000VND 16/11/26 09:30 |SD: 12,500,000VND|ND: NGUYEN VAN A chuyen khoan"
   */
  static parseAndroidNotification(rawText: string): ParsedBankTransaction {
    const text = (rawText || "").trim();

    // 1. Số tài khoản: TK 0905xxxxxx hoặc TK: 0905...
    let accountNumber = "";
    const accMatch = text.match(/(?:TK|so tai khoan|tai khoan)\s*[:#]?\s*([0-9xX*]+)/i);
    if (accMatch) {
      accountNumber = accMatch[1].trim();
    }

    // 2. Giao dịch & Số tiền (+ hoặc -)
    // GD: +350,000VND hoặc GD: -20.000d hoặc +350,000 VND
    let type: "IN" | "OUT" = "IN";
    let amount = 0;

    const gdMatch = text.match(/(?:GD|giao dich|bien dong)\s*[:#]?\s*([+-]?)\s*([\d,.]+)\s*(?:VND|VNĐ|d|đ)?/i) ||
                    text.match(/([+-])\s*([\d,.]+)\s*(?:VND|VNĐ|d|đ)/i);

    if (gdMatch) {
      const sign = gdMatch[1];
      const rawAmt = gdMatch[2].replace(/[.,]/g, "");
      amount = parseInt(rawAmt, 10) || 0;
      if (sign === "-") {
        type = "OUT";
      } else {
        type = "IN";
      }
    } else {
      // Fallback: tìm số tiền kèm VND
      const fallbackAmt = text.match(/([\d,.]+)\s*(?:VND|VNĐ|d|đ)/i);
      if (fallbackAmt) {
        amount = parseInt(fallbackAmt[1].replace(/[.,]/g, ""), 10) || 0;
      }
    }

    // 3. Số dư sau giao dịch (SD: 12,500,000VND)
    let balanceAfter = 0;
    const sdMatch = text.match(/(?:SD|so du|so du kha dung)\s*[:#]?\s*([\d,.]+)\s*(?:VND|VNĐ|d|đ)?/i);
    if (sdMatch) {
      balanceAfter = parseInt(sdMatch[1].replace(/[.,]/g, ""), 10) || 0;
    }

    // 4. Ngày giờ giao dịch (DD/MM/YY HH:mm hoặc DD/MM/YYYY HH:mm:ss)
    let transactionDate = new Date();
    const dateMatch = text.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10);
      let year = parseInt(dateMatch[3], 10);
      if (year < 100) {
        year += 2000;
      }
      const hour = parseInt(dateMatch[4], 10);
      const minute = parseInt(dateMatch[5], 10);
      const second = dateMatch[6] ? parseInt(dateMatch[6], 10) : 0;

      // Giờ Việt Nam UTC+7
      const isoStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}+07:00`;
      const parsedDate = new Date(isoStr);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = parsedDate;
      }
    }

    // 5. Nội dung giao dịch (ND: ...)
    let content = "";
    const ndMatch =
      text.match(/(?:^|[|;\n])\s*(?:ND|nội dung|noi dung|lý do|ly do|ghi chú|ghi chu)\s*[:#]?\s*([^|\n]+)/i) ||
      text.match(/(?:^|[|;\n])\s*(?:ND|noi dung)\s*[:#]?\s*(.+)$/i);

    if (ndMatch) {
      content = ndMatch[1].trim();
    } else {
      // Lấy đoạn cuối sau dấu | nếu có
      const parts = text.split("|");
      content = (parts[parts.length - 1] || text).trim();
    }

    // 6. Tên người gửi trích xuất sơ bộ nếu có (VD: NGUYEN VAN A chuyen khoan)
    let senderName = "";
    const senderMatch = content.match(/^([A-Z\s]{4,30})\s+(?:chuyen|ck|tra|thanh toan)/i);
    if (senderMatch) {
      senderName = senderMatch[1].trim();
    }

    const dateKey = getDateKey(transactionDate);

    // 7. Mã tham chiếu duy nhất (chống trùng lặp)
    const hash = crypto
      .createHash("md5")
      .update(`${accountNumber}_${amount}_${type}_${dateKey}_${content.toUpperCase().replace(/\s+/g, "")}`)
      .digest("hex")
      .slice(0, 16);

    const transactionRef = `MB_${dateKey.replace(/-/g, "")}_${hash}`;

    return {
      transactionRef,
      bankName: "MBBank",
      accountNumber,
      type,
      amount,
      balanceAfter,
      senderName,
      content,
      transactionDate,
      dateKey,
      rawNotification: text,
    };
  }

  /**
   * Parser cho Webhook chuẩn SePay / Casso
   */
  static parseSepayWebhook(payload: Record<string, any>): ParsedBankTransaction {
    const rawRef =
      payload.referenceCode ||
      payload.id ||
      payload.tid ||
      payload.code ||
      "";

    const amount = Number(payload.transferAmount || payload.amount || 0);
    const transferTypeRaw = String(payload.transferType || payload.type || "").toLowerCase();
    const type: "IN" | "OUT" = transferTypeRaw.includes("out") || amount < 0 ? "OUT" : "IN";
    const absAmount = Math.abs(amount);

    const accountNumber = String(payload.accountNumber || payload.subAccount || payload.subAccId || "").trim();
    const content = String(payload.content || payload.description || "").trim();
    const balanceAfter = Number(payload.accumulated || payload.cusum_balance || 0);
    const senderName = String(payload.corresponsiveName || "").trim();

    let transactionDate = new Date();
    const rawDate = payload.transactionDate || payload.when || payload.createdAt;
    if (rawDate) {
      const rawDateStr = String(rawDate).trim();
      // Nếu chuỗi ngày dạng "YYYY-MM-DD HH:mm:ss" hoặc "YYYY-MM-DDTHH:mm:ss" chưa có offset múi giờ
      if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(rawDateStr)) {
        const iso = rawDateStr.replace(" ", "T") + (rawDateStr.length === 16 ? ":00+07:00" : "+07:00");
        const d = new Date(iso);
        if (!isNaN(d.getTime())) transactionDate = d;
      } else {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) transactionDate = d;
      }
    }

    const dateKey = getDateKey(transactionDate);

    let transactionRef = "";
    if (rawRef) {
      transactionRef = `MB_SEPAY_${String(rawRef).trim()}`;
    } else {
      const hash = crypto
        .createHash("md5")
        .update(`${accountNumber}_${absAmount}_${type}_${dateKey}_${content.toUpperCase().replace(/\s+/g, "")}`)
        .digest("hex")
        .slice(0, 16);
      transactionRef = `MB_${dateKey.replace(/-/g, "")}_${hash}`;
    }

    return {
      transactionRef,
      bankName: String(payload.gateway || payload.bankName || "MBBank"),
      accountNumber,
      type,
      amount: absAmount,
      balanceAfter,
      senderName,
      content,
      transactionDate,
      dateKey,
      rawNotification: JSON.stringify(payload),
    };
  }

  /**
   * Lưu hoặc cập nhật giao dịch (Idempotent - Chống trùng lặp tuyệt đối)
   */
  static async saveTransaction(
    parsed: ParsedBankTransaction,
    source: "SEPAY_WEBHOOK" | "ANDROID_FORWARDER" | "MANUAL"
  ): Promise<{ transaction: IBankTransaction; isNew: boolean }> {
    await connectToDatabase();

    const existing = await BankTransaction.findOne({ transactionRef: parsed.transactionRef });
    if (existing) {
      return { transaction: existing, isNew: false };
    }

    const created = await BankTransaction.create({
      ...parsed,
      source,
    });

    return { transaction: created, isNew: true };
  }

  /**
   * Lấy danh sách giao dịch có phân trang và bộ lọc
   */
  static async getTransactions(options: BankTransactionQueryOptions = {}) {
    await connectToDatabase();

    const {
      dateKey,
      startDateKey,
      endDateKey,
      type,
      query,
      page = 1,
      limit = 50,
    } = options;

    const filter: Record<string, any> = {};

    if (dateKey) {
      filter.dateKey = dateKey;
    } else if (startDateKey || endDateKey) {
      filter.dateKey = {};
      if (startDateKey) filter.dateKey.$gte = startDateKey;
      if (endDateKey) filter.dateKey.$lte = endDateKey;
    }

    if (type) {
      filter.type = type;
    }

    if (query && query.trim()) {
      const q = query.trim();
      filter.$or = [
        { content: { $regex: q, $options: "i" } },
        { senderName: { $regex: q, $options: "i" } },
        { accountNumber: { $regex: q, $options: "i" } },
        { transactionRef: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [transactions, total] = await Promise.all([
      BankTransaction.find(filter)
        .sort({ transactionDate: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BankTransaction.countDocuments(filter),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy số liệu thống kê Dashboard MB Bank (Hôm nay, Tháng này, Số dư gần nhất)
   */
  static async getDashboardStats(): Promise<BankDashboardStats> {
    await connectToDatabase();

    const today = getTodayKey();
    const currentMonth = getMonthKey(); // YYYY-MM
    const monthStart = `${currentMonth}-01`;
    const monthEnd = `${currentMonth}-31`;

    const [todayAgg, monthAgg, latestRecord] = await Promise.all([
      // Hôm nay
      BankTransaction.aggregate([
        { $match: { dateKey: today } },
        {
          $group: {
            _id: "$type",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      // Tháng này
      BankTransaction.aggregate([
        {
          $match: {
            dateKey: { $gte: monthStart, $lte: monthEnd },
            type: "IN",
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      // Giao dịch gần nhất để lấy số dư
      BankTransaction.findOne().sort({ transactionDate: -1, _id: -1 }).select("balanceAfter transactionDate").lean(),
    ]);

    let todayInAmount = 0;
    let todayOutAmount = 0;
    let todayInCount = 0;

    for (const item of todayAgg) {
      if (item._id === "IN") {
        todayInAmount = item.totalAmount || 0;
        todayInCount = item.count || 0;
      } else if (item._id === "OUT") {
        todayOutAmount = item.totalAmount || 0;
      }
    }

    const monthInAmount = monthAgg.length > 0 ? monthAgg[0].totalAmount || 0 : 0;
    const monthInCount = monthAgg.length > 0 ? monthAgg[0].count || 0 : 0;

    return {
      todayInAmount,
      todayOutAmount,
      todayInCount,
      monthInAmount,
      monthInCount,
      balanceLatest: latestRecord?.balanceAfter || 0,
      lastUpdated: latestRecord?.transactionDate?.toISOString(),
    };
  }

  /**
   * Xóa một giao dịch (dành cho chủ quán)
   */
  static async deleteTransaction(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await BankTransaction.findByIdAndDelete(id);
    return !!result;
  }
}
