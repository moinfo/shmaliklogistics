# SH Malik Logistics — Remaining Features Roadmap

> Detailed specification for all planned modules not yet implemented.
> See [README.md](./README.md) for the full list of what is already built.

**Last updated:** April 2026  
**Version target:** 2.0

---

## Priority Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 High | Core business value, blocks other features |
| 🟡 Medium | Significant value, standalone |
| 🟢 Low | Nice to have, Phase 4+ |

---

## Phase 3 — Remaining Core Modules

*Target: Month 4–5*

---

### 🔴 1. Customer Portal

**Purpose:** Clients log in to track their own shipments, view invoices, and pay online — eliminating "where is my cargo?" phone calls.

**Key Features:**
- Separate login page for clients (`/portal/login`)
- Dashboard showing active trips, recent invoices, balance due
- Real-time trip/cargo status updates
- Invoice download (PDF)
- Payment history
- Shipment documents (CMR, packing list)
- Notifications: email/SMS when cargo status changes

**Database changes needed:**
```sql
-- Add portal credentials to clients table
ALTER TABLE clients ADD COLUMN portal_password VARCHAR(255) NULL;
ALTER TABLE clients ADD COLUMN portal_active BOOLEAN DEFAULT FALSE;
ALTER TABLE clients ADD COLUMN last_portal_login TIMESTAMP NULL;
```

**Routes to add:**
```
GET  /portal                  → portal login
POST /portal/login
GET  /portal/dashboard
GET  /portal/trips
GET  /portal/invoices
GET  /portal/invoices/{id}/download
POST /portal/logout
```

**Frontend pages:**
- `resources/js/pages/portal/Login.jsx`
- `resources/js/pages/portal/Dashboard.jsx`
- `resources/js/pages/portal/Trips/Index.jsx`
- `resources/js/pages/portal/Invoices/Index.jsx`
- `resources/js/layouts/PortalLayout.jsx`

**Controllers:**
- `app/Http/Controllers/Portal/PortalAuthController.php`
- `app/Http/Controllers/Portal/PortalDashboardController.php`
- `app/Http/Controllers/Portal/PortalTripController.php`
- `app/Http/Controllers/Portal/PortalInvoiceController.php`

**Middleware:** New `portal.auth` middleware (separate from staff `auth`)

---

### 🔴 2. GPS Integration / Real-Time Fleet Tracking

**Purpose:** See every vehicle on a live map. Know where drivers are without calling them.

**Key Features:**
- Live map showing all vehicles with current position
- Trip history / breadcrumb trail
- Geofence alerts (vehicle leaves allowed zone)
- Speed alerts
- Engine on/off events
- Fuel level (if fuel sensor available)
- Integration with common Tanzanian GPS providers (Teltonika, Concox, GT06)

**Approach options (choose one):**
1. **Direct TCP server** — vehicles send NMEA/GT06 packets to a PHP socket server
2. **Third-party platform API** — pull positions from Teltonika FMB / Wialon / Fleet Complete via REST API (recommended — no infrastructure needed)
3. **Webhook receiver** — provider pushes location updates to our endpoint

**Database migration needed:**
```sql
CREATE TABLE vehicle_locations (
    id            INTEGER PRIMARY KEY,
    vehicle_id    INTEGER NOT NULL,
    latitude      DECIMAL(10,7) NOT NULL,
    longitude     DECIMAL(10,7) NOT NULL,
    speed_kmh     DECIMAL(5,1),
    heading       SMALLINT,
    ignition      BOOLEAN,
    altitude_m    SMALLINT,
    recorded_at   TIMESTAMP NOT NULL,
    created_at    TIMESTAMP
);

CREATE TABLE gps_devices (
    id           INTEGER PRIMARY KEY,
    vehicle_id   INTEGER,
    imei         VARCHAR(20) UNIQUE,
    provider     VARCHAR(50),   -- teltonika, concox, gt06
    sim_number   VARCHAR(20),
    is_active    BOOLEAN DEFAULT TRUE,
    last_ping    TIMESTAMP
);
```

**New settings page:** `Settings → GPS Devices` (assign IMEI to vehicle)

**Frontend pages:**
- `resources/js/pages/system/Fleet/LiveMap.jsx` — Leaflet.js map, vehicle pins
- `resources/js/pages/system/Fleet/VehicleTrail.jsx` — breadcrumb history

