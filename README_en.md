# 🛒 Daily Purchase Admin (Personal Expense & Purchasing Tracker)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel%20Serverless-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**High-Velocity Personal Expense & Daily Purchasing Admin Web App — Minimal SaaS 2026–2027 Standards**  
*Vietnamese Documentation: [README.md (Vietnamese)](README.md)*

</div>

---

## 📋 Table of Contents
1. [Project Overview & Objectives](#1-project-overview--objectives)
2. [Technical Architecture & Serverless Optimization](#2-technical-architecture--serverless-optimization)
3. [UI/UX Standards & Samsung Galaxy A35 5G Ergonomics](#3-uiux-standards--samsung-galaxy-a35-5g-ergonomics)
4. [Core Data Models (Mongoose Schemas)](#4-core-data-models-mongoose-schemas)
5. [API Endpoints & Phase 2 Business Services](#5-api-endpoints--phase-2-business-services)
6. [UI Architecture & Phase 3 Entry Experience](#6-ui-architecture--phase-3-entry-experience)
7. [Single-Owner Security (Secret-Zero Policy)](#7-single-owner-security-secret-zero-policy)
8. [Local Installation & Quickstart](#8-local-installation--quickstart)
9. [Automated Test Suites](#9-automated-test-suites)
10. [Project Roadmap & Acceptance Status](#10-project-roadmap--acceptance-status)

---

## 1. 📖 Project Overview & Objectives

**`daily-purchase-admin`** is a dedicated fullstack web application designed for a **single owner** to record and analyze daily purchasing and shopping expenses (specifically optimized for coffee shop supplies, grocery shopping, and daily personal procurement):
- **On-the-spot mobile recording**: Log purchases immediately after paying from a mobile Samsung Galaxy A35 5G: item name, quantity, unit, unit price, total, and supplier.
- **Independent sequential codes**: Every saved purchase generates an atomic, date-keyed code `PO-YYYYMMDD-XXX`.
- **Auto-Learn Catalog**: Automatically remembers item names, categories, units, and latest purchase prices to provide 0.1s instant suggestions for future entries (includes pre-seeded coffee shop inventory).
- **Two-way price calculation**: Computes total from quantity $\times$ unit price, or reverse-calculates unit price from total paid $\div$ fractional quantity (e.g., buying 1.5kg for 85,000 VNĐ $\rightarrow$ unit price auto-computes to $56,667\text{ VNĐ/kg}$).
- **100% Free on Vercel + MongoDB Atlas (M0)**: Serverless singleton connection caching prevents cold starts and eliminates infrastructure costs.

---

## 2. 🛠️ Technical Architecture & Serverless Optimization

### Tech Stack
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Fullstack React 19, Server Actions & API Route Handlers |
| **Database** | MongoDB Atlas (M0 Free) | Mongoose 8 with Singleton Connection Caching (`global.mongooseCache`) |
| **Styling** | Tailwind CSS v3.4 | Neutral Zinc/Slate palette, 4px/8px grid system, 1px solid borders |
| **Security** | Web Crypto & Native JWT | 90-day HttpOnly cookie, timing-safe credential verification |
| **Icons** | Lucide React | Minimal business icons; zero flashy AI icons |
| **Timezone** | `Asia/Ho_Chi_Minh` | Standardized `dateKey` in UTC+7 to prevent date shifting on late-night entries |

---

## 3. 📱 UI/UX Standards & Samsung Galaxy A35 5G Ergonomics

Built strictly to **Minimal SaaS 2026–2027** aesthetics and pixel-perfect ergonomics for the **Samsung Galaxy A35 5G**:
- **Display Viewport**: 6.6", 19.5:9 ratio, CSS Viewport `360px – 412px`.
- **No Mobile Auto-Zoom**: All `<input>`, `<select>`, and `<textarea>` elements enforce $\ge 16\text{px}$ (`text-base`).
- **Touch Target Hitboxes**: Buttons, quick chips, and bottom navigation tabs enforce $\ge 44\text{px} \times 44\text{px}$ (`min-h-[44px]`, `h-11`, `h-12`).
- **Monospaced Numerical Columns**: All financial figures and quantities use `tabular-nums font-mono` for vertical alignment.
- **No Horizontal Scroll**: Strict `overflow-x: hidden` across the entire viewport.
- **Zero AI Icons**: Absolutely no sparkles, wands, robots, or garish gradients.

---

## 4. 🗄️ Core Data Models (Mongoose Schemas)

1. **`Counter` (`counter.model.ts`)**: Atomic sequence counter per dateKey to produce `PO-YYYYMMDD-XXX`.
2. **`CatalogItem` (`catalog-item.model.ts`)**: Auto-learning catalog:
   - `name`, `normalizedName` (indexed), `category`, `defaultUnit`, `lastUnitPrice`, `minUnitPrice`, `maxUnitPrice`, `usageCount`.
3. **`PurchaseLog` (`purchase-log.model.ts`)**: Purchase records:
   - `code` (unique), `purchaseDate`, `dateKey` (`YYYY-MM-DD` in VN time), `supplier`, `paymentMethod` (`CASH` | `TRANSFER`), `items` (`name`, `category`, `unit`, `quantity`, `unitPrice`, `lineTotal`, `note`), `totalAmount`, `itemCount`, `note`.

---

## 5. 🔌 API Endpoints & Phase 2 Business Services

- `POST /api/purchases`: Creates a purchase record (atomic `PO-YYYYMMDD-XXX`, auto-learns catalog).
- `GET /api/purchases`: Queries history by single dateKey, date range, or unaccented query.
- `GET /api/purchases/[id]`, `PUT`, `DELETE`: Read, update, and delete purchases.
- `GET /api/catalog`: Instant suggestions (`?q=...`) or paginated list (`?category=...&page=...`).
- `GET /api/catalog?seed=true`: Seeds 17 starter items for coffee shops and F&B.
- `POST /api/catalog`, `PUT`, `DELETE`: Catalog CRUD operations.
- `GET /api/reports`: KPI metrics, daily spending list, category breakdown, top 10 items.
- `GET /api/export/csv`: Exports CSV with UTF-8 BOM (`\uFEFF`) for clean Excel viewing on Windows.
- `GET /api/export/backup`: Downloads full standalone JSON backup.
- `POST /api/export/backup`: Restores data using Choice A (Merge / Upsert strategy).

---

## 6. 🎨 UI Architecture & Phase 3 Entry Experience

### 6.1. Adaptive Navigation Shell
- **Desktop ($\ge 1024\text{px}$)**: Fixed left sidebar (`DesktopSidebar`, `w-64`) with 4-item navigation and quick "+ Ghi hàng" action.
- **Galaxy A35 5G Mobile ($< 1024\text{px}$)**:
  - `MobileTopHeader`: Slim sticky header showing today's date, day total, and quick refresh.
  - `MobileBottomNav`: Fixed bottom bar (`h-16`, `pb-safe`) with 4 tabs and a thumb-friendly **center round `+ Ghi hàng` button**.

### 6.2. 1-Touch Quick Entry Drawer (`QuickEntryDrawer`)
- **Mode 1 - Quick Single Item (`QuickSingleItemForm`)**:
  - Instant unaccented item autocomplete (`ItemAutocomplete`) in 0.1s.
  - Two-way calculation (Quantity $\times$ Unit Price $\rightarrow$ Total, or Quantity + Paid Total $\rightarrow$ Unit Price).
  - Quick cash chips (10k, 20k, 50k, 100k, 200k, 500k) and dynamic multiplier suggestions.
- **Mode 2 - Batch Receipt Entry (`BatchReceiptForm`)**:
  - Enter multiple items consecutively on a single store trip.
  - Live real-time subtotal accumulation.

### 6.3. Four Core Admin Screens
1. **Screen 1: Today (`/`)**:
   - 3 Bento KPI cards: Today, Yesterday, This Month.
   - Today's purchase feed with item breakdowns, payment badges, and quick delete.
   - Clean empty state with high-contrast action CTA.
2. **Screen 2: Daily Log (`/history`)**:
   - Quick date filters (Today, Yesterday, Last 7 Days, This Month, All).
   - Unaccented search input.
   - Accordion view grouped by `dateKey` with bold daily total.
3. **Screen 3: Items & Prices (`/catalog`)**:
   - Category filter pills (Coffee, Dairy, Packaging, Produce...).
   - Cards showing latest price, min-max price span, and total usage count.
   - Add/edit modal and 1-click F&B starter seed.
4. **Screen 4: Reports & Backup (`/reports`)**:
   - Month selector with pure CSS bar chart (`SpendingBarList`).
   - Category breakdown (`CategoryBreakdown`) with progress bars and percentages.
   - Top 10 spending items (`TopSpendingList`).
   - Excel (CSV) export and JSON Backup / Restore (Merge Strategy).

---

## 7. 🔐 Single-Owner Security (Secret-Zero Policy)

- All secrets (`OWNER_USERNAME`, `OWNER_PASSWORD`, `JWT_SECRET`, `MONGODB_URI`) are read strictly from environment variables.
- HMAC-SHA256 JWT signed via native Node.js / Web Crypto API, stored in a 90-day `HttpOnly; Secure; SameSite=Lax` cookie.
- Edge Middleware guards all admin routes and `/api/*` endpoints.

---

## 8. 💻 Local Installation & Quickstart

```bash
# 1. Navigate to project directory
cd 08_daily-purchase-admin

# 2. Configure environment variables
cp .env.example .env.local

# 3. Run all automated tests
npm test

# 4. Start development server
npm run dev
```

---

## 9. 🧪 Automated Test Suites

| Test Suite | Test Cases | Status | Description |
| :--- | :---: | :---: | :--- |
| **Phase 3 UI Logic & Workflow Verification** | 4 | ✅ PASS | Two-way price calculations, fixed & dynamic cash chips, receipt aggregation, F&B autocomplete |
| **Samsung Galaxy A35 5G UI/UX Audit** | 5 | ✅ PASS | Font-size $\ge 16\text{px}$ against auto-zoom, touch targets $\ge 44\text{px}$, tabular-nums alignment, zero AI icons, no horizontal overflow |
| **Purchase Workflow & Auto-Learn** | 3 | ✅ PASS | Atomic PO code generation, two-way calculations, Auto-Learn state machine price tracking |
| **Reports Aggregation & Analytics** | 3 | ✅ PASS | KPI calculation using VN dateKeys, category percentage breakdown, top spending ranking |
| **CSV Export & JSON Backup Merge** | 3 | ✅ PASS | UTF-8 BOM prefix, JSON backup schema, safe Merge / Upsert restoration |
| **Financial Currency Utils** | 5 | ✅ PASS | VNĐ formatting, string parsing (150k, 1.5tr), line totals, reverse unit price, currency chips |
| **Vietnam Timezone & Date** | 6 | ✅ PASS | Generates YYYY-MM-DD dateKey in Asia/Ho_Chi_Minh timezone, yesterday, this month, date ranges |
| **Vietnamese Search Normalization** | 3 | ✅ PASS | Diacritic stripping, token-based unaccented matching, regex generator |
| **Single-Owner Authentication** | 4 | ✅ PASS | Signs and verifies HMAC-SHA256 JWT, rejects tampered tokens, timing-safe password check |
| **Secret-Zero Scanning Audit** | 1 | ✅ PASS | Scans entire repository, confirms 0 hardcoded credentials or passwords |
| **TOTAL** | **36** | **100% PASS** | **36/36 tests PASS, zero defects, ready for Phase 3 acceptance** |

---

## 10. 🗺️ Project Roadmap & Acceptance Status

| Phase | Core Deliverables | 11-Stage Lifecycle Status |
| :---: | :--- | :---: |
| **Phase 1** | Next.js 15, Mongoose Singleton, 3 Schemas, Utils, Single-Owner Auth & Galaxy A35 Shell | ✅ **COMPLETED & 100% TEST PASS** |
| **Phase 2** | API Route Handlers (`/purchases`, `/catalog`, `/reports`, `/export`), Auto-Learn Catalog & Integration Tests | ✅ **COMPLETED & 100% TEST PASS** |
| **Phase 3** | UI Design System Minimal SaaS 2026-2027, 4 Galaxy A35 Screens, Quick Entry Drawer | ✅ **COMPLETED & 100% TEST PASS** |
| **Phase 4** | E2E Regression, Secret Scanning Audit, Vercel Deployment & MongoDB Atlas Setup Guide | ⏳ Ready to Start |
