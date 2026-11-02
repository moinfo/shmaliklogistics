<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Vehicle tracking thresholds
    |--------------------------------------------------------------------------
    */

    // Trucks in Tanzania are limited to 80 km/h.
    'speed_limit_kmh' => (int) env('TRACKING_SPEED_LIMIT', 80),

    // A vehicle that has not reported for this long is shown / alerted as offline.
    'offline_after_minutes' => 15,

    // Below this speed a vehicle counts as stationary.
    'moving_speed_kmh' => 3,

    // Engine running while stationary for this long raises a "long idle" alert.
    'idle_alert_minutes' => 15,

    // Ignition switched on outside these local hours raises an alert (24h clock, [start, end)).
    'working_hours' => ['start' => 5, 'end' => 21],
    'timezone'      => 'Africa/Dar_es_Salaam',

    // A stationary stretch at least this long is shown as a "stop" on trip replay.
    'stop_minutes' => 5,

    /*
    |--------------------------------------------------------------------------
    | Retention (gps:prune, scheduled daily)
    |--------------------------------------------------------------------------
    */
    'retention_months'       => (int) env('TRACKING_RETENTION_MONTHS', 6),
    'event_retention_months' => 12,

    /*
    |--------------------------------------------------------------------------
    | Driver behaviour score
    |--------------------------------------------------------------------------
    | score = 100 − 5 × (weighted events per 100 km), floored at 0.
    */
    'score_weights' => ['speeding' => 1.0, 'harsh' => 2.0, 'idle' => 0.5],

];
