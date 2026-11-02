<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class GpsPrune extends Command
{
    protected $signature = 'gps:prune
        {--months= : Keep this many months of positions (default: config tracking.retention_months)}';

    protected $description = 'Delete old GPS positions and alerts so the tracking tables do not grow forever';

    public function handle(): int
    {
        $months = (int) ($this->option('months') ?: config('tracking.retention_months'));
        $cutoff = now()->subMonths($months);

        // Delete in chunks: a single huge DELETE would lock the table the live listener is writing to.
        $positions = 0;
        do {
            $n = DB::table('vehicle_locations')->where('recorded_at', '<', $cutoff)->limit(10000)->delete();
            $positions += $n;
        } while ($n > 0);

        $events = DB::table('gps_events')
            ->where('occurred_at', '<', now()->subMonths(config('tracking.event_retention_months')))
            ->delete();

        $this->info("Pruned {$positions} position(s) older than {$months} month(s) and {$events} old alert(s).");

        return self::SUCCESS;
    }
}
