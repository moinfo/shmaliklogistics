# Driver & Fleet Procedures

How the driver portal and fleet oversight features work end-to-end.

---

## 1. Account & Login

1. Admin registers a driver under **System → Drivers → Add Driver** (name, phone, licence, birth region/district, etc.).
2. On the driver's profile page, admin clicks **Create Login Account** and sets an email + password.
   - This creates a `users` row with role `driver`, links it to the driver record via `drivers.user_id`.
3. Driver opens the site `/login`, enters that email/password.
4. `AuthController` checks `user.role.slug === 'driver'` and redirects to `/driver/dashboard` (others go to `/system/dashboard`).
5. Driver routes are protected by middleware `driver` (`EnsureDriver`) which also requires that a Driver profile is linked — otherwise 403.

---

## 2. Pre-Trip Vehicle Inspection (Ukaguzi wa Asubuhi)

**Goal:** Driver confirms the vehicle is roadworthy before any trip.

### Flow
1. Driver lands on `/driver/dashboard`. If no inspection has been recorded today (`inspected_at = today` AND `inspection_type = pre_trip`), a yellow banner shows **"Ukaguzi wa gari haujafanyika leo"** with an **Anza Ukaguzi** button.
2. Button opens `/driver/inspections/create`.
3. Form auto-fills the driver's assigned vehicle. Driver picks inspection type:
   - **Pre-Trip (Morning)** — default
   - **On-Route Check** — during trip
   - **Post-Trip** — end of day
4. Checklist (14 items by default — defined in `VehicleInspection::$defaultChecklist`):
   - Brakes, Tires, Lights, Engine oil, Coolant, Fuel, Wipers, Mirrors, Horn, Fire extinguisher, First-aid, Reflectors, Documents, Load secured
   - Each item is toggled **OK / Issue / N/A**. Marking **Issue** reveals an inline notes input.
5. Extra fields: overall status (`ok | minor_issues | critical`), odometer (km), location text, GPS capture (browser geolocation), free-text notes, optional photo.
6. Submit → `POST /driver/inspections` → row written to `vehicle_inspections` linked to `vehicle_id`, `driver_id`, and optionally `trip_id`.
7. Driver is redirected to dashboard with success flash; banner disappears since today's inspection now exists.

### Admin Oversight
- **System → Fleet → Inspections** (`/system/inspections`) lists all submissions.
- Filters: vehicle, driver, status, type. Stats cards show today/total/minor/critical counts.
- Click a row → `/system/inspections/{id}` shows full checklist with issue notes, GPS, photo, and trip link.
- Requires permission `inspections.view`.

---

## 3. Trip Assignment & Driver Notification

**Goal:** When admin assigns a trip, the driver sees it immediately on next page load.

### Flow
1. Admin creates/edits a trip at `/system/trips/create`. The form sends both `driver_id` (FK) and `driver_name` (legacy string).
2. `TripController::syncLegacyFields()` keeps `drivers.id ↔ trips.driver_id` and `drivers.name ↔ trips.driver_name` in sync, regardless of whether the form submitted ID or name. Same logic for vehicle.
3. On save, the trip row exists with `driver_id = <the driver>`.
4. The next time that driver loads any `/driver/*` page, `DriverAlertService::for($driver)` runs:
   - Queries trips `where driver_id = <id> and status = 'planned' and updated_at >= now - 12h`
   - Emits an alert `{ kind: 'trip_assigned', severity: 'info', title: "Umepewa safari mpya: TRP-...", href: '/driver/trips/{id}' }`
5. `HandleInertiaRequests` shares this as `driverAlerts` prop (only for driver-role users).
6. `DriverLayout` renders a blue banner at the top with **Ona Safari** CTA. A short chime plays once when a new alert ID appears.
7. `DriverLayout` polls `router.reload({ only: ['driverAlerts'] })` every 60s so alerts refresh without full navigation.

