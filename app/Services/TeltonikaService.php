<?php

namespace App\Services;

use Carbon\Carbon;
use InvalidArgumentException;

/**
 * Decoder / encoder for the Teltonika TCP protocol (Codec 8 and Codec 8 Extended).
 *
 * Pure byte handling — no database or sockets — so it can be unit-tested.
 *
 * Stream layout:
 *   1. Handshake  : [2-byte length][IMEI as ASCII]            → server answers 0x01 (accept) / 0x00
 *   2. Data packet: [4×0x00][4-byte length][codec][n][records…][n][4-byte CRC-16]
 *                                                              → server answers 4-byte record count
 */
class TeltonikaService
{
    public const CODEC_8  = 0x08;
    public const CODEC_8E = 0x8E;

    // Teltonika IO element ids we map to dedicated columns.
    public const IO_EXTERNAL_VOLTAGE = 66;   // mV
    public const IO_IGNITION         = 239;
    public const IO_MOVEMENT         = 240;

    /** Largest packet a device ever sends is ~1.3 KB; anything bigger is garbage. */
    public const MAX_PACKET_BYTES = 65535;

    // ── Framing ─────────────────────────────────────────────────────────────

    /** Total bytes of the IMEI handshake frame, or null if not enough data has arrived yet. */
    public function imeiFrameLength(string $buffer): ?int
    {
        if (strlen($buffer) < 2) {
            return null;
        }
        $len = unpack('n', $buffer)[1];
        if ($len < 1 || $len > 32) {
            throw new InvalidArgumentException('Invalid IMEI handshake length.');
        }
        return strlen($buffer) >= 2 + $len ? 2 + $len : null;
    }

    public function parseImei(string $frame): string
    {
        $imei = substr($frame, 2);
        if (! preg_match('/^\d{10,20}$/', $imei)) {
            throw new InvalidArgumentException('Malformed IMEI.');
        }
        return $imei;
    }

    /** Total bytes of the first data packet in the buffer, or null if it is still incomplete. */
    public function packetFrameLength(string $buffer): ?int
    {
        if (strlen($buffer) < 8) {
            return null;
        }
        if (substr($buffer, 0, 4) !== "\x00\x00\x00\x00") {
            throw new InvalidArgumentException('Bad packet preamble.');
        }
        $len = unpack('N', substr($buffer, 4, 4))[1];
        if ($len < 3 || $len > self::MAX_PACKET_BYTES) {
            throw new InvalidArgumentException('Implausible packet length.');
        }
        $total = 8 + $len + 4;
        return strlen($buffer) >= $total ? $total : null;
    }

    /** The server's reply to a data packet: how many records were stored. */
    public function ack(int $records): string
    {
        return pack('N', $records);
    }

    // ── Decoding ────────────────────────────────────────────────────────────

    /**
     * @return array{codec:int, records:array<int,array<string,mixed>>}
     * @throws InvalidArgumentException on any structural or CRC problem
     */
    public function decodePacket(string $frame): array
    {
        if (strlen($frame) < 16 || substr($frame, 0, 4) !== "\x00\x00\x00\x00") {
            throw new InvalidArgumentException('Bad packet preamble.');
        }

        $len = unpack('N', substr($frame, 4, 4))[1];
        if (strlen($frame) !== 8 + $len + 4) {
            throw new InvalidArgumentException('Packet length mismatch.');
        }

        $data = substr($frame, 8, $len);
        if ($this->crc16($data) !== unpack('N', substr($frame, 8 + $len, 4))[1]) {
            throw new InvalidArgumentException('CRC mismatch.');
        }

        $codec = ord($data[0]);
        if ($codec !== self::CODEC_8 && $codec !== self::CODEC_8E) {
            throw new InvalidArgumentException(sprintf('Unsupported codec 0x%02X.', $codec));
        }

        $count = ord($data[1]);
        $pos   = 2;
        $extended = $codec === self::CODEC_8E;

        $records = [];
        for ($i = 0; $i < $count; $i++) {
            $records[] = $this->decodeRecord($data, $pos, $extended);
        }

        if ($this->readUInt($data, $pos, 1) !== $count) {
            throw new InvalidArgumentException('Record count mismatch.');
        }

        return ['codec' => $codec, 'records' => $records];
    }

