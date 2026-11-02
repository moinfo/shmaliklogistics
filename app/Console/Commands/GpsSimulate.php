<?php

namespace App\Console\Commands;

use App\Services\TeltonikaService;
use App\Support\Geo;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Throwable;

class GpsSimulate extends Command
{
    protected $signature = 'gps:simulate
        {imei : IMEI of a device registered in gps_devices}
        {--host=127.0.0.1}
        {--port=5027}
        {--from=-6.8667,39.2167 : Start "lat,lng" (default: Buza, Dar es Salaam)}
        {--to=-6.8184,39.2965 : End "lat,lng" (default: Dar es Salaam port)}
        {--profile=varied : varied = changing speeds, stops and the odd speeding burst; steady = constant speed}
        {--step=50 : steady profile only: metres travelled between packets}
        {--interval=3 : Seconds between packets}
        {--packets=100000 : Maximum number of packets to send}
        {--seed= : Fix the random speed pattern (varied profile)}
        {--codec=8e : 8 or 8e}';

    protected $description = 'Pretend to be a Teltonika tracker driving a real road route and send positions to gps:listen (dev/testing)';

    /** @var resource|null */
    private $sock = null;

    public function handle(TeltonikaService $codec): int
    {
        $path = $this->route();
        if (count($path) < 2) {
            $this->error('Could not build a route.');
            return self::FAILURE;
        }

        // Cumulative distance along the route, so we can place the vehicle at any distance travelled.
        $cum = [0.0];
        for ($i = 1; $i < count($path); $i++) {
            $cum[$i] = $cum[$i - 1] + Geo::distance($path[$i - 1][0], $path[$i - 1][1], $path[$i][0], $path[$i][1]);
        }
        $total = end($cum);

        if (! $this->connect()) {
            return self::FAILURE;
        }

        $interval = max(1, (int) $this->option('interval'));
        $varied   = $this->option('profile') !== 'steady';
        $codecId  = strtolower($this->option('codec')) === '8' ? TeltonikaService::CODEC_8 : TeltonikaService::CODEC_8E;
        $max      = (int) $this->option('packets');
        if ($this->option('seed') !== null) {
            mt_srand((int) $this->option('seed'));
        }

        $this->line(sprintf('Route: %.1f km, %s speeds, one packet every %ds. Ctrl+C to stop.', $total / 1000, $varied ? 'varied' : 'steady', $interval));

        $travelled = 0.0;
        $speed = 0.0;               // actual speed, km/h
        $target = 0.0;
        $kind = 'cruise';
        $changeAt = 0;              // tick at which the next speed pattern starts
        $restDone = false;          // one long rest stop around half-way
        $stopLog = '';

        for ($tick = 0; $tick < $max; $tick++) {
            if ($varied) {
                // Long rest stop once, half-way: long enough to show as a "stop" on the replay.
                if (! $restDone && $travelled >= $total / 2) {
                    $restDone = true;
                    $kind = 'rest'; $target = 0.0; $changeAt = $tick + (int) ceil(420 / $interval);
                    $stopLog = 'rest stop (7 min)';
                } elseif ($tick >= $changeAt) {
                    [$kind, $target, $seconds] = $this->nextPattern();
                    $changeAt = $tick + (int) ceil($seconds / $interval);
                }
                // Smooth acceleration (+5 km/h per s) and braking (−9 km/h per s).
                $speed = $speed < $target ? min($target, $speed + 5 * $interval) : max($target, $speed - 9 * $interval);
                $reported = $speed > 0 ? max(1, (int) round($speed + mt_rand(-2, 2))) : 0;
            } else {
                $speed = (int) $this->option('step') / $interval * 3.6;
                $reported = (int) round($speed);
            }

            $travelled = min($total, $travelled + $speed / 3.6 * $interval);
            $arrived = $travelled >= $total;
            [$lat, $lng, $heading] = $this->pointAt($path, $cum, $travelled);
            $moving = $reported > 0 && ! $arrived;

            $packet = $codec->encodePacket($codecId, [[
                'timestamp'  => Carbon::now('UTC'),
                'latitude'   => $lat,
                'longitude'  => $lng,
                'altitude'   => 20,
                'heading'    => $heading,
                'satellites' => 11,
                'speed'      => $arrived ? 0 : $reported,
                'io'         => [
                    TeltonikaService::IO_IGNITION         => $arrived ? 0 : 1,
                    TeltonikaService::IO_MOVEMENT         => $moving ? 1 : 0,
                    TeltonikaService::IO_EXTERNAL_VOLTAGE => 24100 + mt_rand(-150, 150),
                ],
            ]]);

            $ack = $this->send($packet, $codec);
            $this->line(sprintf('%s  %5.1f/%.1f km  %3d km/h  %-6s %.5f, %.5f %s',
                now()->format('H:i:s'), $travelled / 1000, $total / 1000, $arrived ? 0 : $reported, $kind, $lat, $lng,
                $ack ? '' : '(not acknowledged)'));

            if ($arrived) {
                break;
            }
            sleep($interval);
        }

        $this->info('Arrived — vehicle parked.');
        if ($this->sock) {
            fclose($this->sock);
        }

        return self::SUCCESS;
    }

