# Trip Sheet Implementation Plan

Features identified from **TRIP SHEET.xlsx** (2025) and **TRIP SHEET 2026.xlsx** (2026) that are missing from the current system.

---

## 1. Container Number on Trips

**What the Excel has:**
Every trip row in the DEBTORS sheet carries a container number (e.g. `TRHU5515899`, `MSKU1079197`) or `LOOSE CARGO`.

**What the app has:**
Only a free-text `cargo_description` field. No structured container number.

**What to build:**
- Add `container_number` column to `trips` table (nullable string).
- Show it on the trip create/edit form as its own field.
- Display it on the trip detail page and the admin trips list.
- Show it on the driver's trip view.

**Migration:**
```sql
ALTER TABLE trips ADD COLUMN container_number VARCHAR(20) NULLABLE AFTER cargo_description;
```

---

## 2. USD Invoice Amount + Exchange Rate

**What the Excel has:**
Freight is invoiced in USD. Each trip stores:
- `invoice_usd` — agreed freight in US Dollars (e.g. $4,000)
- `exchange_rate` — TZS per USD at time of invoicing (e.g. 2,630)
- `invoice_tzs` — computed: `invoice_usd × exchange_rate`

**What the app has:**
Only `freight_amount` in TZS. No USD support.

**What to build:**
- Add `invoice_usd`, `exchange_rate`, `invoice_tzs` columns to `trips`.
- On the trip form show USD + rate fields side-by-side; auto-compute TZS.
- `freight_amount` becomes the TZS value (keep existing column, populate from `invoice_tzs`).
- On reports and billing documents show both USD and TZS.

**Migration:**
```sql
ALTER TABLE trips
  ADD COLUMN invoice_usd     DECIMAL(10,2) NULLABLE AFTER freight_amount,
  ADD COLUMN exchange_rate   DECIMAL(8,2)  NULLABLE AFTER invoice_usd,
  ADD COLUMN invoice_tzs     DECIMAL(15,2) NULLABLE AFTER exchange_rate;
```

---

## 3. Advance Payment + Cheque Number

**What the Excel has:**
Each trip in DEBTORS tracks two payment stages:

| Stage | USD | Rate | TZS | Cheque No |
|---|---|---|---|---|
| Advance received | e.g. $2,400 | 2,630 | TZS 6,312,000 | `866265, DTD 06/01/2025` |
| Final payment | e.g. $1,600 | 2,630 | TZS 4,208,000 | `868232, DTD 12/04/2025` |
| Balance remaining | e.g. $0 | — | TZS 0 | — |

**What the app has:**
A generic `payments` table linked to billing documents. No USD, no advance/final split, no cheque tracking on the trip itself.

**What to build:**
- Add to `trips`: `advance_usd`, `advance_tzs`, `advance_cheque`, `advance_date`, `final_usd`, `final_tzs`, `final_cheque`, `final_date`, `balance_usd`, `balance_tzs`.
- Alternatively: extend the `payments` table with `payment_stage` (advance/final), `usd_amount`, `exchange_rate`, `cheque_number`.
- Add a "Payments" sub-section to the trip detail page showing the two-stage payment history.
- Compute `balance_usd = invoice_usd - advance_usd - final_usd` automatically.
- Show outstanding balances on the Debtors report.

**Migration (recommended — extend payments table):**
```sql
ALTER TABLE payments
  ADD COLUMN payment_stage  ENUM('advance','final','other') DEFAULT 'other' AFTER id,
  ADD COLUMN usd_amount     DECIMAL(10,2) NULLABLE,
  ADD COLUMN exchange_rate  DECIMAL(8,2)  NULLABLE,
  ADD COLUMN cheque_number  VARCHAR(60)   NULLABLE,
  ADD COLUMN cheque_date    DATE          NULLABLE;
```

---

## 4. Debtors Report (Accounts Receivable)

**What the Excel has:**
A full debtors ledger: every trip, client, invoice, advance, final payment, balance, status — all in one view. Filterable by agent/client.

**What the app has:**
No dedicated debtors/AR view. Payments are tracked on billing documents, not summarised per trip.

**What to build:**
- New page: **System → Billing → Debtors** (`/system/billing/debtors`)
- Table columns:
  - Trip No | Truck | Container No | Destination | Agent
  - Invoice (USD + TZS) | Advance (USD + TZS + Cheque) | Final (USD + TZS + Cheque) | Balance | Status
- Filters: client/agent, destination, outstanding only (balance > 0)
- Export to Excel/PDF

---

## 5. Detailed Per-Trip Expense Lines

**What the Excel has:**
Each P&L block lists individual expense items:

