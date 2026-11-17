# 🛒 Daily Purchase Admin (Personal Expense & Purchasing Tracker)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20M0%20Free-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel%20sin1%20Singapore-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![PWA](https://img.shields.io/badge/PWA-Standalone%20A35-purple?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**High-Velocity Personal Expense & Daily Purchasing Admin Web App — Fresh & Free SaaS 2026–2027 Standards**  
*Vietnamese Documentation: [README.md (Vietnamese)](README.md)*

</div>

---

## 📋 Table of Contents
1. [Project Overview & Objectives](#1-project-overview--objectives)
2. [Technical Architecture & Serverless Optimization](#2-technical-architecture--serverless-optimization)
3. [Fresh & Free UI/UX Standards & Samsung Galaxy A35 5G PWA](#3-fresh--free-uiux-standards--samsung-galaxy-a35-5g-pwa)
4. [Core Data Models (Mongoose Schemas)](#4-core-data-models-mongoose-schemas)
5. [API Endpoints & Business Services](#5-api-endpoints--business-services)
6. [UI Architecture & Purchasing Entry Experience](#6-ui-architecture--purchasing-entry-experience)
7. [MB Bank Tracker & Countertop VietQR](#7-mb-bank-tracker--countertop-vietqr)
8. [Single-Owner Security (Secret-Zero Policy)](#8-single-owner-security-secret-zero-policy)
9. [MongoDB Atlas M0 Free Tier Setup Guide](#9-mongodb-atlas-m0-free-tier-setup-guide)
10. [Vercel Deployment Guide (Singapore `sin1`)](#10-vercel-deployment-guide-singapore-sin1)
11. [Samsung Galaxy A35 5G Standalone PWA Installation](#11-samsung-galaxy-a35-5g-standalone-pwa-installation)
12. [Local Development & Comprehensive Automated Testing](#12-local-development--comprehensive-automated-testing)
13. [11-Stage Project Roadmap & Acceptance Status](#13-11-stage-project-roadmap--acceptance-status)

---

## 1. 📖 Project Overview & Objectives

**`daily-purchase-admin`** is a dedicated fullstack web application designed for a **single owner** to record and analyze daily purchasing and shopping expenses (specifically optimized for coffee shop supplies, grocery shopping, and daily personal procurement):
- **On-the-spot mobile recording**: Log purchases immediately after paying from a mobile Samsung Galaxy A35 5G: item name, quantity, unit, unit price, total, and supplier.
- **Independent sequential codes**: Every saved purchase generates an atomic, date-keyed code `PO-YYYYMMDD-XXX`.
- **Auto-Learn Supplier & Catalog**: Automatically learns and updates the usage frequency of Suppliers (`Supplier`) and Catalog Items (`CatalogItem`), with support for custom measurement units.
- **Two-way price calculation**: Computes total from quantity $\times$ unit price, or reverse-calculates unit price from total paid $\div$ fractional quantity (e.g., buying 1.5kg for 85,000 VNĐ $\rightarrow$ unit price auto-computes to $56,667\text{ VNĐ/kg}$).
- **MB Bank Tracker & VietQR**: Captures balance changes automatically via secure Webhook, auto-refreshes every 10 seconds, and displays dynamic countertop VietQR codes.
- **Excel `.xlsx` Export with Auto Column Widths**: Automatically calculates column widths (`wch`) to prevent truncated text or `###` overflows, finished with a **GRAND TOTAL** summary row.
- **100% Free on Vercel + MongoDB Atlas (M0)**: Serverless singleton connection caching prevents cold starts and eliminates infrastructure costs.

---

## 2. 🛠️ Technical Architecture & Serverless Optimization

### Tech Stack
| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Fullstack React 19, Server Actions & API Route Handlers |
| **Database** | MongoDB Atlas (M0 Free) | Mongoose 8 with Singleton Connection Caching (`global.mongooseCache`) |
| **Hosting** | Vercel Serverless (sin1) | Routed to Singapore region for ultra-low latency (20–40ms to Vietnam) |
| **Styling** | Tailwind CSS v3.4 | **Fresh & Free** palette (Mint Green, Peach Orange, Sky Blue), `#D8EFE9` borders |
| **Security** | Web Crypto & Native JWT | 90-day HttpOnly cookie, timing-safe credential verification, Webhook Secret |
| **Icons** | Lucide React | Minimal business icons; zero flashy AI icons |
| **Spreadsheet** | SheetJS (`xlsx`) | Generates genuine `.xlsx` files with auto-calculated column widths |
| **Timezone** | `Asia/Ho_Chi_Minh` | Standardized `dateKey` in UTC+7 to prevent date shifting on late-night entries |

---

## 3. 🎨 Fresh & Free UI/UX Standards & Samsung Galaxy A35 5G PWA

The application embraces a **Fresh & Free (Bright, Liberating, Crisp)** aesthetic optimized for both mobile screens (**Samsung Galaxy A35 5G**) and Desktop/Laptop displays:
- **Color Palette**:
  - `bg-app`: `#F4FBF9` (Calming, bright jade tint).
  - `bg-surface`: `#FFFFFF` with `1px solid #D8EFE9` border and soft mint shadow `shadow-[0_4px_20px_-4px_rgba(16,185,129,0.08)]`.
  - **Mint Green (`mint`)**: `#10B981` (Primary) — Core brand identity, fresh and reliable.
  - **Peach Orange (`peach`)**: `#FB923C` / `#F97316` (Accent) — Dedicated to CTA buttons, currency highlights, quick chips.
  - **Sky Blue (`sky`)**: `#0EA5E9` (Secondary) — Date filters, supplier badges, MB Bank statistics.
- **Mobile Viewport**: 6.6" display, 19.5:9 aspect ratio, CSS viewport `360px – 412px`.
- **Anti Auto-Zoom on Mobile**: All `<input>`, `<select>`, `<textarea>` tags strictly enforce $\ge 16\text{px}$ (`text-base`).
- **44px Minimum Touch Targets**: Buttons, touch keys, and navigation tabs adhere to $\ge 44\text{px} \times 44\text{px}$ (`min-h-[44px]`).
- **Monetary Alignment**: `tabular-nums font-mono` applied across all quantities and currency numbers.
- **Zero Horizontal Overflow & Zero Clipping**: `overflow-x: hidden` enforced; decoupled headers prevent overlapping segmented controls.
- **PWA Standalone Mode**: Web App Manifest with vector SVG icons, launching full-screen without browser URL bars.

---

## 4. 🗄️ Core Data Models (Mongoose Schemas)

1. **`Counter` (`counter.model.ts`)**: Atomic date-based sequential numbering for purchase codes `PO-YYYYMMDD-XXX`.
2. **`Supplier` (`supplier.model.ts`)**: Auto-learning supplier registry:
   - `name`, `normalizedName` (unique indexed), `category`, `note`, `usageCount`, `lastUsedAt`.
3. **`CatalogItem` (`catalog-item.model.ts`)**: Auto-learning items catalog:
   - `name`, `normalizedName` (indexed), `category`, `defaultUnit`, `lastUnitPrice`, `minUnitPrice`, `maxUnitPrice`, `usageCount`.
4. **`PurchaseLog` (`purchase-log.model.ts`)**: Purchase records:
   - `code` (unique), `purchaseDate`, `dateKey` (`YYYY-MM-DD` in VN timezone), `supplier`, `paymentMethod` (`CASH` | `TRANSFER`), `items`, `totalAmount`, `itemCount`, `note`.
   - **Strict 1-Time Edit Lock**: `editCount` (Number, default 0, max 1), `editedAt` (Date). When `editCount >= 1`, backend rejects any further edit attempts with HTTP 400 and the UI disables the edit button with a badge `Đã sửa (1/1)`.
5. **`BankTransaction` (`bank-transaction.model.ts`)**: MB Bank balance transactions:
   - `transactionRef` (unique indexed), `bankName`, `accountNumber`, `type` (`IN` | `OUT`), `amount`, `balanceAfter`, `senderName`, `content`, `transactionDate`, `dateKey`, `rawNotification`, `source`.

---

## 5. 🔌 API Endpoints & Business Services

- `POST /api/purchases`: Creates new purchase record, increments sequential code, auto-learns catalog & supplier.
- `GET /api/purchases`: Queries history by dateKey, date range, or unaccented keyword search.
- `GET /api/purchases/[id]`: Views purchase record details.
- `PUT /api/purchases/[id]`: Updates purchase record (enforces strict **1-time edit limit**, tracking `editCount` and `editedAt`).
- `DELETE /api/purchases/[id]`: Deletes purchase records (paired with Fresh & Free `ConfirmDeleteModal`).
- `GET /api/suppliers`: Lists suppliers with support for both instant autocomplete (`?q=...`) and paginated search (`?query=...` or `?category=...`).
- `POST /api/suppliers` & `PUT`, `DELETE`: Manages suppliers manually or automatically.
- `GET /api/catalog`: Instant item suggestions (`?q=...`), dynamic custom units list (`?units=true`).
- `GET /api/catalog?seed=true`: Seeds 17 common F&B starter supplies.
- `POST /api/catalog` & `PUT`, `DELETE`: Catalog CRUD operations.
- `GET /api/reports`: Aggregates monthly KPIs using safe string intervals `YYYY-MM-01` to `YYYY-MM-31`, daily trend, category breakdown, top spending items.
- `GET /api/export/excel`: Exports genuine `.xlsx` workbook with auto-fit column widths, supporting filters by day (`dateKey`), by week/custom range (`startDateKey` & `endDateKey`), and by month (`month`). Features day-by-day blank row separation, per-day **TỔNG NGÀY** subtotal rows, and an overall **TỔNG CỘNG TOÀN KỲ** grand total row.
- `GET /api/export/csv`: Exports CSV with UTF-8 BOM (`\uFEFF`).
- `GET /api/export/backup`: Generates complete JSON database backup (including suppliers).
- `POST /api/export/backup`: Restores data via safe Merge/Upsert strategy (Choice A).
- `POST /api/webhooks/mbbank`: Webhook listener for Android Notification Forwarder and SePay/Casso (guarded by `MBBANK_WEBHOOK_SECRET`).
- `GET /api/mbbank`: Retrieves transaction list and dashboard KPIs (`?stats=true`).
- `POST /api/mbbank`: 1-click test simulation for transaction pushes.
- `DELETE /api/mbbank/[id]`: Deletes transaction record.

---

## 6. 📱 UI Architecture & Purchasing Entry Experience

### 6.1. Adaptive Layout
- **Desktop / Laptop ($\ge 1024\text{px}$)**: Centered dialog modal (`max-w-4xl`) with 2 balanced columns (Single mode) and spreadsheet table view (Batch mode with per-row category selection).
- **Mobile Galaxy A35 5G ($< 1024\text{px}$)**: Smooth bottom sheet drawer with $\ge 44\text{px}$ touch targets and $\ge 16\text{px}$ input font size.

### 6.2. Five Core Admin Pages
1. **Today (`/`)**: 3 Bento KPI cards, daily transaction cards, 1-time edit button, `ConfirmDeleteModal`, empty state.
2. **History (`/history`)**: Date filters (Today, Yesterday, 7 Days, This Month, All), unaccented search, Accordion grouping by date, safe edit and delete actions.
3. **Catalog & Suppliers (`/catalog`)**: 2-tab interface with accurate initial counts (`Mặt hàng (X)` and `Nơi mua (Y)`), parallel loading, custom unit management.
4. **Reports & Excel Export (`/reports`)**: Month navigation bar (`< Prev Month`, `Next Month >`, month picker `YYYY-MM`), `AbortController` against race conditions, advanced `ExcelExportFilterModal` (Day / Week / Month / Custom Range).
5. **MB Bank Tracker & VietQR (`/mb-bank`)**: Live 10s auto-polling, 3 KPI cards, dynamic countertop VietQR code, test simulator modal, `ConfirmDeleteModal` on deletions, and 2-minute setup guide.

---

## 7. 🏦 MB Bank Tracker & Countertop VietQR

1. **Smart Parser**: Regex extracts Android notification push texts and handles SePay/Casso webhook JSON.
2. **Deduplication**: Deterministic hash generation ensures zero duplicated records.
3. **Dynamic Countertop VietQR**: Integrates standard VietQR image generation with real-time bill amount inputs.

---

## 8. 🔐 Single-Owner Security (Secret-Zero Policy)

- Zero hardcoded secrets: `OWNER_USERNAME`, `OWNER_PASSWORD`, `JWT_SECRET`, `MONGODB_URI`, `MBBANK_WEBHOOK_SECRET` are read exclusively from environment variables.
- Native HMAC-SHA256 JWT in `HttpOnly; Secure; SameSite=Lax` 90-day cookie.
- Edge Middleware guards all admin routes except explicit public endpoints (`/login`, `/api/webhooks/mbbank`).

---

## 9. ☁️ MongoDB Atlas M0 Free Tier Setup Guide

1. Sign up at [https://cloud.mongodb.com](https://cloud.mongodb.com).
2. Create an **M0 Free** cluster in **AWS Singapore (`ap-southeast-1`)**.
3. Create a Database User with read/write privileges.
4. Whitelist IP `0.0.0.0/0` for Vercel Serverless compatibility.
5. Copy connection string into `MONGODB_URI`.

---

## 10. 🚀 Vercel Deployment Guide (Singapore `sin1`)

1. Push code to your GitHub repository.
2. In Vercel Dashboard, import `daily-purchase-admin`.
3. Configure Environment Variables:
   - `OWNER_USERNAME`, `OWNER_PASSWORD`, `JWT_SECRET`, `MONGODB_URI`
   - `MBBANK_WEBHOOK_SECRET`, `NEXT_PUBLIC_MBBANK_ACCOUNT_NO`, `NEXT_PUBLIC_MBBANK_ACCOUNT_NAME`
4. Click **Deploy**. Dynamic routes configured with `export const dynamic = 'force-dynamic'` build with 100% success.

---

## 11. 📲 Samsung Galaxy A35 5G Standalone PWA Installation

1. Open Chrome or Samsung Internet, navigate to your Vercel URL.
2. Tap menu (3 dots) $\rightarrow$ Select **Add to Home screen**.
3. Launches standalone with 90-day persistent session.

---

## 12. 💻 Local Development & Comprehensive Automated Testing

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Run all 74 automated tests
npm test

# 4. Type check TypeScript
npx tsc --noEmit

# 5. Production build test
npm run build

# 6. Start development server
npm run dev
```

### Automated Test Results (74/74 Tests 100% PASS)

| Test Suite | Tests Count | Status | Description |
| :--- | :---: | :---: | :--- |
| **Phase 4 E2E Full Regression** | 23 | ✅ PASS | Complete 11 functional domains |
| **MB Bank Parser Unit Tests** | 5 | ✅ PASS | Android push, SMS, SePay JSON, deterministic deduplication |
| **Excel Export Unit Tests** | 1 | ✅ PASS | SheetJS `.xlsx` workbook, 12 columns, `wch` auto-fit, grand total |
| **Reports Month Navigation Tests** | 3 | ✅ PASS | Date string intervals `YYYY-MM-01` to `YYYY-MM-31`, empty month |
| **Supplier & Custom Units Tests** | 3 | ✅ PASS | Unaccented normalization, `usageCount` state machine, custom units |
| **MB Bank Webhook Routing Tests** | 2 | ✅ PASS | Bearer, X-Secret, query param auth, payload routing |
| **Samsung Galaxy A35 5G UI/UX Audit** | 5 | ✅ PASS | $\ge 16\text{px}$ font, $\ge 44\text{px}$ touch targets, `tabular-nums`, zero AI icons |
| **Financial Currency Utils** | 5 | ✅ PASS | VND format, string parse, line total, reverse price, cash chips |
| **Vietnam Timezone & Date** | 7 | ✅ PASS | `dateKey` in UTC+7, yesterday, this month, date ranges |
| **Vietnamese Search Normalization** | 3 | ✅ PASS | Diacritic stripping, token search, regex generator |
| **Single-Owner Authentication** | 4 | ✅ PASS | JWT HMAC-SHA256, tampered token rejection, timing-safe auth |
| **Phase 3 UI Logic & Workflow** | 4 | ✅ PASS | 2-way calculations, quick cash chips, receipt accumulation, F&B autocomplete |
| **Purchase Workflow & Auto-Learn** | 3 | ✅ PASS | Sequential PO code, auto-learn catalog state machine |
| **Reports Aggregation & Analytics** | 3 | ✅ PASS | DateKey aggregation, category percentages, top spending ranking |
| **CSV Export & JSON Backup Merge** | 3 | ✅ PASS | UTF-8 BOM, JSON backup structure, Choice A Merge strategy |
| **Secret-Zero Scanning Audit** | 1 | ✅ PASS | Complete repository scan, 0 hardcoded secrets |
| **TOTAL** | **74** | **100% PASS** | **74/74 tests PASS with zero latent defects** |

---

## 13. 🗺️ 11-Stage Project Roadmap & Acceptance Status

| Stage | Focus Area | Status |
| :---: | :--- | :---: |
| **1. GRILL** | Clarified master upgrade requirements (Fresh & Free, Supplier, Unit, Excel, MB Bank) | ✅ **COMPLETED** |
| **2. PLAN APPROVED** | Comprehensive plan approved | ✅ **COMPLETED** |
| **3. IMPLEMENT** | Realized all 6 upgrade categories | ✅ **COMPLETED** |
| **4. TEST** | Developed and executed new unit & integration tests | ✅ **COMPLETED** |
| **5. FIX ↺** | Resolved TypeScript, regex boundary, and styling bugs | ✅ **COMPLETED** |
| **6. TEST PASS** | 74/74 automated tests at 100% PASS | ✅ **COMPLETED** |
| **7. AUDIT** | Galaxy A35 5G UI/UX & Secret-Zero Audit 100% Clean | ✅ **COMPLETED** |
| **8. HARDEN** | Force-dynamic routes, VietQR configuration, race condition guards | ✅ **COMPLETED** |
| **9. REGRESSION PASS** | 23/23 E2E Full Regression tests at 100% PASS | ✅ **COMPLETED** |
| **10. ACCEPTED** | All 6 categories fully operational and accepted | ✅ **COMPLETED** |
| **11. CLOSED** | Bilingual documentation synchronized & upgrade lifecycle completed | ✅ **COMPLETED** |