    /** @return array{0:string,1:float,2:int} [pattern name, target km/h, duration in seconds] */
    private function nextPattern(): array
    {
        $r = mt_rand(1, 100);

        return match (true) {
            $r <= 7  => ['stop',   0.0,                         mt_rand(60, 150)],    // traffic / checkpoint
            $r <= 22 => ['town',   (float) mt_rand(15, 38),     mt_rand(30, 80)],     // slow through a town
            $r <= 36 => ['fast',   (float) mt_rand(86, 102),    mt_rand(30, 70)],     // over the 80 km/h limit
            default  => ['cruise', (float) mt_rand(55, 82),     mt_rand(40, 130)],
        };
    }

    /** Position and heading after travelling $s metres along the route. */
    private function pointAt(array $path, array $cum, float $s): array
    {
        $lo = 0;
        $hi = count($cum) - 1;
        while ($lo < $hi - 1) {
            $mid = intdiv($lo + $hi, 2);
            $cum[$mid] <= $s ? $lo = $mid : $hi = $mid;
        }

        $seg = $cum[$hi] - $cum[$lo];
        $t   = $seg > 0 ? min(1, max(0, ($s - $cum[$lo]) / $seg)) : 0;
        $lat = $path[$lo][0] + ($path[$hi][0] - $path[$lo][0]) * $t;
        $lng = $path[$lo][1] + ($path[$hi][1] - $path[$lo][1]) * $t;

        return [$lat, $lng, Geo::bearing($path[$lo][0], $path[$lo][1], $path[$hi][0], $path[$hi][1])];
    }

    /** Open the connection and do the IMEI handshake. */
    private function connect(): bool
    {
        $sock = @stream_socket_client("tcp://{$this->option('host')}:{$this->option('port')}", $errno, $errstr, 5);
        if (! $sock) {
            $this->error("Cannot connect: {$errstr}");
            return false;
        }
        stream_set_timeout($sock, 10);

        $imei = $this->argument('imei');
        fwrite($sock, pack('n', strlen($imei)) . $imei);
        if (fread($sock, 1) !== "\x01") {
            $this->error('IMEI refused — register it in gps_devices first.');
            return false;
        }

        $this->sock = $sock;
        $this->info('Handshake accepted.');

        return true;
    }

    /** Send one packet; if the listener went away, reconnect and resend so the demo keeps running. */
    private function send(string $packet, TeltonikaService $codec): bool
    {
        for ($attempt = 0; $attempt < 3; $attempt++) {
            if ($this->sock) {
                $written = @fwrite($this->sock, $packet);
                $reply   = $written ? @fread($this->sock, 4) : false;
                if ($reply !== false && strlen($reply) === 4) {
                    return unpack('N', $reply)[1] > 0;
                }
                @fclose($this->sock);
                $this->sock = null;
            }

            $this->warn('Connection lost — reconnecting…');
            sleep(3);
            $this->connect();
        }

        return false;
    }

    /** Road geometry between --from and --to via the public OSRM demo server, as [[lat, lng], …]. */
    private function route(): array
    {
        [$fromLat, $fromLng] = array_map('floatval', explode(',', $this->option('from')));
        [$toLat, $toLng]     = array_map('floatval', explode(',', $this->option('to')));

        try {
            $res = Http::timeout(30)
                ->withHeaders(['User-Agent' => config('app.name', 'Laravel') . ' tracker simulator'])
                ->get("https://router.project-osrm.org/route/v1/driving/{$fromLng},{$fromLat};{$toLng},{$toLat}", [
                    'overview' => 'full', 'geometries' => 'geojson',
                ]);
            $coords = $res->json('routes.0.geometry.coordinates');
        } catch (Throwable $e) {
            $coords = null;
        }

        if (! $coords) {
            $this->warn('Routing service unreachable — falling back to a straight line (will not follow roads).');
            return [[$fromLat, $fromLng], [$toLat, $toLng]];
        }

        return array_map(fn ($c) => [$c[1], $c[0]], $coords);   // GeoJSON is [lng, lat]
    }
}