**npm packages needed:**
```bash
npm install leaflet react-leaflet
```

---

### 🟡 3. Driver / Staff Appraisals & Performance

**Purpose:** Measure driver performance by trips, fuel use, on-time delivery, and customer feedback.

**Key Features:**
- Performance score per driver per period
- KPIs: trips completed, average trip duration, fuel efficiency (km/L), on-time %, incidents
- Manager can add manual rating + notes
- Compare drivers side-by-side
- Print/export performance report

**Database migration needed:**
```sql
CREATE TABLE appraisals (
    id           INTEGER PRIMARY KEY,
    employee_id  INTEGER NOT NULL,
    period_from  DATE NOT NULL,
    period_to    DATE NOT NULL,
    trips_count  INTEGER DEFAULT 0,
    on_time_pct  DECIMAL(5,2),
    fuel_eff_kml DECIMAL(6,2),
    incidents    INTEGER DEFAULT 0,
    manager_rating TINYINT,        -- 1-5
    manager_notes  TEXT,
    overall_score  DECIMAL(5,2),
    status       VARCHAR(20),      -- draft, published
    created_by   INTEGER,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP
);
```

**Routes to add:**
```
GET    system/hr/appraisals
POST   system/hr/appraisals
GET    system/hr/appraisals/{appraisal}
DELETE system/hr/appraisals/{appraisal}
```

**Frontend pages:**
- `resources/js/pages/system/HR/Appraisals/Index.jsx`
- `resources/js/pages/system/HR/Appraisals/Show.jsx`

---

### 🟡 4. Inventory (Spare Parts & Consumables)

**Purpose:** Track spare parts stock so you never run out of critical items like tyres, filters, and brake pads.

**Key Features:**
- Item catalogue (part number, category, unit, reorder level)
- Stock in / stock out entries
- Link usage to specific vehicle/maintenance record
- Low stock alerts
- Supplier tracking per item
- Print stock report

**Database migrations needed:**
```sql
CREATE TABLE inventory_categories (
    id INTEGER PRIMARY KEY, name VARCHAR(100), created_at TIMESTAMP
);

CREATE TABLE inventory_items (
    id              INTEGER PRIMARY KEY,
    category_id     INTEGER,
    name            VARCHAR(255) NOT NULL,
    part_number     VARCHAR(100),
    unit            VARCHAR(30),
    current_stock   DECIMAL(10,3) DEFAULT 0,
    reorder_level   DECIMAL(10,3) DEFAULT 0,
    unit_cost       DECIMAL(12,2),
    location        VARCHAR(100),   -- shelf/bin reference
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE TABLE inventory_movements (
    id           INTEGER PRIMARY KEY,
    item_id      INTEGER NOT NULL,
    type         VARCHAR(20),    -- in, out, adjustment
    quantity     DECIMAL(10,3) NOT NULL,
    unit_cost    DECIMAL(12,2),
    reference    VARCHAR(100),   -- PO number, maintenance record ID
    vehicle_id   INTEGER NULL,
    notes        TEXT,
    created_by   INTEGER,
    created_at   TIMESTAMP
);
```

**Routes to add:**
```
GET/POST        system/inventory/items
GET/PUT/DELETE  system/inventory/items/{item}
POST            system/inventory/items/{item}/stock-in
POST            system/inventory/items/{item}/stock-out
GET             system/inventory/movements
```

**Frontend pages:**
- `resources/js/pages/system/Inventory/Index.jsx`
- `resources/js/pages/system/Inventory/Show.jsx`
- `resources/js/pages/system/Inventory/StockMovements.jsx`

**Link to Maintenance:** When logging a service record, select spare parts used from inventory (auto deducts stock).

---

### 🟡 5. Purchase / Procurement

**Purpose:** Manage orders to suppliers for fuel, spare parts, and office consumables.

**Key Features:**
- Create Purchase Orders (PO) with line items
- Supplier management
- Receive goods (partial or full) — updates Inventory
- Purchase invoices from suppliers
- Spend report per supplier / category