    private function decodeRecord(string $d, int &$pos, bool $extended): array
    {
        $timestampMs = $this->readUInt($d, $pos, 8);
        $priority    = $this->readUInt($d, $pos, 1);

        $lng      = $this->readSInt($d, $pos, 4) / 10000000;
        $lat      = $this->readSInt($d, $pos, 4) / 10000000;
        $altitude = $this->readSInt($d, $pos, 2);
        $angle    = $this->readUInt($d, $pos, 2);
        $sats     = $this->readUInt($d, $pos, 1);
        $speed    = $this->readUInt($d, $pos, 2);

        $idBytes = $extended ? 2 : 1;   // IO ids and counts are 2 bytes in Codec 8E
        $this->readUInt($d, $pos, $idBytes);   // event IO id
        $this->readUInt($d, $pos, $idBytes);   // total IO count

        $io = [];
        foreach ([1, 2, 4, 8] as $valueBytes) {
            $n = $this->readUInt($d, $pos, $idBytes);
            for ($k = 0; $k < $n; $k++) {
                $id      = $this->readUInt($d, $pos, $idBytes);
                $io[$id] = $this->readUInt($d, $pos, $valueBytes);
            }
        }

        if ($extended) {   // variable-length IO elements, kept as hex strings
            $n = $this->readUInt($d, $pos, 2);
            for ($k = 0; $k < $n; $k++) {
                $id     = $this->readUInt($d, $pos, 2);
                $length = $this->readUInt($d, $pos, 2);
                $this->assertAvailable($d, $pos, $length);
                $io[$id] = bin2hex(substr($d, $pos, $length));
                $pos += $length;
            }
        }

        return [
            'timestamp'  => Carbon::createFromTimestampMs($timestampMs, 'UTC'),
            'priority'   => $priority,
            'latitude'   => $lat,
            'longitude'  => $lng,
            'altitude'   => $altitude,
            'heading'    => $angle,
            'satellites' => $sats,
            'speed'      => $speed,
            'io'         => $io,
        ];
    }

    // ── Encoding (used by the simulator and the tests) ──────────────────────

    /**
     * @param array<int,array<string,mixed>> $records each with timestamp (Carbon|ms), latitude,
     *        longitude, and optionally priority, altitude, heading, satellites, speed, io [id => int]
     */
    public function encodePacket(int $codec, array $records): string
    {
        $extended = $codec === self::CODEC_8E;
        $idBytes  = $extended ? 2 : 1;

        $data = chr($codec) . chr(count($records));
        foreach ($records as $r) {
            $ts = $r['timestamp'] instanceof Carbon ? $r['timestamp']->getTimestampMs() : (int) $r['timestamp'];

            $data .= pack('J', $ts)
                . chr($r['priority'] ?? 0)
                . pack('N', $this->toUnsigned32((int) round($r['longitude'] * 10000000)))
                . pack('N', $this->toUnsigned32((int) round($r['latitude'] * 10000000)))
                . pack('n', ($r['altitude'] ?? 0) & 0xFFFF)
                . pack('n', $r['heading'] ?? 0)
                . chr($r['satellites'] ?? 0)
                . pack('n', $r['speed'] ?? 0);

            // Bucket IO values by the smallest width that holds them.
            $buckets = [1 => [], 2 => [], 4 => [], 8 => []];
            foreach ($r['io'] ?? [] as $id => $value) {
                $width = $value <= 0xFF ? 1 : ($value <= 0xFFFF ? 2 : ($value <= 0xFFFFFFFF ? 4 : 8));
                $buckets[$width][$id] = $value;
            }

            $data .= $this->packUInt(0, $idBytes)                                  // event IO id
                . $this->packUInt(count($r['io'] ?? []), $idBytes);                // total IO count
            foreach ($buckets as $width => $items) {
                $data .= $this->packUInt(count($items), $idBytes);
                foreach ($items as $id => $value) {
                    $data .= $this->packUInt($id, $idBytes) . $this->packUInt($value, $width);
                }
            }
            if ($extended) {
                $data .= pack('n', 0);   // no variable-length IO
            }
        }
        $data .= chr(count($records));

        return "\x00\x00\x00\x00" . pack('N', strlen($data)) . $data . pack('N', $this->crc16($data));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /** CRC-16/IBM (poly 0xA001 reflected, init 0) over the data field. */
    public function crc16(string $data): int
    {
        $crc = 0;
        for ($i = 0, $n = strlen($data); $i < $n; $i++) {
            $crc ^= ord($data[$i]);
            for ($b = 0; $b < 8; $b++) {
                $crc = ($crc & 1) ? (($crc >> 1) ^ 0xA001) : ($crc >> 1);
            }
        }
        return $crc;
    }

    private function assertAvailable(string $d, int $pos, int $bytes): void
    {
        if ($pos + $bytes > strlen($d)) {
            throw new InvalidArgumentException('Truncated packet.');
        }
    }

    private function readUInt(string $d, int &$pos, int $bytes): int
    {
        $this->assertAvailable($d, $pos, $bytes);
        $raw  = substr($d, $pos, $bytes);
        $pos += $bytes;

        return match ($bytes) {
            1       => ord($raw),
            2       => unpack('n', $raw)[1],
            4       => unpack('N', $raw)[1],
            8       => unpack('J', $raw)[1],
            default => throw new InvalidArgumentException('Unsupported field width.'),
        };
    }

    /** Two's-complement signed read (latitude, longitude, altitude). */
    private function readSInt(string $d, int &$pos, int $bytes): int
    {
        $value = $this->readUInt($d, $pos, $bytes);
        $limit = 1 << (8 * $bytes - 1);
        return $value >= $limit ? $value - ($limit << 1) : $value;
    }

    private function packUInt(int $value, int $bytes): string
    {
        return match ($bytes) {
            1 => chr($value),
            2 => pack('n', $value),
            4 => pack('N', $value),
            8 => pack('J', $value),
        };
    }

    private function toUnsigned32(int $value): int
    {
        return $value < 0 ? $value + 0x100000000 : $value;
    }
}
