import { connectToDatabase } from "@/lib/mongodb";
import { PurchaseLog } from "@/models/purchase-log.model";
import { CatalogItem } from "@/models/catalog-item.model";
import { Supplier } from "@/models/supplier.model";
import { Counter } from "@/models/counter.model";
import { SavingsCheckin } from "@/models/savings-checkin.model";
import { SavingsSetting } from "@/models/savings-setting.model";
import { formatDateVN, getDateRange } from "@/lib/utils/date";
import * as XLSX from "xlsx";

export interface BackupDataPayload {
  app: string;
  version: string;
  exportedAt: string;
  counters: any[];
  catalogItems: any[];
  purchaseLogs: any[];
  suppliers?: any[];
  savingsCheckins?: any[];
  savingsSettings?: any[];
}

export class ExportService {
  /**
   * Xuất file Excel (.xlsx) chuẩn với phân tách từng ngày, tổng ngày riêng và dòng tổng cộng toàn kỳ
   */
  static async generatePurchaseExcel(
    startDateKey?: string,
    endDateKey?: string,
    monthKey?: string
  ): Promise<Buffer> {
    await connectToDatabase();

    let start = startDateKey;
    let end = endDateKey;

    if (!start && !end) {
      if (monthKey) {
        start = `${monthKey}-01`;
        end = `${monthKey}-31`;
      } else {
        const range = getDateRange("this_month");
        start = range.startDateKey;
        end = range.endDateKey;
      }
    }

    const query: Record<string, any> = {
      dateKey: {
        $gte: start,
        $lte: end,
      },
    };

    const purchases = await PurchaseLog.find(query).sort({ dateKey: -1, code: -1 }).lean();

    const headers = [
      "STT",
      "Ngày mua",
      "Mã phiếu",
      "Nơi mua / Nhà cung cấp",
      "Tên mặt hàng",
      "Nhóm hàng",
      "Đơn vị",
      "Số lượng",
      "Đơn giá (VNĐ)",
      "Thành tiền (VNĐ)",
      "Thanh toán",
      "Ghi chú",
    ];

    const minWidths = [18, 14, 18, 25, 30, 22, 12, 12, 18, 20, 16, 28];

    const tableData: any[][] = [];
    tableData.push(headers);

    // Gom nhóm phiếu theo ngày dateKey để tính tổng ngày và cách dòng
    const groupedByDate: Record<string, typeof purchases> = {};
    for (const p of purchases) {
      const dKey = p.dateKey || "CHUA_RO";
      if (!groupedByDate[dKey]) {
        groupedByDate[dKey] = [];
      }
      groupedByDate[dKey].push(p);
    }

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

    let stt = 1;
    let grandQty = 0;
    let grandTotal = 0;
    let grandItemCount = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      const dKey = sortedDates[i];
      const dayPurchases = groupedByDate[dKey];

      let dayItemCount = 0;
      let dayQty = 0;
      let dayTotal = 0;
      let dateVNStr = "";

      for (const p of dayPurchases) {
        const dateStr = formatDateVN(p.purchaseDate);
        dateVNStr = dateStr;
        const supplierStr = p.supplier || "Không ghi";
        const payMethodStr = p.paymentMethod === "TRANSFER" ? "Chuyển khoản" : "Tiền mặt";
        const receiptNoteStr = p.note || "";

        if (p.items && p.items.length > 0) {
          for (const item of p.items) {
            const itemNoteStr = item.note
              ? item.note + (receiptNoteStr ? ` (${receiptNoteStr})` : "")
              : receiptNoteStr;

            tableData.push([
              stt++,
              dateStr,
              p.code,
              supplierStr,
              item.name,
              item.category || "Khác",
              item.unit,
              item.quantity,
              item.unitPrice,
              item.lineTotal,
              payMethodStr,
              itemNoteStr,
            ]);

            const q = Number(item.quantity) || 0;
            const t = Number(item.lineTotal) || 0;
            dayItemCount += 1;
            dayQty += q;
            dayTotal += t;
          }
        } else {
          tableData.push([
            stt++,
            dateStr,
            p.code,
            supplierStr,
            "—",
            "—",
            "—",
            0,
            0,
            p.totalAmount,
            payMethodStr,
            receiptNoteStr,
          ]);

          dayItemCount += 1;
          dayTotal += Number(p.totalAmount) || 0;
        }
      }

      grandItemCount += dayItemCount;
      grandQty += dayQty;
      grandTotal += dayTotal;

      // Dòng TỔNG NGÀY riêng biệt cho ngày này
      tableData.push([
        "TỔNG NGÀY",
        dateVNStr || dKey,
        "",
        "",
        `${dayItemCount} mặt hàng`,
        "",
        "",
        Math.round(dayQty * 100) / 100,
        "",
        dayTotal,
        "",
        "",
      ]);

      // Dòng trống cách biệt giữa các ngày để chống nhìn nhầm (theo yêu cầu user)
      tableData.push(["", "", "", "", "", "", "", "", "", "", "", ""]);
    }