**Database migrations needed:**
```sql
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY, name VARCHAR(255), contact_name VARCHAR(100),
    phone VARCHAR(30), email VARCHAR(150), address TEXT, tin_number VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP, updated_at TIMESTAMP
);

CREATE TABLE purchase_orders (
    id INTEGER PRIMARY KEY, po_number VARCHAR(50) UNIQUE,
    supplier_id INTEGER, status VARCHAR(20),  -- draft, sent, partial, received, cancelled
    order_date DATE, expected_date DATE, notes TEXT,
    subtotal DECIMAL(12,2), tax_amount DECIMAL(12,2), total DECIMAL(12,2),
    created_by INTEGER, created_at TIMESTAMP, updated_at TIMESTAMP
);

CREATE TABLE purchase_order_items (
    id INTEGER PRIMARY KEY, purchase_order_id INTEGER,
    description VARCHAR(255), quantity DECIMAL(10,3), unit VARCHAR(30),
    unit_price DECIMAL(12,2), total DECIMAL(12,2), received_qty DECIMAL(10,3) DEFAULT 0
);
```

---

### 🟡 6. Recruitment

**Purpose:** Manage job openings and the hiring process for drivers and office staff.

**Key Features:**
- Job vacancy postings (position, requirements, closing date)
- Applications received (name, phone, CV upload)
- Stage pipeline: Applied → Shortlisted → Interview → Offer → Hired / Rejected
- Interview scheduling with notes
- Onboard to Employee record on hire

**Database migrations needed:**
```sql
CREATE TABLE job_vacancies (
    id INTEGER PRIMARY KEY, title VARCHAR(255), department_id INTEGER,
    description TEXT, requirements TEXT, openings TINYINT DEFAULT 1,
    status VARCHAR(20), -- open, closed, filled
    closing_date DATE, created_by INTEGER, created_at TIMESTAMP
);

CREATE TABLE job_applications (
    id INTEGER PRIMARY KEY, vacancy_id INTEGER, full_name VARCHAR(255),
    phone VARCHAR(30), email VARCHAR(150), cv_path VARCHAR(500),
    stage VARCHAR(30),  -- applied, shortlisted, interview, offer, hired, rejected
    interview_date TIMESTAMP NULL, interview_notes TEXT,
    offer_amount DECIMAL(12,2) NULL,
    created_at TIMESTAMP, updated_at TIMESTAMP
);
```

---

## Phase 4 — Marketing & Productivity

*Target: Month 6+*

---

### 🟢 7. Bulk Email Campaigns

**Purpose:** Send newsletters, route promotions, and price updates to clients.

**Key Features:**
- Campaign composer with rich text editor
- Recipient groups (all clients, active clients, custom list)
- Schedule send or send immediately
- Open/click tracking
- Unsubscribe handling

**Packages:**
```bash
composer require symfony/mailer
# or use Mailgun/SendGrid API directly
```

**Database migration:**
```sql
CREATE TABLE email_campaigns (
    id INTEGER PRIMARY KEY, name VARCHAR(255), subject VARCHAR(255),
    body TEXT, status VARCHAR(20), -- draft, scheduled, sent
    scheduled_at TIMESTAMP NULL, sent_at TIMESTAMP NULL,
    recipient_count INTEGER DEFAULT 0, open_count INTEGER DEFAULT 0,
    created_by INTEGER, created_at TIMESTAMP
);
```

---

### 🟢 8. SMS Marketing / Notifications

**Purpose:** Send automated SMS when cargo status changes, when a trip departs, or for promotions.

**Provider options for Tanzania:** Africa's Talking, Vonage, Twilio, BEEM Africa (local, recommended)

**Key Features:**
- Trip departure / arrival SMS to client
- Cargo delivery confirmation SMS
- Bulk SMS campaigns
- SMS templates

**Integration:** Add `BEEM_API_KEY` and `BEEM_SECRET` to `.env`, create `SmsService` class.

---

### 🟢 9. Internal Chat (Discuss)

**Purpose:** Staff communicate inside the system — dispatcher to driver, manager to accountant.

