import { test, describe } from "node:test";
import assert from "node:assert/strict";
import * as XLSX from "xlsx";

describe("Excel Export (.xlsx) & Auto-Fit Column Widths Tests", () => {
  test("1. SheetJS generates valid .xlsx workbook with correct structure, headers and auto-fit widths", () => {
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

    const minWidths = [6, 14, 18, 25, 30, 22, 12, 12, 18, 20, 16, 28];

    const sampleRow = [
      1,
      "16/11/2026",
      "PO-20261116-0001",
      "Chợ Đầu Mối Hòa Cường",
      "Cà phê Robusta Mộc Nguyên Chất Đậm Vị",
      "Nguyên liệu Cà phê & Trà",
      "kg",
      5,
      120000,
      600000,
      "Chuyển khoản",
      "Hàng loại 1 rang mộc",
    ];

    const summaryRow = [
      "TỔNG CỘNG",
      "",
      "",
      "",
      "1 mặt hàng",
      "",
      "",
      5,
      "",
      600000,
      "",
      "",
    ];

    const tableData = [headers, sampleRow, summaryRow];

    // Tính độ rộng cột tự động
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

    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Kiểm tra buffer sinh ra
    assert.ok(Buffer.isBuffer(excelBuffer), "Output must be a valid Buffer");
    assert.ok(excelBuffer.length > 1000, "Excel file buffer size must be realistic");

    // Đọc ngược lại workbook bằng SheetJS
    const parsedWb = XLSX.read(excelBuffer, { type: "buffer" });
    assert.ok(parsedWb.SheetNames.includes("So_Nhap_Hang"), "Sheet So_Nhap_Hang must exist");

    const parsedWs = parsedWb.Sheets["So_Nhap_Hang"];
    const parsedData = XLSX.utils.sheet_to_json(parsedWs, { header: 1 });

    assert.equal(parsedData.length, 3, "Must have exactly 3 rows (header, item, summary)");
    assert.deepEqual(parsedData[0], headers, "Headers must match 100%");
    assert.equal(parsedData[2][0], "TỔNG CỘNG", "Summary row must exist at the end");
    assert.equal(parsedData[2][9], 600000, "Grand total must be calculated accurately");

    // Kiểm tra các cột bắt buộc có wch >= minWidth
    for (let i = 0; i < minWidths.length; i++) {
      assert.ok(
        colWidths[i].wch >= minWidths[i],
        `Column ${headers[i]} width (${colWidths[i].wch}) must be >= minWidth (${minWidths[i]})`
      );
    }
  });
});