    // Dòng TỔNG CỘNG TOÀN KỲ ở cuối cùng
    tableData.push([
      "TỔNG CỘNG TOÀN KỲ",
      "",
      "",
      "",
      `${grandItemCount} mặt hàng`,
      "",
      "",
      Math.round(grandQty * 100) / 100,
      "",
      grandTotal,
      "",
      "",
    ]);

    // Tính toán độ rộng cột tự động
    const colWidths = minWidths.map((minW, colIdx) => {
      let maxLen = minW;
      for (const row of tableData) {
        const val = row[colIdx];
        if (val !== undefined && val !== null) {
          const str = typeof val === "number" ? val.toLocaleString("vi-VN") : String(val);
          if (str.length > maxLen) {
            maxLen = str.length;
          }
        }
      }
      return { wch: maxLen + 3 };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    ws["!cols"] = colWidths;
    XLSX.utils.book_append_sheet(wb, ws, "So_Nhap_Hang");

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }

  /**
   * Sinh chuỗi dữ liệu CSV xuất khẩu kèm UTF-8 BOM (\uFEFF)
   * Tương thích 100% với Microsoft Excel tiếng Việt trên Windows
   */
  static async generatePurchaseCSV(startDateKey?: string, endDateKey?: string): Promise<string> {
    await connectToDatabase();

    const range = getDateRange("this_month", startDateKey, endDateKey);
    const query: Record<string, any> = {
      dateKey: {
        $gte: startDateKey || range.startDateKey,
        $lte: endDateKey || range.endDateKey,
      },
    };

    const purchases = await PurchaseLog.find(query).sort({ dateKey: -1, code: -1 }).lean();

    // Tiêu đề cột CSV
    const headers = [
      "Mã Phiếu",
      "Ngày Mua",
      "Nơi Mua / Nhà Cung Cấp",
      "Hình Thức Thanh Toán",
      "Tên Mặt Hàng",
      "Nhóm Hàng",
      "Đơn Vị",
      "Số Lượng",
      "Đơn Giá (VNĐ)",
      "Thành Tiền (VNĐ)",
      "Ghi Chú Mặt Hàng",
      "Ghi Chú Phiếu",
    ];

    const escapeCSV = (field: any) => {
      if (field === null || field === undefined) return "";
      const str = String(field);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows: string[] = [];
    rows.push(headers.map(escapeCSV).join(","));

    for (const p of purchases) {
      const dateStr = formatDateVN(p.purchaseDate);
      const supplierStr = p.supplier || "Không ghi";
      const payMethodStr = p.paymentMethod === "TRANSFER" ? "Chuyển khoản" : "Tiền mặt";
      const receiptNoteStr = p.note || "";

      if (p.items && p.items.length > 0) {
        for (const item of p.items) {
          const row = [
            p.code,
            dateStr,
            supplierStr,
            payMethodStr,
            item.name,
            item.category || "Khác",
            item.unit,
            item.quantity,
            item.unitPrice,
            item.lineTotal,
            item.note || "",
            receiptNoteStr,
          ];
          rows.push(row.map(escapeCSV).join(","));
        }
      } else {
        // Trường hợp phiếu không có món
        const row = [
          p.code,
          dateStr,
          supplierStr,
          payMethodStr,
          "",
          "",
          "",
          0,
          0,
          p.totalAmount,
          "",
          receiptNoteStr,
        ];
        rows.push(row.map(escapeCSV).join(","));
      }
    }

    // Tiền tố \uFEFF là UTF-8 BOM bắt buộc để Excel không bị lỗi font tiếng Việt
    return "\uFEFF" + rows.join("\r\n");
  }

  /**
   * Tạo tệp JSON sao lưu toàn bộ cơ sở dữ liệu
   */
  static async generateBackupJSON(): Promise<BackupDataPayload> {
    await connectToDatabase();

    const [counters, catalogItems, purchaseLogs, suppliers, savingsCheckins, savingsSettings] = await Promise.all([
      Counter.find().lean(),
      CatalogItem.find().lean(),
      PurchaseLog.find().lean(),
      Supplier.find().lean(),
      SavingsCheckin.find().lean(),
      SavingsSetting.find().lean(),
    ]);

    return {
      app: "daily-purchase-admin",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      counters,
      catalogItems,
      purchaseLogs,
      suppliers,
      savingsCheckins,
      savingsSettings,
    };
  }

  /**
   * Phục hồi cơ sở dữ liệu từ file JSON Backup (Lựa chọn A: Merge / Upsert an toàn)
   * Giữ nguyên dữ liệu hiện tại, bổ sung các bản ghi chưa có và cập nhật bản ghi trùng mã
   */
  static async restoreFromBackupJSON(payload: BackupDataPayload) {
    await connectToDatabase();

    if (!payload || payload.app !== "daily-purchase-admin") {
      throw new Error("Tệp sao lưu không hợp lệ hoặc không thuộc hệ thống daily-purchase-admin");
    }

    let restoredCounters = 0;
    let restoredCatalog = 0;
    let restoredPurchases = 0;

    // 1. Merge Counters
    if (Array.isArray(payload.counters)) {
      for (const c of payload.counters) {
        if (!c.key) continue;
        const existing = await Counter.findOne({ key: c.key });
        if (existing) {
          if (c.seq > existing.seq) {
            existing.seq = c.seq;
            await existing.save();
          }
        } else {
          await Counter.create({ key: c.key, seq: c.seq || 0 });
        }
        restoredCounters++;
      }
    }

    // 2. Merge Catalog Items
    if (Array.isArray(payload.catalogItems)) {
      for (const item of payload.catalogItems) {
        if (!item.normalizedName) continue;
        const existing = await CatalogItem.findOne({ normalizedName: item.normalizedName });
        if (existing) {
          existing.lastUnitPrice = item.lastUnitPrice || existing.lastUnitPrice;
          existing.usageCount = Math.max(existing.usageCount, item.usageCount || 1);
          existing.minUnitPrice = Math.min(existing.minUnitPrice || item.minUnitPrice, item.minUnitPrice || 0);
          existing.maxUnitPrice = Math.max(existing.maxUnitPrice || 0, item.maxUnitPrice || 0);
          if (item.defaultUnit) existing.defaultUnit = item.defaultUnit;
          if (item.category) existing.category = item.category;
          await existing.save();
        } else {
          await CatalogItem.create({
            name: item.name,
            normalizedName: item.normalizedName,
            category: item.category || "Khác",
            defaultUnit: item.defaultUnit || "cái",
            lastUnitPrice: item.lastUnitPrice || 0,
            minUnitPrice: item.minUnitPrice || 0,
            maxUnitPrice: item.maxUnitPrice || 0,
            usageCount: item.usageCount || 1,
          });
        }
        restoredCatalog++;
      }
    }

    // 3. Merge Purchase Logs
    if (Array.isArray(payload.purchaseLogs)) {
      for (const p of payload.purchaseLogs) {
        if (!p.code) continue;
        const existing = await PurchaseLog.findOne({ code: p.code });
        if (existing) {
          existing.supplier = p.supplier || existing.supplier;
          existing.paymentMethod = p.paymentMethod || existing.paymentMethod;
          existing.items = p.items || existing.items;
          existing.totalAmount = p.totalAmount || existing.totalAmount;
          existing.itemCount = p.itemCount || existing.itemCount;
          existing.note = p.note || existing.note;
          await existing.save();
        } else {
          await PurchaseLog.create({
            code: p.code,
            purchaseDate: p.purchaseDate ? new Date(p.purchaseDate) : new Date(),
            dateKey: p.dateKey,
            supplier: p.supplier || "",
            paymentMethod: p.paymentMethod || "CASH",
            items: p.items || [],
            totalAmount: p.totalAmount || 0,
            itemCount: p.itemCount || 0,
            note: p.note || "",
          });
        }
        restoredPurchases++;
      }
    }

    // 4. Merge Suppliers
    let restoredSuppliers = 0;
    if (Array.isArray(payload.suppliers)) {
      for (const s of payload.suppliers) {
        if (!s.name) continue;
        await Supplier.upsertByName(s.name, s.category || "Chợ", s.note || "");
        restoredSuppliers++;
      }
    }

    // 5. Merge Savings Checkins
    let restoredCheckins = 0;
    if (Array.isArray(payload.savingsCheckins)) {
      for (const sc of payload.savingsCheckins) {
        if (!sc.dateKey) continue;
        const existing = await SavingsCheckin.findOne({ dateKey: sc.dateKey });
        if (existing) {
          existing.amount = sc.amount !== undefined ? sc.amount : existing.amount;
          existing.isMakeup = sc.isMakeup !== undefined ? sc.isMakeup : existing.isMakeup;
          existing.note = sc.note !== undefined ? sc.note : existing.note;
          await existing.save();
        } else {
          await SavingsCheckin.create({
            dateKey: sc.dateKey,
            amount: sc.amount || 200000,
            isMakeup: !!sc.isMakeup,
            note: sc.note || "",
            checkedInAt: sc.checkedInAt ? new Date(sc.checkedInAt) : new Date(),
          });
        }
        restoredCheckins++;
      }
    }

    // 6. Merge Savings Settings
    if (Array.isArray(payload.savingsSettings)) {
      for (const ss of payload.savingsSettings) {
        if (!ss.key) continue;
        await SavingsSetting.findOneAndUpdate(
          { key: ss.key },
          { $set: { defaultAmount: ss.defaultAmount || 200000, targetMonthlyDays: ss.targetMonthlyDays || 30 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    }

    return {
      success: true,
      restoredCounters,
      restoredCatalog,
      restoredPurchases,
      restoredSuppliers,
      restoredCheckins,
      message: `Đã khôi phục thành công: ${restoredPurchases} phiếu mua hàng, ${restoredCatalog} mặt hàng, ${restoredSuppliers} nơi mua, ${restoredCheckins} ngày điểm danh`,
    };
  }
}
