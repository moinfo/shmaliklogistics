# Real Estate Module — Build Contract (authoritative)

> Every agent MUST follow this spec exactly. Backend and frontend are built by separate
> agents in parallel; this document is the ONLY thing keeping them aligned. Do not invent
> column names, route URLs, page paths, or prop names — use exactly what is written here.

## Conventions (read these reference files first)
- **Model**: `app/Models/Trip.php` — `$fillable`, `$casts`, relationships, static `$statuses`/`$types`
  arrays shaped `['key' => ['label' => '...', 'color' => '#hex']]`, static `nextNumber()`.
- **Controller**: `app/Http/Controllers/System/DriverController.php` — filtered+paginated `index`
  with a `$stats` array, `Inertia::render('system/...')`, `$request->validate([...])`, file uploads via
  `$request->file('x')->store("dir/{$id}", 'public')` then save the returned path; delete old with
  `Storage::disk('public')->delete($path)`. Redirect with `->with('success', '...')`.
- **Migration**: `database/migrations/2026_05_18_120643_create_trip_expense_lines_table.php`.
- **Frontend list**: `resources/js/pages/system/Trips/Index.jsx`.
- **Frontend detail**: `resources/js/pages/system/Trips/Show.jsx`.
- **Frontend form**: `resources/js/pages/system/Trips/TripForm.jsx` + `Create.jsx` + `Edit.jsx`.
- **Helpers**: `resources/js/lib/can.js` (`useCan()` → `can('perm.action')`), `resources/js/lib/date.js` (`formatDate`).
- All pages wrap in `DashboardLayout`. Real-estate pages live at
  `resources/js/pages/system/RealEstate/<Group>/<File>.jsx` — that is FOUR levels under
  `resources/js/`, exactly like `resources/js/pages/system/Settings/Roles/Index.jsx`. So the imports are
  `import DashboardLayout from '../../../../layouts/DashboardLayout';` and `import { useCan } from '../../../../lib/can';`
  and `import { formatDate } from '../../../../lib/date';` (FOUR `../`). Use `Settings/Roles/Index.jsx` as the
  depth reference, and `Trips/Index.jsx` / `Trips/Show.jsx` / `Trips/TripForm.jsx` as the visual/structure reference.
- Theme: copy the `dk` object + `isDark = colorScheme === 'dark'` pattern from Trips/Index. Currency
  formatting: `new Intl.NumberFormat('en-TZ')`. Brand gradient: `linear-gradient(135deg,#1565C0,#2196F3)`.
- Money columns: `decimal(15,2)`. Currency columns: `char(3)` default `'TZS'`. Use `SoftDeletes` on all
  domain models EXCEPT `rent_payments` (no soft deletes there).
- Auto-numbers via model `nextNumber()`: PROP-YYYY-NNN, TEN-YYYY-NNN, LSE-YYYY-NNNN, RNT-YYYY-NNNN.

## Currencies & enums (use everywhere)
- Currencies: `['TZS','USD','KES','ZMW','MWK','MZN']` (TZS default).
- Billing cycles: `monthly`, `quarterly`, `semi_annual`, `annual`.

---

## TABLES (exact columns)

### properties  (model `Property`, softDeletes)
```
id
code                string unique           // PROP-YYYY-NNN
name                string 150
type                string 30               // house|apartment|room_block|commercial|farm|land
status              string 30 default 'available' // available|occupied|partially_occupied|under_renovation|not_available
ownership           string 20 default 'owned'     // owned|managed
address             string 200 nullable
region              string 100 nullable
district            string 100 nullable
acquisition_date    date nullable
purchase_price      decimal(15,2) nullable
purchase_currency   char(3) default 'TZS'
market_value        decimal(15,2) nullable
title_deed_number   string 80 nullable
title_deed_path     string 255 nullable
description         text nullable
notes               text nullable
created_by          foreignId nullable -> users nullOnDelete
timestamps, softDeletes
```

### property_units  (model `PropertyUnit`, softDeletes)
```
id
property_id         foreignId -> properties cascadeOnDelete
unit_number         string 50               // "Main", "Room 1", "Apt A", "Shop 2"
type                string 30 default 'room'// room|self_contained|apartment|shop|office|hall|plot|whole_house
status              string 20 default 'vacant' // vacant|occupied|maintenance|reserved
bedrooms            unsignedTinyInteger nullable
bathrooms           unsignedTinyInteger nullable
size_sqm            decimal(10,2) nullable
rent_amount         decimal(15,2) default 0
rent_currency       char(3) default 'TZS'
default_billing_cycle string 20 default 'monthly'
description         string 200 nullable
timestamps, softDeletes
```

