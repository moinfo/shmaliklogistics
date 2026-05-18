# SH Malik Logistics Management System

> **Full-stack ERP for East & Central African cross-border freight operations**
> Built by [Moinfotech Company Limited](https://moinfotech.co.tz) · [Makutano Digital Management](https://makutano.co.tz)

---

## Overview

A comprehensive, modular logistics ERP designed specifically for Tanzanian freight and fleet operations. Covers the full business lifecycle — from trip dispatch and border permits, through billing and payroll, to HR and fleet maintenance — with a bilingual (Swahili/English) public website.

**Company:** SH Malik Logistics Company Limited  
**Base:** Buza, Dar es Salaam, Tanzania  
**Routes:** Dar es Salaam → DRC · Zambia · Malawi · Mozambique

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 12 (PHP 8.3) |
| Frontend | React 18 + Inertia.js |
| UI Components | Mantine v7 |
| Animations | Framer Motion |
| Database | MySQL 8 |
| Build Tool | Vite 6 |
| Node | v24 |
| Excel parsing | phpoffice/phpspreadsheet |

---

## Quick Start

```bash
# 1. Install dependencies
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Database
php artisan migrate
php artisan db:seed          # loads full demo data (Jan–Apr 2026)

# 4. Storage link
php artisan storage:link

# 5. Development server
composer run dev             # starts Laravel + Vite concurrently
```

### Default Login

| Field | Value |
|-------|-------|
| Email | `admin@shmalik.co.tz` |
| Password | `password` |

---

## Module Status

### Group 1 — Operations & Trips (Custom)

| Module | Status | Notes |
|--------|--------|-------|
| Dashboard | ✅ Live | Real-time KPIs, fleet status, recent trips |
| Trip Management | ✅ Complete | Full CRUD, status flow, driver/vehicle assignment |
| USD Invoice + Exchange Rate | ✅ Complete | Invoice USD + rate → auto TZS; shown on trip & billing |
| Container Number Tracking | ✅ Complete | Per-trip container field, shown on list & detail |
| Trip Expense Lines | ✅ Complete | 11-category line items with currency conversion |
| Per-Trip P&L Print | ✅ Complete | Income vs expenses, printable A4 layout |
| Excel Import (Trip Sheets) | ✅ Complete | UI + artisan command; supports 2025 & 2026 files |
| Cargo & Load Tracking | ✅ Complete | Clickable status progression, linked to trips |
| Border & Permit Tracking | ✅ Complete | Expiry alerts (7 / 30 days) |
| Route Profitability Report | ✅ Complete | Revenue vs costs per route |
| Customer Portal | ❌ Planned | Phase 4 — client self-service login |
| GPS Integration | ❌ Planned | Phase 4 — real-time fleet map |

### Group 2 — Finance

| Module | Status | Notes |
|--------|--------|-------|
| Quotes | ✅ Complete | Auto-numbered QTE-YYYY-NNNN |
| Proforma Invoices | ✅ Complete | Convert from quote in one click |
| Tax Invoices | ✅ Complete | Record payments, balance tracking |
| Payments | ✅ Complete | Advance / final stage, cheque number & date, USD amounts |
| Debtors Report | ✅ Complete | AR aging, per-client accordion, outstanding filter, print |
| Expenses | ✅ Complete | Per-trip line-item expense tracking |
| Documents | ✅ Complete | Upload, download, expiry tracking |
| Financial Summary Report | ✅ Complete | Revenue, expenses, profit by period |
| Print / PDF Export | ✅ Complete | All billing docs — company logo + A4 layout |
| Send via Email / WhatsApp | ✅ Complete | Compose & send directly from document |
| Full Accounting (GL/TB) | ❌ Planned | General Ledger, Trial Balance, Balance Sheet |
| Digital Signatures | ❌ Planned | Contract e-signing |

### Group 3 — Fleet & Drivers

| Module | Status | Notes |
|--------|--------|-------|
| Vehicle Management | ✅ Complete | Status, assignment, document tracking |
| Driver Management | ✅ Complete | License, assignment, status, photo |
| Driver Portal | ✅ Complete | Mobile-first portal: inspections, 3-hr check-ins, expense entry, live alerts |
| Vehicle Inspections | ✅ Complete | 5-section sectioned checklist (Engine, Tyres, Lights, Safety, Cargo/Docs) |
| Fleet Utilization Report | ✅ Complete | Active vs idle, mileage analysis |
| Maintenance / Service Records | ✅ Complete | Service history, cost tracking |
| Clients (CRM) | ✅ Complete | Company, TIN, contact details |

### Group 4 — Human Resources

| Module | Status | Notes |
|--------|--------|-------|
| Employee Management | ✅ Complete | Full profile, bank details, TIN/NSSF/NHIF |
| Leave Management | ✅ Complete | Apply, approve, reject |
| Payroll | ✅ Complete | Tanzania statutory: PAYE, NSSF, NHIF, SDL, WCF, HESLB |
| Salary Slips | ✅ Complete | Printable payslips per employee |
| Allowances | ✅ Complete | Housing, transport, custom |
| Advances | ✅ Complete | Request, approve, repayment tracking |
| Loans | ✅ Complete | Approve, monthly deduction |
| Attendance | ✅ Complete | Manual entry + ZKTeco biometric device sync |
| Recruitment | ❌ Planned | CV management, interview tracking |
| Appraisals | ❌ Planned | Driver/staff performance KPIs |

### Group 5 — Supply Chain

| Module | Status | Notes |
|--------|--------|-------|
| Maintenance | ✅ Complete | (see Fleet section above) |
| Inventory | ✅ Complete | Serial-number tracking, stock movements |
| Purchase / Procurement | ❌ Planned | Supplier orders, diesel, spare parts |

### Group 6 — Marketing

| Module | Status | Notes |
|--------|--------|-------|
| Email (per document) | ✅ Complete | Send any billing doc via email |
| WhatsApp (per document) | ✅ Complete | Pre-composed WhatsApp message |
| Bulk Email Campaigns | ❌ Planned | Phase 4 |
| SMS Marketing | ❌ Planned | Phase 4 |
| Social Marketing | ❌ Planned | Phase 4 |
| Surveys | ❌ Planned | Phase 4 |

### Group 7 — Settings

| Module | Status | Notes |
|--------|--------|-------|
| Company Settings | ✅ Complete | Name, logo, address, TIN |
| Roles & Permissions | ✅ Complete | Module-level permission matrix |
| Departments | ✅ Complete | Employee grouping |
| Payroll Settings | ✅ Complete | Configure statutory rates & bands |
| License Classes | ✅ Complete | Driver license categories |
| Vehicle Document Types | ✅ Complete | Custom document categories |
| Deduction Types | ✅ Complete | Configurable deductions |
| Bank Details | ✅ Complete | Employee bank accounts |

### Group 8 — Productivity (Phase 4)

| Module | Status |
|--------|--------|
| Internal Chat (Discuss) | ❌ Planned |
| AI Assistant | ❌ Planned |
| GPS / IoT Integration | ❌ Planned |
| Knowledge Base | ❌ Planned |
| VoIP | ❌ Planned |

---

## Project Stats

| Metric | Count |
|--------|-------|
| Database migrations | 68 |
| Eloquent models | 47 |
| Controllers | 64 |
| React pages / components | 143 |
| Artisan commands | 1 (`trips:import`) |
| Imported trips (2025 + 2026) | 650 |
| Invoices in DB | 628 |
| Payments (advance + final) | 817 |

---

## Architecture

```
web/
├── app/
│   ├── Http/Controllers/
│   │   ├── Auth/
│   │   ├── Settings/
│   │   └── System/
│   │       ├── Billing/          # Quotes, Proformas, Invoices, Payments
│   │       └── HR/               # Employees, Leave, Payroll, Attendance...
│   ├── Mail/                     # Mailable classes
│   └── Models/
├── database/
│   ├── migrations/               # 39 migrations
│   └── seeders/                  # DatabaseSeeder — full demo data
├── resources/
│   ├── js/
│   │   ├── components/           # Shared UI components
│   │   ├── contexts/             # LanguageContext (EN/SW)
│   │   ├── layouts/              # DashboardLayout, WebsiteLayout
│   │   ├── pages/
│   │   │   ├── system/           # All ERP pages
│   │   │   └── website/          # Public website (Home, About, Services, Contact)
│   │   └── utils/                # billingPrint.js, helpers
│   └── views/
│       └── mail/                 # HTML email templates
└── routes/
    └── web.php                   # All routes (auth + system + public website)
```

---

## Real Data Import

The live database is seeded from the actual **TRIP SHEET** Excel files (2025 & 2026). Use the Artisan command:

```bash
# Import 2026 trips (207 rows — reads DEBTORS sheet)
php artisan trips:import "TRIP SHEET 2026.xlsx" 2026

# Import 2025 trips (441 rows)
php artisan trips:import "TRIP SHEET.xlsx" 2025

# Preview without writing to DB
php artisan trips:import "TRIP SHEET 2026.xlsx" 2026 --dry-run
```

Each import creates: `Trip` + `BillingDocument (invoice)` + `Payment` (advance + final) + `Client::firstOrCreate`.  
Duplicate detection prevents re-importing existing trip numbers.

### Demo Seeder (optional)

The seeder (`php artisan db:seed`) loads **realistic sample data** from Jan–Apr 2026 for local development / staging:

- 1 admin user, 12 vehicles, 12 drivers, 10 clients
- ~39 trips, 30 cargo records, 50 billing documents
- 15 employees — full payroll (PAYE, NSSF, NHIF, SDL, WCF, HESLB)
- 4 payroll runs → 60 salary slips, 2,428 attendance logs

> **WARNING:** `db:seed` truncates all transactional tables. Never run it on a production database with real data.

---

## Mail Configuration

Emails default to `log` driver (written to `storage/logs/laravel.log`). To send real emails, update `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=info@shmalik.co.tz
MAIL_FROM_NAME="SH Malik Logistics"
```

---

## Public Website

A bilingual (English / Swahili) marketing website at `/`:

- **Home** — hero, features, routes, stats
- **Services** — freight types, service descriptions
- **About** — company story, milestones, team
- **Contact** — contact form, location, FAQ

Language toggle persists in `localStorage`.

---

## Remaining Features

See **[ROADMAP.md](./ROADMAP.md)** for a detailed specification of all planned modules with implementation notes, database schemas, and priority order.

---

## Development

```bash
# Run all together (recommended)
composer run dev

# Separately
php artisan serve          # http://localhost:8000
npm run dev                # Vite HMR

# Build for production
npm run build
php artisan optimize
```

---

## Built By

**Moinfotech Company Limited** — Kibaha, Pwani, Tanzania  
Web: [moinfotech.co.tz](https://moinfotech.co.tz) · Email: info@moinfo.co.tz

**Makutano Digital Management**  
Web: [makutano.co.tz](https://makutano.co.tz) · Email: info@makutano.co.tz

---

*Version 1.1 · May 2026*
