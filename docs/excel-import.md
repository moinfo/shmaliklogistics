# Excel Trip Sheet Import

How the system imports trip data from SH Malik's Excel **TRIP SHEET** files.

---

## Overview

The import reads the **DEBTORS** sheet from a Trip Sheet `.xlsx` file and creates:

- One **Trip** record per row
- One **BillingDocument** (invoice) linked to the trip
- One **BillingDocumentItem** (freight line item)
- Up to two **Payment** records (advance + final) with cheque details
- A **Client** record for the agent (created if not already in the system)

The process is safe to re-run — trips with a number that already exists in the database are automatically skipped.

---

## Excel Column Mapping (DEBTORS sheet)

| Column | Field | Notes |
|--------|-------|-------|
| B | Trip number | `TR0001` → mapped to `TRP-YYYY-001` |
| C | Truck plate | Matched to `vehicles.plate` for driver lookup |
| D | Container number | e.g. `TRHU5515899`, `LOOSE CARGO` |
| E | Destination | Stored as `route_to`; `route_from` defaults to `Dar es Salaam` |
| F | Agent / Client name | Matched or created in `clients` table |
| G | Invoice USD | Freight amount in US Dollars |
| H | Exchange rate | TZS per USD at time of invoicing |
| K | Advance USD | First payment instalment |
| N | Advance cheque | e.g. `873860, DTD 06/01/2026` → parsed to cheque number + date |
| P | Final USD | Second (final) payment |
| S | Final cheque | Same format as advance cheque |
| U | Balance USD | Outstanding balance (used to set invoice status) |
| X | Notes | Free-text remarks |

Row reading starts at **row 4**. Rows where column B does not match `TR\d+` are ignored (headers, totals, blank rows).

---

## Trip Number Format

Excel uses `TR0001`, `TR0002`, … The system maps these to the application format:

```
TR0001  →  TRP-2026-001   (when year=2026)
TR0042  →  TRP-2025-042   (when year=2025)
```

The year must be provided at import time (see below).

---

## Invoice Status

| Condition | Status set |
|-----------|-----------|
| `balance_usd > 0.01` | `partial` |
| `balance_usd ≤ 0.01` | `paid` |

---

## Cheque Parsing

Cheque fields in the Excel follow the format:

```
873860, DTD 13/01/2026
```

The parser extracts:
- **cheque_number** → `873860`
- **cheque_date** → `2026-01-13`

If no cheque data is present (column empty or `0`), `payment_method` is set to `bank_transfer`.

---

## How to Run

### Browser UI

1. Go to **Trips → Import Excel** (`/system/trips/import`)
2. Select the year (2025 or 2026)
3. Choose the `.xlsx` file
4. Click **Preview** — inspect all rows; toggle any rows to skip
5. Click **Import N Trips**

### Artisan Command (recommended for bulk / first-time setup)

```bash
# Preview without writing to DB
php artisan trips:import "TRIP SHEET 2026.xlsx" 2026 --dry-run

# Import all new trips from 2026 file
php artisan trips:import "TRIP SHEET 2026.xlsx" 2026

# Import all new trips from 2025 file
php artisan trips:import "TRIP SHEET.xlsx" 2025

# Specify a different user ID for created_by (default: 1)
php artisan trips:import "TRIP SHEET 2026.xlsx" 2026 --user=2
```

The file path is relative to the project root (`web/`).

---

## Files

| File | Purpose |
|------|---------|
| `app/Console/Commands/ImportTripsFromExcel.php` | Artisan command — bulk import from CLI |
| `app/Http/Controllers/System/TripImportController.php` | HTTP controller — UI preview + store endpoints |
| `resources/js/pages/system/Trips/Import.jsx` | Import UI page |
| `routes/web.php` | `GET/POST trips/import`, `POST trips/import/preview` |

---

## Data Flow

```
Excel file
    │
    ▼
IOFactory::createReader('Xlsx')
    setLoadSheetsOnly(['DEBTORS'])   ← avoids loading large P&L/Employment sheets
    │
    ▼
Row iterator (starts row 4)
    │  filter: column B matches /^TR\d+$/
    ▼
Parse row → array with trip_number, amounts, cheque strings
    │
    ▼  (preview endpoint stops here — returns JSON to browser)
    │
    ▼  (store endpoint / artisan command continues)
    │
    DB::transaction {
        Vehicle::where('plate') → resolve driver
        Trip::create(...)
        Client::firstOrCreate(name = agent)
        BillingDocument::create(invoice)
        invoice->items()->create(freight line)
        if advance_usd > 0  → Payment::create(stage=advance)
        if final_usd > 0    → Payment::create(stage=final)
    }
```

---

## Memory Considerations

The 2025 file (`TRIP SHEET.xlsx`) is large and contains multiple heavy sheets (P&L calculations, Employment Tax). Loading the whole workbook would exhaust the default PHP memory limit.

The fix — `setLoadSheetsOnly(['DEBTORS'])` — instructs PhpSpreadsheet to skip all other sheets. This keeps peak memory usage well under 128 MB even for large files.

---

## Known Edge Cases

| Situation | How it's handled |
|-----------|-----------------|
| Trip number already exists | Skipped silently (`exists` flag in preview, `$skipped++` in store) |
| Vehicle plate not in Fleet | Trip is created with `driver_name = "PLATE driver"`, no `driver_id` |
| Container column very long (multi-truck rows in 2025 file) | Column widened to 255 chars via migration `2026_05_18_124801_widen_container_number_on_trips` |
| No cheque data (column empty or `0`) | `cheque_number = null`, `payment_method = bank_transfer` |
| Zero invoice amount | `freight_amount = 0`, invoice total = 0 (data retained as-is) |

---

## Verification

After importing, check that the **Debtors Report** (`/system/billing/debtors`) reflects the DEBTORS sheet:

- Total clients with outstanding balance should match the Excel count
- Total balance USD (summed from `payments` via invoice balances) should match Excel column U totals
- Each agent row expands to show all their trips and invoices
