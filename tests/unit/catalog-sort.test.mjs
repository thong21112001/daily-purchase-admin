import { test, describe } from "node:test";
import assert from "node:assert/strict";

/**
 * Pure simulation of the MongoDB aggregation sort pipeline:
 * zeroPriceFlag = lastUnitPrice > 0 ? 0 : 1
 * Then sort by [zeroPriceFlag asc, price direction]
 */
function sortCatalogItems(items, sortKey) {
  const cloned = [...items];

  switch (sortKey) {
    case "price_asc":
      return cloned.sort((a, b) => {
        const flagA = a.lastUnitPrice > 0 ? 0 : 1;
        const flagB = b.lastUnitPrice > 0 ? 0 : 1;
        if (flagA !== flagB) return flagA - flagB;
        return (a.lastUnitPrice || 0) - (b.lastUnitPrice || 0);
      });

    case "price_desc":
      return cloned.sort((a, b) => {
        const flagA = a.lastUnitPrice > 0 ? 0 : 1;
        const flagB = b.lastUnitPrice > 0 ? 0 : 1;
        if (flagA !== flagB) return flagA - flagB;
        return (b.lastUnitPrice || 0) - (a.lastUnitPrice || 0);
      });

    case "name_asc":
      return cloned.sort((a, b) =>
        a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
      );

    case "name_desc":
      return cloned.sort((a, b) =>
        b.name.localeCompare(a.name, "vi", { sensitivity: "base" })
      );

    case "usage":
    default:
      return cloned.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  }
}

describe("Catalog Sorting & Collation Unit Tests", () => {
  const sampleItems = [
    { name: "Cà phê Robusta Mộc", lastUnitPrice: 180000, usageCount: 25 },
    { name: "Sữa đặc Larosee", lastUnitPrice: 42000, usageCount: 40 },
    { name: "Đường kính trắng Biên Hòa", lastUnitPrice: 26000, usageCount: 15 },
    { name: "Dừa xiêm nạo sợi", lastUnitPrice: 0, usageCount: 5 }, // 0 price item
    { name: "Đá bi sạch", lastUnitPrice: 12000, usageCount: 50 },
    { name: "Cà phê Arabica Cầu Đất", lastUnitPrice: 290000, usageCount: 10 },
    { name: "Bao bì ly nhựa 500ml", lastUnitPrice: 0, usageCount: 8 }, // 0 price item
  ];

  test("price_asc sinks 0 and null prices to bottom", () => {
    const sorted = sortCatalogItems(sampleItems, "price_asc");
    const prices = sorted.map((it) => it.lastUnitPrice);

    // The positive prices must be sorted ascending: 12000, 26000, 42000, 180000, 290000
    assert.deepEqual(prices.slice(0, 5), [12000, 26000, 42000, 180000, 290000]);
    // The 0 prices must be at the very bottom
    assert.equal(prices[5], 0);
    assert.equal(prices[6], 0);
  });

  test("price_desc sorts positive prices descending and sinks 0 prices to bottom", () => {
    const sorted = sortCatalogItems(sampleItems, "price_desc");
    const prices = sorted.map((it) => it.lastUnitPrice);

    // The positive prices must be sorted descending: 290000, 180000, 42000, 26000, 12000
    assert.deepEqual(prices.slice(0, 5), [290000, 180000, 42000, 26000, 12000]);
    // The 0 prices must be at the very bottom
    assert.equal(prices[5], 0);
    assert.equal(prices[6], 0);
  });

  test("Vietnamese collation name_asc places 'D' before 'Đ' and accents properly", () => {
    const items = [
      { name: "Đường cát", lastUnitPrice: 20000 },
      { name: "Dưa gang", lastUnitPrice: 15000 },
      { name: "Cà chua", lastUnitPrice: 10000 },
      { name: "Bơ sáp", lastUnitPrice: 30000 },
      { name: "Đá viên", lastUnitPrice: 12000 },
    ];

    const sorted = sortCatalogItems(items, "name_asc");
    const names = sorted.map((it) => it.name);

    assert.equal(names[0], "Bơ sáp");
    assert.equal(names[1], "Cà chua");
    assert.equal(names[2], "Dưa gang"); // D comes before Đ
    assert.equal(names[3], "Đá viên");
    assert.equal(names[4], "Đường cát");
  });

  test("name_desc reverses Vietnamese collation correctly", () => {
    const items = [
      { name: "Bơ sáp", lastUnitPrice: 30000 },
      { name: "Đường cát", lastUnitPrice: 20000 },
      { name: "Dưa gang", lastUnitPrice: 15000 },
    ];

    const sorted = sortCatalogItems(items, "name_desc");
    const names = sorted.map((it) => it.name);

    assert.equal(names[0], "Đường cát");
    assert.equal(names[1], "Dưa gang");
    assert.equal(names[2], "Bơ sáp");
  });

  test("usage sort orders by usageCount descending", () => {
    const sorted = sortCatalogItems(sampleItems, "usage");
    const counts = sorted.map((it) => it.usageCount);

    assert.equal(counts[0], 50); // Đá bi sạch
    assert.equal(counts[1], 40); // Sữa đặc Larosee
    assert.equal(counts[counts.length - 1], 5); // Dừa xiêm
  });
});
