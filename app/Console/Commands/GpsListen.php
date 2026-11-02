<?php

namespace App\Console\Commands;

use App\Models\GpsDevice;
use App\Services\GpsIngestService;
use App\Services\TeltonikaService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Throwable;

class GpsListen extends Command
{
    protected $signature = 'gps:listen
        {--host=0.0.0.0 : Interface to bind}
        {--port=5027 : TCP port the trackers connect to}
        {--idle=600 : Drop connections silent for this many seconds}';

    protected $description = 'Run the TCP server that receives Teltonika (Codec 8 / 8E) tracker data';

    /** Largest unparsed backlog we tolerate from one connection. */
    private const MAX_BUFFER = 262144;

    /** @var array<int,array{sock:resource,buf:string,imei:?string,device:?GpsDevice,last:int,peer:string}> */
    private array $clients = [];

    public function handle(TeltonikaService $codec, GpsIngestService $ingest): int
    {
        $addr   = "tcp://{$this->option('host')}:{$this->option('port')}";
        $server = @stream_socket_server($addr, $errno, $errstr);
        if (! $server) {
            $this->error("Cannot listen on {$addr}: {$errstr} ({$errno})");
            return self::FAILURE;
        }
        stream_set_blocking($server, false);
        $this->info("GPS listener running on {$addr} — Ctrl+C to stop.");

        $idle = (int) $this->option('idle');

        while (true) {
            $read = [$server];
            foreach ($this->clients as $c) {
                $read[] = $c['sock'];
            }
            $write = $except = null;

            if (@stream_select($read, $write, $except, 5) === false) {
                usleep(200000);
                continue;
            }

            foreach ($read as $sock) {
                if ($sock === $server) {
                    $conn = @stream_socket_accept($server, 0, $peer);
                    if ($conn) {
                        stream_set_blocking($conn, false);
                        $this->clients[(int) $conn] = [
                            'sock' => $conn, 'buf' => '', 'imei' => null,
                            'device' => null, 'last' => time(), 'peer' => (string) $peer,
                        ];
                    }
                    continue;
                }

                $id   = (int) $sock;
                $data = fread($sock, 65536);
                if ($data === false || ($data === '' && feof($sock))) {
                    $this->drop($id);
                    continue;
                }

                $this->clients[$id]['buf'] .= $data;
                $this->clients[$id]['last'] = time();

                try {
                    $this->process($id, $codec, $ingest);
                } catch (InvalidArgumentException $e) {
                    $this->line("[{$this->clients[$id]['peer']}] rejected: {$e->getMessage()}");
                    $this->drop($id);
                } catch (Throwable $e) {
                    // Not acked — the device keeps the records and retries on reconnect.
                    Log::error('GPS ingest failed', ['error' => $e->getMessage()]);
                    $this->error("Ingest error: {$e->getMessage()}");
                    DB::reconnect();
                    $this->drop($id);
                }
            }

            $now = time();
            foreach ($this->clients as $id => $c) {
                if ($now - $c['last'] > $idle) {
                    $this->drop($id);
                }
            }
        }
    }

    private function process(int $id, TeltonikaService $codec, GpsIngestService $ingest): void
    {
        $c = &$this->clients[$id];

        while ($c['buf'] !== '') {
            if ($c['imei'] === null) {
                $len = $codec->imeiFrameLength($c['buf']);
                if ($len === null) {
                    break;
                }
                $imei     = $codec->parseImei(substr($c['buf'], 0, $len));
                $c['buf'] = substr($c['buf'], $len);

                $device = GpsDevice::with('vehicle')->where('imei', $imei)->where('is_active', true)->first();
                if (! $device) {
                    fwrite($c['sock'], "\x00");
                    $this->line("[{$c['peer']}] unknown IMEI {$imei} — refused");
                    unset($c);
                    $this->drop($id);
                    return;
                }

                fwrite($c['sock'], "\x01");
                $c['imei']   = $imei;
                $c['device'] = $device;
                $this->line("[{$c['peer']}] {$imei} connected" . ($device->vehicle ? " ({$device->vehicle->plate})" : ' (no vehicle linked)'));
                continue;
            }

            $len = $codec->packetFrameLength($c['buf']);
            if ($len === null) {
                if (strlen($c['buf']) > self::MAX_BUFFER) {
                    throw new InvalidArgumentException('Buffer overflow.');
                }
                break;
            }

            $packet   = $codec->decodePacket(substr($c['buf'], 0, $len));
            $c['buf'] = substr($c['buf'], $len);

            $stored = $ingest->ingest($c['device'], $packet['records']);
            fwrite($c['sock'], $codec->ack($stored));
            $this->line("[{$c['peer']}] {$c['imei']} → {$stored} record(s)");
        }
    }

    private function drop(int $id): void
    {
        if (isset($this->clients[$id])) {
            @fclose($this->clients[$id]['sock']);
            unset($this->clients[$id]);
        }
    }
}