### tenants  (model `Tenant`, softDeletes)
```
id
code                string unique           // TEN-YYYY-NNN
name                string 120
type                string 20 default 'individual' // individual|company
phone               string 20
phone_alt           string 20 nullable
email               string 100 nullable
national_id         string 30 nullable
company_name        string 150 nullable
tin                 string 30 nullable
address             string 200 nullable
emergency_contact_name  string 100 nullable
emergency_contact_phone string 20 nullable
status              string 20 default 'active' // active|past
notes               text nullable
created_by          foreignId nullable -> users nullOnDelete
timestamps, softDeletes
```

### leases  (model `Lease`, softDeletes)
```
id
lease_number        string unique           // LSE-YYYY-NNNN
property_unit_id    foreignId -> property_units cascadeOnDelete
tenant_id           foreignId -> tenants cascadeOnDelete
start_date          date
end_date            date nullable
billing_cycle       string 20 default 'monthly'
rent_amount         decimal(15,2)
rent_currency       char(3) default 'TZS'
deposit_amount      decimal(15,2) default 0
payment_day         unsignedTinyInteger nullable   // day-of-month rent due (1-28)
status              string 20 default 'active'     // active|pending|expired|terminated
contract_path       string 255 nullable            // uploaded mkataba (PDF/img)
contract_uploaded_at timestamp nullable
terms               text nullable
notes               text nullable
created_by          foreignId nullable -> users nullOnDelete
timestamps, softDeletes
```

### rent_invoices  (model `RentInvoice`, softDeletes)
```
id
invoice_number      string unique           // RNT-YYYY-NNNN
lease_id            foreignId -> leases cascadeOnDelete
property_unit_id    foreignId nullable -> property_units nullOnDelete
tenant_id           foreignId nullable -> tenants nullOnDelete
period_start        date
period_end          date
due_date            date
amount              decimal(15,2)
currency            char(3) default 'TZS'
status              string 20 default 'unpaid' // unpaid|partial|paid|overdue|cancelled
notes               string 200 nullable
created_by          foreignId nullable -> users nullOnDelete
timestamps, softDeletes
```

### rent_payments  (model `RentPayment`, NO softDeletes)
```
id
rent_invoice_id     foreignId -> rent_invoices cascadeOnDelete
lease_id            foreignId nullable -> leases nullOnDelete
amount              decimal(15,2)
currency            char(3) default 'TZS'
payment_date        date
payment_method      string 30 default 'cash' // cash|bank_transfer|mobile_money|cheque
reference_number    string 60 nullable
receipt_path        string 255 nullable
notes               string 200 nullable
created_by          foreignId nullable -> users nullOnDelete
timestamps
```

### property_expenses  (model `PropertyExpense`, softDeletes)
```
id
property_id         foreignId -> properties cascadeOnDelete
property_unit_id    foreignId nullable -> property_units nullOnDelete
category            string 30   // renovation|repair|maintenance|utility|land_rent|tax|agent_fee|security|cleaning|furnishing|insurance|other
description         string 200
amount              decimal(15,2)
currency            char(3) default 'TZS'
exchange_rate       decimal(10,2) nullable
amount_tzs          decimal(15,2)
expense_date        date
phase               string 20 nullable   // acquisition|renovation|operating
vendor              string 120 nullable
receipt_number      string 60 nullable
receipt_path        string 255 nullable
notes               text nullable
created_by          foreignId nullable -> users nullOnDelete
timestamps, softDeletes
```

Migration filenames (use these exact timestamps so order is correct):
```
2026_05_26_100001_create_properties_table.php
2026_05_26_100002_create_property_units_table.php
2026_05_26_100003_create_tenants_table.php
2026_05_26_100004_create_leases_table.php
2026_05_26_100005_create_rent_invoices_table.php
2026_05_26_100006_create_rent_payments_table.php
2026_05_26_100007_create_property_expenses_table.php
```

---

## MODELS (static arrays + methods every model must expose)

All `App\Models`. Add the relationships below and these static arrays (label+color shape).