| Item | Example amount |
|---|---|
| Fuel (litres × price/litre) | TZS 5,540,000 |
| Road toll (USD × rate) | TZS 792,350 |
| Mileage allowance | TZS 1,000,000 |
| King'amuzi fee | TZS 40,000 |
| Council Zambia | TZS 30,000 |
| Toll gate | TZS 180,000 |
| Car wash | TZS 30,000 |
| Offloading container | TZS 140,000 |
| Council Tunduma | TZS 15,000 |
| Posho (container) | TZS 10,000 |
| Parking fee | TZS 40,000 |
| Council Kapiri | TZS 12,000 |

**What the app has:**
Bulk cost fields: `fuel_cost`, `driver_allowance`, `border_costs`, `road_fines`, `guard_fees`, `other_costs`. No line-item detail.

**What to build:**
- New table `trip_expense_lines`: `trip_id`, `category`, `description`, `quantity`, `unit_price`, `amount`, `currency`, `exchange_rate`, `amount_tzs`, `created_by`.
- Categories enum: `fuel`, `road_toll`, `mileage`, `border_fee`, `council_fee`, `handling`, `parking`, `car_wash`, `posho`, `other`.
- Inline line-item form on the trip detail page (similar to billing items).
- Auto-sum into `total_expenses` on the trip P&L.
- Keep existing bulk fields for backward compatibility; migrate them as single-line entries.

**Migration:**
```sql
CREATE TABLE trip_expense_lines (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  trip_id       BIGINT UNSIGNED NOT NULL,
  category      VARCHAR(30) NOT NULL,
  description   VARCHAR(200) NULLABLE,
  quantity      DECIMAL(10,3) DEFAULT 1,
  unit_price    DECIMAL(15,2) DEFAULT 0,
  amount        DECIMAL(15,2) NOT NULL,
  currency      CHAR(3) DEFAULT 'TZS',
  exchange_rate DECIMAL(8,2) NULLABLE,
  amount_tzs    DECIMAL(15,2) NOT NULL,
  created_by    BIGINT UNSIGNED NULLABLE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);
```

---

## 6. Per-Trip P&L Report (Matching the Excel Layout)

**What the Excel has:**
A formatted per-trip P&L block for each trip: income vs expenses → profit/loss.

**What the app has:**
A route profitability report that aggregates across trips. No single-trip P&L view.

**What to build:**
- Expand the trip detail page (`/system/trips/{id}`) with a P&L summary card:
  - Income: invoice TZS (or freight_amount)
  - Expenses: grouped by category (fuel, tolls, allowances, border, etc.)
  - Net profit / loss (colour-coded)
- Printable/PDF version matching the Excel format for sharing with clients or management.

---

## Implementation Order (Suggested)

| Priority | Feature | Effort | Value |
|---|---|---|---|
| 1 | Container number on trips | Low | High — used on every trip |
| 2 | USD invoice + exchange rate | Medium | High — matches how revenue is actually recorded |
| 3 | Advance + final payment with cheque numbers | Medium | High — replaces the DEBTORS spreadsheet |
| 4 | Debtors report page | Medium | High — replaces the DEBTORS spreadsheet |
| 5 | Detailed expense lines | High | Medium — replaces P&L manual tracking |
| 6 | Per-trip P&L view/print | Medium | Medium — management reporting |

---

## Files to Create/Modify

### Migrations (new)
- `add_container_usd_fields_to_trips`
- `add_usd_cheque_to_payments`
- `create_trip_expense_lines_table`

### Models (modify)
- `app/Models/Trip.php` — add new fillable fields, update `getTotalCostsAttribute`
- `app/Models/Payment.php` — add new fillable fields

### Models (new)
- `app/Models/TripExpenseLine.php`

### Controllers (modify)
- `app/Http/Controllers/System/TripController.php` — handle new fields
- `app/Http/Controllers/System/BillingController.php` (or new `DebtorsController`)

### Controllers (new)
- `app/Http/Controllers/System/DebtorsController.php`

### Pages (modify)
- `resources/js/pages/system/Trips/Create.jsx` — add container, USD fields
- `resources/js/pages/system/Trips/Show.jsx` — add P&L card, payments section
- `resources/js/pages/system/Billing/` — add Debtors page

### Pages (new)
- `resources/js/pages/system/Billing/Debtors.jsx`
- `resources/js/pages/system/Trips/ExpenseLines.jsx` (inline component)

### Routes
- `GET /system/billing/debtors` — debtors list
- `POST/PUT /system/trips/{trip}/expense-lines` — add/update expense lines
- `DELETE /system/trips/{trip}/expense-lines/{line}` — remove line
