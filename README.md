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
| Backend | Laravel 13.7 (PHP 8.3) |
| Frontend | React 18 + Inertia.js |
| UI Components | Mantine v7 |
| Animations | Framer Motion |
| Database | SQLite (dev) — MySQL/PostgreSQL ready |
| Build Tool | Vite 6 |
| Node | v24.13 |

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
| Payments | ✅ Complete | Payment history, bulk print report |
| Expenses | ✅ Complete | Per-trip expense tracking |
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
| Driver Management | ✅ Complete | License, assignment, status |
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
| Inventory | ❌ Planned | Spare parts stock management |
| Purchase / Procurement | ❌ Planned | Supplier orders, diesel, spare parts |
| Quality / Vehicle Inspection | ❌ Planned | Pre-trip safety checklists |

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
| Database migrations | 39 |
| Eloquent models | 31 |
| Controllers | 37 |
| React pages / components | 107 |
| API routes (system) | 185 |
| Demo data rows (seeded) | ~3,500+ |

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

## Demo Data

The seeder (`php artisan db:seed`) loads **realistic Tanzanian data** from Jan 1 – Apr 30, 2026:

- 1 admin user, 12 vehicles, 12 drivers, 10 clients
- 33 trips across 7 routes (DSM → LBV, LUN, LLW, MPM, NBI, KLA, BYK)
- 28 permits, 50 expenses, 26 service records
- 35 billing documents (quotes, proformas, invoices) with 112 line items
- 15 employees — full payroll: PAYE, NSSF, NHIF, SDL, WCF, HESLB
- 4 payroll runs → 60 salary slips
- 2,428 attendance logs (all working days)
- 30 cargo records, 6 advances, 4 loans

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

*Version 1.0 · April 2026*