**Property**: relationships `units() hasMany PropertyUnit`, `expenses() hasMany PropertyExpense`,
`creator() belongsTo User created_by`. Helper `leases()` via `hasManyThrough(Lease::class, PropertyUnit::class)`.
Static `$types` (house/apartment/room_block/commercial/farm/land), `$statuses` (available #22C55E, occupied #3B82F6,
partially_occupied #F59E0B, under_renovation #A855F7, not_available #94A3B8), `$ownerships`.
`nextNumber()` → PROP-YYYY-NNN (3 digits). Accessor `getTitleDeedUrlAttribute()` → `/storage/`+path (append to `$appends`).
Accessor `getTotalInvestedAttribute()` = purchase_price + sum(expenses.amount_tzs).

**PropertyUnit**: `property() belongsTo`, `leases() hasMany Lease`, `activeLease()` =
`hasOne(Lease::class)->where('status','active')->latestOfMany()`. Static `$types`, `$statuses`
(vacant #22C55E, occupied #3B82F6, maintenance #F59E0B, reserved #A855F7).

**Tenant**: `leases() hasMany`, `creator()`. Static `$types`, `$statuses` (active #22C55E, past #94A3B8).
`nextNumber()` → TEN-YYYY-NNN.

**Lease**: `unit() belongsTo PropertyUnit (property_unit_id)`, `tenant() belongsTo`, `rentInvoices() hasMany`,
`payments() hasMany RentPayment`, `creator()`. Static `$statuses` (active #22C55E, pending #60A5FA,
expired #F59E0B, terminated #EF4444), `$billingCycles` = ['monthly'=>['label'=>'Monthly','months'=>1],
'quarterly'=>['label'=>'Quarterly','months'=>3], 'semi_annual'=>['label'=>'Semi-Annual (6mo)','months'=>6],
'annual'=>['label'=>'Annual','months'=>12]]. `nextNumber()` → LSE-YYYY-NNNN (4 digits).
Accessor `getContractUrlAttribute()` (append to `$appends`).

**RentInvoice**: `lease() belongsTo`, `unit() belongsTo PropertyUnit (property_unit_id)`, `tenant() belongsTo`,
`payments() hasMany RentPayment`. Accessors `getAmountPaidAttribute()` = payments sum, `getBalanceDueAttribute()`
= amount - amount_paid (append both to `$appends`). Static `$statuses` (unpaid #94A3B8, partial #F59E0B,
paid #22C55E, overdue #EF4444, cancelled #475569). `nextNumber()` → RNT-YYYY-NNNN.
Method `recalcStatus()`: sets status paid if balance<=0, partial if 0<paid<amount, else keep unpaid/overdue.

**RentPayment**: `invoice() belongsTo RentInvoice (rent_invoice_id)`, `lease() belongsTo`. Static `$methods`
(cash, bank_transfer, mobile_money, cheque). Accessor `getReceiptUrlAttribute()`.

**PropertyExpense**: `property() belongsTo`, `unit() belongsTo PropertyUnit`. Static `$categories` shaped
`['renovation'=>['label'=>'Renovation','icon'=>'🔨'], ...]` (renovation 🔨, repair 🛠️, maintenance 🧰,
utility 💡, land_rent 🌍, tax 🧾, agent_fee 🤝, security 🛡️, cleaning 🧹, furnishing 🛋️, insurance 📋, other 📦),
`$phases` (acquisition, renovation, operating). Accessor `getReceiptUrlAttribute()`.

---

## PERMISSION KEYS (orchestrator wires these — agents just use them in mind)
```
realestate_properties  (view, create, edit, delete)   // also gates units
realestate_tenants     (view, create, edit, delete)
realestate_leases      (view, create, edit, delete)
realestate_rent        (view, create, delete)          // rent invoices + payments
realestate_expenses    (view, create, edit, delete)
realestate_reports     (view)
```
Admin role is `['*']` and auto-inherits all of these.

---

## ROUTES (orchestrator owns routes/web.php — backend agents implement EXACTLY these method signatures)
All under `Route::middleware(['auth','no.driver'])->prefix('system')->name('system.')` then
`->prefix('real-estate')->name('real-estate.')`.

Controllers in `App\Http\Controllers\System\RealEstate\`:

**PropertyController** (`realestate_properties`):
- `index(Request)` GET properties           → page `system/RealEstate/Properties/Index`
- `create()` GET properties/create          → `system/RealEstate/Properties/Create`
- `store(Request)` POST properties
- `show(Property)` GET properties/{property} → `system/RealEstate/Properties/Show`
- `edit(Property)` GET properties/{property}/edit → `system/RealEstate/Properties/Edit`
- `update(Request,Property)` PUT properties/{property}
- `destroy(Property)` DELETE properties/{property}
- `uploadTitleDeed(Request,Property)` POST properties/{property}/title-deed (field `file`, mimes pdf,jpg,jpeg,png max 10240)
- `updateStatus(Request,Property)` PATCH properties/{property}/status

**PropertyUnitController** (`realestate_properties`):
- `store(Request,Property)` POST properties/{property}/units
- `update(Request,PropertyUnit)` PUT real-estate/units/{unit}
- `destroy(PropertyUnit)` DELETE real-estate/units/{unit}

**TenantController** (`realestate_tenants`): resourceful index/create/store/show/edit/update/destroy
→ pages `system/RealEstate/Tenants/{Index,Create,Show,Edit}`.

**LeaseController** (`realestate_leases`): index/create/store/show/edit/update/destroy
→ pages `system/RealEstate/Leases/{Index,Create,Show,Edit}`. Plus:
- `uploadContract(Request,Lease)` POST leases/{lease}/contract (field `file`, mimes pdf,jpg,jpeg,png,doc,docx max 10240)
- `updateStatus(Request,Lease)` PATCH leases/{lease}/status

**RentController** (`realestate_rent`):
- `index(Request)` GET rent → page `system/RealEstate/Rent/Index`
- `generate(Request)` POST rent/generate  (body: `month` YYYY-MM optional, generates next-due invoice per active lease whose period not yet invoiced)
- `storePayment(Request,RentInvoice)` POST rent/invoices/{invoice}/payments
- `destroyPayment(RentPayment)` DELETE rent/payments/{payment}
- `invoicePdf(RentInvoice)` GET rent/invoices/{invoice}/pdf (optional, dompdf) — SKIP if unsure.

**PropertyExpenseController** (`realestate_expenses`):
- `index(Request)` GET expenses → page `system/RealEstate/Expenses/Index`
- `store(Request)` POST expenses (body includes property_id, optional property_unit_id; compute amount_tzs)
- `update(Request,PropertyExpense)` PUT expenses/{expense}
- `destroy(PropertyExpense)` DELETE expenses/{expense}

**ReportController** (`realestate_reports`):
- `profitability(Request)` GET reports/profitability → `system/RealEstate/Reports/Profitability`
- `occupancy(Request)` GET reports/occupancy → `system/RealEstate/Reports/Occupancy`
- `arrears(Request)` GET reports/arrears → `system/RealEstate/Reports/Arrears`

---

## CONTROLLER → PAGE PROP CONTRACTS (frontend agents build to these exact prop names)

### Properties/Index  props:
`properties` (paginator; each row has: id, code, name, type, status, address, region, units_count,
occupied_units_count, monthly_rent_roll [sum of active-lease rent in TZS]), `stats` {total, occupied,
under_renovation, monthly_roll}, `types` (Property::$types), `statuses` (Property::$statuses), `filters` {search,status,type}.

### Properties/Create & Edit  props:
`types`, `statuses`, `ownerships`, currencies array `currencies`; Edit also `property`.
Form posts: name,type,status,ownership,address,region,district,acquisition_date,purchase_price,
purchase_currency,market_value,title_deed_number,description,notes.

### Properties/Show  props:
`property` (with title_deed_url, total_invested), `units` (array; each: id,unit_number,type,status,
rent_amount,rent_currency,bedrooms,bathrooms,size_sqm,active_lease {id,lease_number,tenant_name,
rent_amount,start_date,end_date} or null), `expenses` (recent array), `expenseTotal` (TZS),
`leases` (active leases summary), `financials` {purchase_price, renovation_total, total_invested,
annual_rent_roll, expense_total}, `types`(Property), `statuses`(Property), `unitTypes`(PropertyUnit::$types),
`unitStatuses`(PropertyUnit::$statuses), `expenseCategories`(PropertyExpense::$categories), `currencies`.
(Property Show hosts: unit add/edit/delete inline forms → POST properties/{id}/units etc.; expense quick-add
→ POST expenses with property_id; title-deed upload.)

### Tenants/Index props: `tenants` (paginator: id,code,name,type,phone,email,status,active_leases_count),
`stats` {total,active,companies}, `types`, `statuses`, `filters`.
### Tenants/Create & Edit: `types`,`statuses`; Edit also `tenant`.
### Tenants/Show: `tenant`, `leases` (this tenant's leases w/ unit+property labels), `statuses`,`types`.

### Leases/Index props: `leases` (paginator; each: id,lease_number,tenant_name,property_label
[property name — unit_number], rent_amount,rent_currency,billing_cycle,start_date,end_date,status,
has_contract bool), `stats` {active, expiring_30d, expired, monthly_roll}, `statuses`, `billingCycles`,
`filters` {search,status}.
### Leases/Create props: `units` (vacant+available units: id, label "Property — Unit (rent)"), `tenants`
(id,label), `billingCycles`, `currencies`, `statuses`, optional preselected `unit_id` from query.
### Leases/Edit props: `lease`, `units`, `tenants`, `billingCycles`, `currencies`, `statuses`.
Lease form posts: property_unit_id,tenant_id,start_date,end_date,billing_cycle,rent_amount,rent_currency,
deposit_amount,payment_day,status,terms,notes.
### Leases/Show props: `lease` (with unit+property+tenant loaded, contract_url), `invoices` (this lease's
rent invoices w/ amount_paid,balance_due), `statuses`, `billingCycles`, `paymentMethods`(RentPayment::$methods).
Hosts: upload-contract form (POST leases/{id}/contract), status change (PATCH leases/{id}/status),
record-payment on an invoice (POST rent/invoices/{invoice}/payments).

### Rent/Index props: `invoices` (paginator; each: id,invoice_number,tenant_name,property_label,
period_start,period_end,due_date,amount,currency,status,amount_paid,balance_due), `stats` {total_billed,
total_collected, outstanding, overdue_count}, `statuses`(RentInvoice::$statuses), `paymentMethods`,
`filters` {search,status}. Hosts a "Generate rent invoices" button (POST rent/generate with `month`).

### Expenses/Index props: `expenses` (paginator; each: id,property_label,unit_label,category,description,
amount,currency,amount_tzs,expense_date,phase,vendor), `stats` {total_tzs, this_month_tzs, renovation_tzs},
`categories`(PropertyExpense::$categories), `phases`, `properties` (id,name for the add-form select),
`currencies`, `filters` {search,category,property_id,phase}. Hosts add/edit/delete expense forms.

### Reports/Profitability props: `rows` (per property: id,name,type, rent_collected_tzs, rent_billed_tzs,
expense_tzs, net_tzs, occupancy_pct), `totals` {rent_collected, expense, net}, `filters` {from,to}.
### Reports/Occupancy props: `properties` (id,name,type,total_units,occupied_units,vacant_units,
occupancy_pct,monthly_roll), `totals` {units,occupied,vacant,occupancy_pct}.
### Reports/Arrears props: `rows` (per tenant or per lease: tenant_name,property_label,lease_number,
outstanding_tzs, oldest_due_date, days_overdue), `total_outstanding`, `aging` {d0_30,d31_60,d61_90,d90_plus}.

---

## Rent generation logic (RentController@generate)
For each `active` lease: determine the next un-invoiced period using billing_cycle months. The first
period starts at lease.start_date; subsequent periods follow consecutively. Find the latest rent_invoice
for the lease; the new period_start = previous period_end + 1 day (or lease.start_date if none). Only
generate if period_start <= end of target month (default: current month). amount = lease.rent_amount ×
cycle months? NO — `amount = lease.rent_amount` represents the rent for ONE billing period (i.e. for an
annual lease the rent_amount is the annual figure). Keep it simple: one invoice per billing period =
`lease.rent_amount`. due_date = period_start (or payment_day of that month if set). currency = lease.rent_currency.
Set tenant_id + property_unit_id from lease. Use RentInvoice::nextNumber().

## Expense amount_tzs
`amount_tzs = currency === 'TZS' ? amount : amount * (exchange_rate ?? 1)`. Compute in controller on store/update.

## Demo seeder (orchestrator builds RealEstateSeeder)
Not an agent task — orchestrator handles. Agents need not touch seeders.