**Key Features:**
- Direct messages between users
- Group channels (e.g. #operations, #finance)
- Message history searchable
- File attachments

**Approach:** Use Laravel Reverb (WebSockets) + React. No third-party service needed.

```bash
composer require laravel/reverb
php artisan reverb:install
```

---

### 🟢 10. AI Assistant

**Purpose:** Auto-suggest freight quotes based on historical trip data, predict fuel costs, and help write client emails.

**Key Features:**
- "Suggest price for DSM→LBV 40-tonne general cargo" → AI returns estimate based on past trips
- AI email composer in SendDocModal
- Driver scheduling suggestions based on workload
- Anomaly detection on expenses

**Integration:** Anthropic Claude API (already in use for development). Add `ANTHROPIC_API_KEY` to `.env`.

---

### 🟢 11. Full Accounting (General Ledger)

**Purpose:** Complete double-entry bookkeeping with Trial Balance, Balance Sheet, and P&L.

**Key Features:**
- Chart of Accounts (Assets, Liabilities, Equity, Revenue, Expenses)
- Journal entries (auto-created from invoices, payments, payroll)
- Trial Balance report
- Balance Sheet
- Profit & Loss statement
- Reconciliation

**Note:** This is a large module. Consider integrating with an existing accounting package (e.g. connecting to QuickBooks/Xero via API) rather than building from scratch.

---

### 🟢 12. Digital Signatures (e-Sign)

**Purpose:** Send contracts and agreements to clients for electronic signature without printing.

**Approach:** Integrate with DocuSign or use `simple-signature` with a Blade PDF overlay.

**Key Features:**
- Attach document (PDF), define signature fields
- Send link to recipient by email
- Recipient signs online (mouse/touch)
- Signed PDF stored in Documents module

---

### 🟢 13. Knowledge Base

**Purpose:** Internal SOPs, driver manuals, border crossing guides, and FAQs.

**Key Features:**
- Article editor (rich text)
- Categories (Driver SOPs, Finance Procedures, Border Guides)
- Search
- Access by role

---

### 🟢 14. Quality / Vehicle Inspection

**Purpose:** Pre-trip safety inspection checklist for each vehicle before departure.

**Key Features:**
- Customisable checklist template (tyres, lights, brakes, docs, fire extinguisher...)
- Driver fills checklist on phone before trip
- Failed items trigger a maintenance alert
- Inspection history per vehicle

**Database migration:**
```sql
CREATE TABLE inspection_templates (
    id INTEGER PRIMARY KEY, name VARCHAR(255), items JSON, is_active BOOLEAN
);

CREATE TABLE vehicle_inspections (
    id INTEGER PRIMARY KEY, vehicle_id INTEGER, trip_id INTEGER NULL,
    driver_id INTEGER, template_id INTEGER, results JSON,
    passed BOOLEAN, notes TEXT, inspected_at TIMESTAMP, created_at TIMESTAMP
);
```

---

## Implementation Order (Recommended)

```
Month 4    Customer Portal         (high client value, no new infra)
           Appraisals              (needed for HR completeness)
           Inventory               (links to Maintenance)

Month 5    GPS Integration         (requires GPS device in vehicles first)
           Purchase / Procurement  (links to Inventory)
           Recruitment             (nice HR completion)

Month 6    Bulk SMS (BEEM Africa)  (quick integration, high value)
           Vehicle Inspection      (driver safety compliance)

Month 7+   Internal Chat           (Reverb WebSockets)
           Full Accounting GL      (or external API integration)
           AI Assistant            (Claude API)
           Email Campaigns
           Digital Signatures
           Knowledge Base
```

---

## Environment Variables Needed for Future Modules

Add these to `.env` as each module is built:

```env
# GPS Integration
GPS_PROVIDER=teltonika          # teltonika | concox | wialon
GPS_API_KEY=
GPS_API_URL=

# SMS (BEEM Africa — recommended for Tanzania)
BEEM_API_KEY=
BEEM_SECRET_KEY=
BEEM_SENDER_NAME=SHMalik

# AI Assistant
ANTHROPIC_API_KEY=

# WebSockets (Discuss / Chat)
REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_HOST=localhost
REVERB_PORT=8080

# E-Signing
DOCUSIGN_CLIENT_ID=
DOCUSIGN_ACCOUNT_ID=
DOCUSIGN_PRIVATE_KEY=
```

---

*This roadmap is a living document — update priorities as business needs evolve.*  
*Built by Moinfotech Company Limited · moinfotech.co.tz*
