<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Vehicle tracking housekeeping (needs `php artisan schedule:run` every minute on the server).
Schedule::command('gps:check-offline')->everyFiveMinutes()->withoutOverlapping();
Schedule::command('gps:prune')->dailyAt('03:00');