---

## 4. 3-Hour Check-In (Check-in Kila Masaa Matatu)

**Goal:** While on an active trip, drivers confirm safety/progress every 3 hours.

### Rules
- `TripCheckIn::INTERVAL_HOURS = 3`.
- A check-in is **due** when `now > (last_check_in.checked_in_at ?? trip.departure_date) + 3 hours`, while trip status is one of `loading`, `in_transit`, `at_border`.

### Flow
1. `DriverAlertService` checks each active trip for the driver.
2. If overdue → emits alert `{ kind: 'check_in', severity: 'warning' | 'critical' (if >60min late), title: 'Check-in inahitajika kwa TRP-...', href: '/driver/check-ins/create?trip={id}' }`.
3. Banner appears in `DriverLayout` with **Check-In Sasa** button (chime plays on first appearance).
4. Driver clicks → `/driver/check-ins/create`.
5. Page lists active trips (preselects trip from query string), shows time since last check-in for that trip, and a warning if overdue.
6. Driver picks status (**OK / Issue / Emergency**), captures GPS (one-tap), enters location text + odometer + notes.
7. Submit → `POST /driver/check-ins` → row written to `trip_check_ins` with `driver_id`, `vehicle_id`, `trip_id`, `lat/lng`, `status`, `notes`.
8. Driver redirected to dashboard; banner clears on next poll (alert ID no longer in the list).
9. Driver's own history at `/driver/check-ins`.

### Admin Oversight
- **System → Fleet → Check-Ins** (`/system/check-ins`) lists all check-ins.
- Filter by driver and status (OK/Issue/Emergency). Stats: today, issues, emergencies, total.
- Requires permission `trip_check_ins.view`.
- Emergency check-ins should be acted on immediately — the colour is red in both lists.

---

## 5. Driver Trip Expenses (Fines / Mlinzi / Border)

**Goal:** Driver records cash they paid en-route so the trip P&L stays accurate.

### Flow
1. On `/driver/trips/{id}`, while the trip status is `planned | loading | in_transit | at_border | delivered`, a **💸 Expenses** button appears in the quick-actions row.
2. Clicking it opens an inline form with three fields:
   - **Fine za Barabarani** (`road_fines`)
   - **Hela ya Mlinzi** (`guard_fees`)
   - **Border Costs** (`border_costs`)
   - Plus an optional **Maelezo** textarea.
3. Each field shows the existing value — driver edits it to the new total.
4. Submit → `PATCH /driver/trips/{trip}/expenses` → `DriverTripExpenseController@update`:
   - Verifies `trip.driver_id === driver.id` (else 403).
   - Verifies trip status is still editable (`completed`/`cancelled` are locked).
   - Saves `road_fines`, `guard_fees`, `border_costs`.
   - If notes provided, **appends** a timestamped line `[YYYY-MM-DD HH:MM — Driver Name] <message>` to `trip.notes` (never overwrites).
5. Trip's `total_costs` accessor now includes `road_fines + guard_fees` automatically (see `Trip::getTotalCostsAttribute`), so profit calculations on every report stay correct.

### Admin Side
- Admin still has full edit access at `/system/trips/{id}/edit` — the new fields are visible in the **Financials** section.
- Locked trips (`completed`, `cancelled`) can only be edited from the admin side.

---

## 6. Notifications (In-App Banner + Audio)

**Goal:** Drivers see what they need to do without checking pages manually.

### What gets shown
`DriverAlertService::for($driver)` returns up to three alert kinds:
| Kind | When | Severity |
|---|---|---|
| `inspection` | No `pre_trip` inspection today | `warning` |
| `check_in` | Active trip + last check-in older than 3h | `warning` (≤60min late) or `critical` (>60min late) |
| `trip_assigned` | A `planned` trip updated in the last 12h | `info` |

