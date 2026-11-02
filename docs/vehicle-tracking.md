# Vehicle Tracking (GPS)

Live tracking for vehicles fitted with **Teltonika** trackers (built and tested for the FMB130; any Teltonika
device speaking Codec 8 / 8 Extended works).

## How it works

```
 Tracker (FMB130) ──TCP :5027──►  php artisan gps:listen  ──►  vehicle_locations (history)
   Codec 8 / 8E                    TeltonikaService (decode)     vehicles.gps_* (last position)
                                   GpsIngestService (store)      gps_events (alerts)
                                   GpsEventService (rules)
```

The tracker does **not** speak HTTP. It opens a TCP connection to the server and sends binary packets, so a
small always-running listener (`gps:listen`) sits in front of Laravel. A tracker whose IMEI is not registered
(Settings → GPS Devices) is refused.

| Piece | Where |
|---|---|
| Packet decoder / encoder | `app/Services/TeltonikaService.php` |
| Storing positions, distance, place names | `app/Services/GpsIngestService.php`, `app/Jobs/ReverseGeocodeVehicle.php` |
| Alert rules | `app/Services/GpsEventService.php`, `app/Console/Commands/GpsCheckOffline.php` |
| Moving / idle / parked / offline state | `app/Services/FleetPositionService.php` |
| Thresholds | `config/tracking.php` |

## Screens

| Menu | What it does | Permission |
|---|---|---|
| Fleet → Live Map | All vehicles on a map, search, satellite view, follow mode, zones | `fleet_tracking.view` |
| Fleet → Tracking Alerts | Speeding, idling, after-hours start, harsh driving, offline, zone enter/exit | view / `edit` to acknowledge |
| Fleet → Geofences | Circular zones with enter / exit alerts | view / `edit` to manage |
| Fleet → GPS Mileage | GPS kilometres and driver-behaviour score per vehicle, PDF / Excel export | view |
| Vehicle page / Trip page | Live panel, 24 h (or trip-period) route, replay link, share link | view (share = `edit`) |
| Vehicle → Replay route | Route playback with stops, speed colouring and alerts, up to 7 days | view |
| Settings → GPS Devices | Register a tracker's IMEI and link it to a vehicle | `settings.view` / `settings.edit` |
| Dashboard | Moving / idle / parked / offline counts | `fleet_tracking.view` |

States: **moving** (≥ 3 km/h), **idle** (stopped, ignition on or unknown), **parked** (stopped, ignition off),
**offline** (no report for 15 minutes).

## Setting up a real tracker

1. **Register it:** Settings → GPS Devices → Add Device. Enter the 15-digit IMEI from the label and pick the vehicle.
2. **Configure the tracker** with the *Teltonika Configurator* (USB):
   * **System → GPRS:** APN of the SIM (Vodacom, Airtel, Tigo, Halotel …).
   * **Data Acquisition → Server Settings:** server domain or public IP, port **5027**, protocol **TCP**, codec **Codec 8 Extended**.
   * **Data Acquisition:** record every ~30 s while moving (also on angle / distance), and send promptly.
   * **I/O:** make sure **Ignition (239)**, **Movement (240)** and **External Voltage (66)** are enabled. Ignition needs the
     ignition wire connected (pin 5, "IGNITION / DIN 1"). Without it every stopped truck shows as *idle*, not *parked*.
   * Optional: **Eco / Green Driving** (IO 253) to get harsh braking / acceleration / cornering alerts.
3. **Make the server reachable:** the tracker connects *out* to your server, so the server needs a public IP or domain
   with TCP **5027** open in the firewall. A shared host usually cannot do this; a VPS can.
4. **Run the listener permanently** and restart it after every deploy (it keeps code in memory):

   ```
   php artisan gps:listen --port=5027
   ```

   Use a supervisor — Supervisor (Linux) or NSSM / a Windows service — so it restarts if it stops.
5. **Run the Laravel scheduler** (`* * * * * php artisan schedule:run`) and a **queue worker**
   (`php artisan queue:work`). The scheduler runs the offline check every 5 minutes and the nightly clean-up;
   the queue worker looks up place names.

## Commands

| Command | Purpose |
|---|---|
| `gps:listen` | The TCP server trackers connect to |
| `gps:simulate {imei}` | Fake tracker driving a real road route (development only). Options: `--from`, `--to`, `--step`, `--interval`, `--packets` |
| `gps:check-offline` | Alert for each tracker that stopped reporting (scheduled every 5 min) |
| `gps:prune` | Delete positions older than `retention_months` (default 6) and alerts older than 12 months (scheduled nightly) |

## Behaviour worth knowing

* **Alert rules** (`config/tracking.php`): speed above 80 km/h (one alert per vehicle per 10 min); engine on and stationary
  for 15 min; ignition switched on outside 05:00–21:00 Dar es Salaam time; zone entry / exit; tracker silent for 15 min.
  Records older than 2 hours (a backlog upload after a coverage gap) update state but never raise alerts.
* **Distance** is the straight-line distance between consecutive records. A jump implying > 250 km/h is treated as a GPS
  glitch and counted as 0. Real road distance is slightly higher on winding roads.
* **Place names** come from OpenStreetMap Nominatim via a queued job, refreshed when a vehicle moves ~200 m, at most one
  request per second. This sends vehicle coordinates to OpenStreetMap. If the server is offline the coordinates still show.
* **Share links** (`/track/{token}`) need no login. They show plate, position, last update and the last 3 hours of route —
  never the driver or speed. Links expire (1–30 days) and can be revoked. Anyone holding a live link can see the truck's
  position, so share them deliberately.
* **Driver score** = 100 − 5 × (weighted events per 100 km): speeding ×1, harsh driving ×2, long idle ×0.5. Distances under
  50 km count as 50 km. Weights live in `config/tracking.php`.
* **Raw IO values** are stored with every position (`vehicle_locations.io`), so fuel-level, temperature or other sensors can be
  added later without re-collecting data.

## Not built

* Fuel-level, reefer-temperature and remote engine cut-off need sensors / wiring on the truck (and, for cut-off, a
  deliberate safety design). The data path for the first two is ready; cut-off was intentionally left out.
* Driver-score integration with the Bonus and Appraisal modules.
* Polygon geofences (zones are circles).
