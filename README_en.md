# 🛒 Daily Purchase Admin (Personal Shopping & Import Ledger)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel%20Serverless-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**High-Speed Personal Goods Purchase & Expense Tracking Admin System adhering to Minimal SaaS 2026–2027 standards**  
*Vietnamese Documentation: [Bản Tiếng Việt (README.md)](README.md)*

</div>

---

## 📋 Table of Contents
1. [Project Overview & Purpose](#1-project-overview--purpose)
2. [Technical Architecture & Serverless Optimization](#2-technical-architecture--serverless-optimization)
3. [UI/UX Design Standards & Samsung Galaxy A35 5G Specification](#3-uiux-design-standards--samsung-galaxy-a35-5g-specification)
4. [Core Data Modeling (Mongoose Schemas)](#4-core-data-modeling-mongoose-schemas)
5. [Single-Owner Security Mechanism (Secret-Zero)](#5-single-owner-security-mechanism-secret-zero)
6. [Local Installation & Setup](#6-local-installation--setup)
7. [Automated Test Suites](#7-automated-test-suites)
8. [Project Roadmap & Acceptance Status](#8-project-roadmap--acceptance-status)

---

## 1. 📖 Project Overview & Purpose

**`daily-purchase-admin`** is a dedicated fullstack web application designed for a **Single-Owner** to record and track daily purchase/procurement expenses (groceries, market trips, supermarket visits, or personal business supplies):
- **Instant On-Site Recording**: Open the app on Samsung Galaxy A35 5G right after checkout: item name, quantity, unit, unit price, total amount, location.
- **Auto-Learning Catalog (`Auto-Learn Catalog`)**: Automatically learns items, units, and latest purchase prices from history to auto-fill future entries.
- **Two-Way Currency Calculation**: Computes line totals from Quantity $\times$ Unit Price, or performs reverse calculation from Total Paid $/$ Quantity when buying bulk/random weight (e.g. 1.5kg costing 85,000 VND $\rightarrow$ auto-computes unit price: 56,667 VND/kg).
- **100% Free on Vercel + MongoDB Atlas (M0)**: Optimized serverless connection caching with zero cold-start latency and zero infrastructure operating cost.

---

## 2. 🛠️ Technical Architecture & Serverless Optimization

### Tech Stack
| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Fullstack React 19, Server Actions & API Route Handlers |
| **Database** | MongoDB Atlas (M0 Free) | Mongoose 8 with Singleton Connection Caching (`global.mongooseCache`) |
| **Styling** | Tailwind CSS v3.4 | Neutral Slate/Zinc palette, strict 4px/8px grid, 1px solid hairline borders |
| **Security** | Web Crypto & Native JWT | 90-day HttpOnly cookie session, timing-safe password verification |
| **Icons** | Lucide React | Clean utilitarian business icons, zero decorative AI symbols |
| **Timezone** | `Asia/Ho_Chi_Minh` | Strict UTC+7 dateKey anchoring preventing day drift on late-night purchases |

---

## 3. 📱 UI/UX Design Standards & Samsung Galaxy A35 5G Specification

The system is designed following **Minimal SaaS 2026–2027** standards, pixel-perfected for the reference device **Samsung Galaxy A35 5G**:
- **Display Size**: 6.6" screen, 19.5:9 aspect ratio, CSS Viewport `360px – 412px`.
- **Zero Horizontal Overflow**: Strict `overflow-x: hidden` across the entire layout.
- **Minimum Touch Targets**: All interactive elements $\ge 44\text{px} \times 44\text{px}$ (`h-11`/`h-12`).
- **Mobile Auto-Zoom Prevention**: Font-size in all `<input>`, `<select>` elements $\ge 16\text{px}$ (`text-base`).
- **Tabular Data Alignment**: All quantities and VNĐ currencies strictly formatted with `font-mono tabular-nums`.
- **Thumb Zone Ergonomics**: Prominent **`+ Ghi hàng`** button centered in the fixed `BottomNav` (`h-16`, `pb-safe`) for effortless one-thumb operation.

---

## 4. 🗄️ Core Data Modeling (Mongoose Schemas)

1. **`Counter` (`counters`)**:
   - Atomic sequence counter (`seq`) generating daily purchase codes: `PO-YYYYMMDD-001`, `002`...
2. **`CatalogItem` (`catalog_items`)**:
   - Automatically learned catalog: `name`, `normalizedName` (index), `category`, `defaultUnit`, `lastUnitPrice`, `minUnitPrice`, `maxUnitPrice`, `usageCount`.
3. **`PurchaseLog` (`purchase_logs`)**:
   - Stores purchase events: `code`, `purchaseDate`, `dateKey` (index), `supplier`, `paymentMethod` (`CASH` / `TRANSFER`), `items` array, `totalAmount`, `itemCount`, `note`.

---

## 5. 🔐 Single-Owner Security Mechanism (Secret-Zero)

- **No Public Registration**: Single-owner access only.
- **Secret-Zero Policy (Hard Lock #3)**: Zero hardcoded credentials in source code. All secrets loaded from environment variables:
  - `OWNER_USERNAME`: Administrator username.
  - `OWNER_PASSWORD`: Password or 6-digit PIN.
  - `JWT_SECRET`: Secret key for JWT signing.
  - `MONGODB_URI`: MongoDB Atlas connection string.
- **Middleware Guard**: `src/middleware.ts` utilizes native Web Crypto to protect all routes and API endpoints, redirecting unauthenticated users to `/login`.

---

## 6. 💻 Local Installation & Setup

```bash
# 1. Navigate to project root
cd d:\01_HOME\005_VIBE_AI\08_daily-purchase-admin

# 2. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your OWNER_PASSWORD, JWT_SECRET, and MONGODB_URI

# 3. Run automated tests
npm test

# 4. Start development server (when dependencies are installed)
npm run dev
```

---

## 7. 🧪 Automated Test Suites

| Test Suite | Test Cases | Status | Description |
| :--- | :---: | :---: | :--- |
| **Financial Currency Utils** | 5 | ✅ PASS | VNĐ formatting, string parsing (150k, 1.5tr), line totals, reverse unit price, currency chips |
| **Vietnam Timezone & Date** | 6 | ✅ PASS | Generates YYYY-MM-DD dateKey in Asia/Ho_Chi_Minh timezone, yesterday, this month, date ranges |
| **Vietnamese Search Normalization** | 3 | ✅ PASS | Diacritic stripping, token-based unaccented matching, regex generator |
| **Single-Owner Authentication** | 4 | ✅ PASS | Signs and verifies HMAC-SHA256 JWT, rejects tampered tokens, timing-safe password check |
| **Secret-Zero Scanning Audit** | 1 | ✅ PASS | Scans entire repository, confirms 0 hardcoded credentials or passwords |
| **TOTAL** | **19** | **100% PASS** | **Zero failures, ready for Phase 2** |

---

## 8. 🗺️ Project Roadmap & Acceptance Status

| Phase | Core Deliverables | 11-Stage Lifecycle Status |
| :---: | :--- | :---: |
| **Phase 1** | Next.js 15, Mongoose Singleton, 3 Schemas, Utils, Single-Owner Auth & Galaxy A35 Shell | ✅ **COMPLETED & 100% TEST PASS** |
| **Phase 2** | API Route Handlers (`/purchases`, `/catalog`, `/reports`, `/export`), Auto-Learn Catalog & Integration Tests | ⏳ Ready for Implementation |
| **Phase 3** | UI Design System Minimal SaaS 2026-2027, 4 Galaxy A35 Screens, Quick Entry Drawer | ⏳ Pending Phase 2 |
| **Phase 4** | E2E Regression, Secret Scanning Audit, Vercel Deployment & MongoDB Atlas Setup Guide | ⏳ Pending Phase 3 |