### Where it renders
- Shared as Inertia prop `driverAlerts` for any driver-role user (see `HandleInertiaRequests::share()`).
- `DriverLayout` renders the stack at the top of every driver page; each alert is dismissible.
- Header shows a 🔔 count badge.
- Audio chime (two-note synthesised via Web Audio) plays once on transition to a new alert ID. First page load is silent.
- Polling every 60s via `router.reload({ only: ['driverAlerts'] })` keeps the list fresh while the driver is idle on a page.

### Adding a new alert kind later
1. Add a new block in `DriverAlertService::for()` returning an item with a unique `id`.
2. The banner UI will render it automatically using its `severity` and `cta`.

---

## 7. Permission Matrix

| Module | View | Notes |
|---|---|---|
| `inspections` | `inspections.view` | Auto-granted to Administrator (`*`) and Operations Manager. |
| `trip_check_ins` | `trip_check_ins.view` | Same. |
| Driver portal | (none — gated by role `driver`) | `EnsureDriver` middleware checks `user.role.slug === 'driver'` AND a linked Driver record. |

To grant to a custom role: **System → Settings → Roles & Permissions** → edit role → toggle **Vehicle Inspections** / **Trip Check-Ins**.

---

## 8. Data Model Quick Reference

```
trips
  + driver_id  → drivers.id    (backfilled from driver_name)
  + vehicle_id → vehicles.id   (backfilled from vehicle_plate)
  + road_fines     decimal(15,2)
  + guard_fees     decimal(15,2)

vehicle_inspections (new)
  vehicle_id, driver_id, trip_id (nullable)
  inspection_type   (pre_trip | periodic | post_trip)
  items             JSON   { brakes: { status: 'ok', notes: '' }, ... }
  overall_status    (ok | minor_issues | critical)
  odometer_km, location, lat, lng, notes, photo_path

trip_check_ins (new)
  trip_id, driver_id, vehicle_id
  checked_in_at timestamp
  lat, lng, location, odometer_km
  status            (ok | issue | emergency)
  notes
```

---

## 9. Sequence of a Typical Day

```
06:00  Driver logs in → /driver/dashboard
       Banner: "Ukaguzi wa gari haujafanyika leo" (yellow)
06:05  /driver/inspections/create → submits checklist (status: ok)
       Banner clears.
07:00  Trip TRP-2026-042 starts (status: loading → in_transit)
10:00  Banner appears: "Check-in inahitajika" (warning)
10:05  /driver/check-ins/create → captures GPS, status: ok
       Banner clears.
12:30  Driver pays 5,000 TZS road fine
12:31  /driver/trips/42 → 💸 Expenses → enters 5000 in road_fines
       Note: "[2026-05-15 12:31 — Juma] Faini Iringa"
13:00  Banner appears: "Check-in inahitajika" (warning)
...    (repeats every 3 hours)
19:00  Trip status set to delivered by admin
       Driver sees it on next page load.
```

---

## 10. Files of Note

| Purpose | File |
|---|---|
| Driver login redirect | `app/Http/Controllers/Auth/AuthController.php` |
| Driver-area middleware | `app/Http/Middleware/EnsureDriver.php` |
| Driver dashboard | `app/Http/Controllers/Driver/DriverPortalController.php` |
| Inspection (driver) | `app/Http/Controllers/Driver/DriverInspectionController.php` |
| Check-in (driver) | `app/Http/Controllers/Driver/DriverCheckInController.php` |
| Expense entry (driver) | `app/Http/Controllers/Driver/DriverTripExpenseController.php` |
| Admin inspections list | `app/Http/Controllers/System/VehicleInspectionController.php` |
| Admin check-ins list | `app/Http/Controllers/System/TripCheckInController.php` |
| Alert service | `app/Services/DriverAlertService.php` |
| Layout + banner | `resources/js/layouts/DriverLayout.jsx` |
| Permission registry (UI) | `resources/js/pages/system/Settings/Roles/Index.jsx` |
