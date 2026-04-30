<?php

namespace App\Services;

/**
 * Minimal ZKTeco ZKP protocol client over TCP.
 * Tested against F-series, K-series, and uFace devices.
 */
class ZKTecoService
{
    private $socket = null;
    private int $sessionId = 0;
    private int $replyId   = 0;

    private const CMD_CONNECT      = 1000;
    private const CMD_DISCONNECT   = 1001;
    private const CMD_ACK_OK       = 2000;
    private const CMD_ACK_ERROR    = 2001;
    private const CMD_PREPARE_DATA = 20;
    private const CMD_DATA         = 21;
    private const CMD_FREE_DATA    = 22;
    private const CMD_GET_ATT_LOG  = 13;
    private const CMD_ENABLE_DEVICE  = 1007;
    private const CMD_DISABLE_DEVICE = 1006;

    public function connect(string $host, int $port = 4370, int $timeout = 10): bool
    {
        $this->socket = @fsockopen($host, $port, $errno, $errstr, $timeout);
        if (! $this->socket) {
            return false;
        }
        stream_set_timeout($this->socket, $timeout);

        $resp = $this->sendCommand(self::CMD_CONNECT);
        if (! $resp) {
            return false;
        }

        $hdr = unpack('vcmd/vchecksum/vsession/vreply', substr($resp, 0, 8));
        if (($hdr['cmd'] ?? 0) !== self::CMD_ACK_OK) {
            return false;
        }
        $this->sessionId = $hdr['session'];

        return true;
    }

    public function getAttendanceLogs(): array
    {
        $resp = $this->sendCommand(self::CMD_GET_ATT_LOG);
        if (! $resp) {
            return [];
        }

        $cmd  = unpack('v', substr($resp, 0, 2))[1];
        $rawData = '';

        if ($cmd === self::CMD_PREPARE_DATA) {
            // Multi-packet transfer
            $totalSize = unpack('V', substr($resp, 8, 4))[1] ?? 0;
            while (strlen($rawData) < $totalSize) {
                $chunk = $this->readResponse();
                if (! $chunk) break;
                $chunkCmd = unpack('v', substr($chunk, 0, 2))[1];
                if ($chunkCmd !== self::CMD_DATA) break;
                $rawData .= substr($chunk, 8);
            }
            $this->sendCommand(self::CMD_FREE_DATA);
        } else {
            // Inline data (small log sets)
            $rawData = substr($resp, 8);
        }

        return $this->parseAttendanceLogs($rawData);
    }

    public function disconnect(): void
    {
        if ($this->socket) {
            $this->sendCommand(self::CMD_DISCONNECT);
            fclose($this->socket);
            $this->socket = null;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    private function sendCommand(int $cmd, string $data = ''): ?string
    {
        if (! $this->socket) return null;
        $packet = $this->buildPacket($cmd, $data);
        fwrite($this->socket, $packet);
        return $this->readResponse();
    }

    private function buildPacket(int $cmd, string $data = ''): string
    {
        $this->replyId++;

        // 8-byte header (without length prefix)
        $buf  = pack('v', $cmd);
        $buf .= "\x00\x00";           // checksum placeholder at bytes [2,3]
        $buf .= pack('v', $this->sessionId);
        $buf .= pack('v', $this->replyId);
        $buf .= $data;

        // Compute checksum over header+data (16-bit word sum)
        $sum = 0;
        $padded = (strlen($buf) % 2 !== 0) ? $buf . "\x00" : $buf;
        for ($i = 0; $i < strlen($padded); $i += 2) {
            $sum += unpack('v', substr($padded, $i, 2))[1];
        }
        $sum = ($sum & 0xFFFF) + ($sum >> 16);
        $sum = (~$sum) & 0xFFFF;

        $buf[2] = chr($sum & 0xFF);
        $buf[3] = chr(($sum >> 8) & 0xFF);

        // Prepend 4-byte little-endian total length (header + data)
        return pack('V', strlen($buf)) . $buf;
    }

    private function readResponse(): ?string
    {
        if (! $this->socket) return null;

        // Read 4-byte length prefix
        $lenBuf = '';
        while (strlen($lenBuf) < 4) {
            $chunk = fread($this->socket, 4 - strlen($lenBuf));
            if ($chunk === false || $chunk === '') return null;
            $lenBuf .= $chunk;
        }
        $bodyLen = unpack('V', $lenBuf)[1];
        if ($bodyLen === 0 || $bodyLen > 1024 * 1024) return null;

        // Read body
        $body = '';
        while (strlen($body) < $bodyLen) {
            $chunk = fread($this->socket, $bodyLen - strlen($body));
            if ($chunk === false || $chunk === '') break;
            $body .= $chunk;
        }

        return $body;
    }

    /**
     * Each attendance record is 40 bytes:
     * [4 user_id][4 encode_time][4 status][4 verify][24 padding]
     *
     * encode_time bit layout (packed DWORD):
     *   [31:25] year-2000  [24:21] month  [20:17] day
     *   [16:12] hour       [11:6]  minute  [5:0]  second
     */
    private function parseAttendanceLogs(string $rawData): array
    {
        $logs   = [];
        $recLen = 40;
        $count  = intdiv(strlen($rawData), $recLen);

        for ($i = 0; $i < $count; $i++) {
            $record = substr($rawData, $i * $recLen, $recLen);
            if (strlen($record) < 8) continue;

            ['uid' => $uid, 'et' => $et, 'status' => $status] = unpack('Vuid/Vet/Vstatus', substr($record, 0, 12));

            if ($uid === 0) continue;

            $year   = 2000 + (($et >> 25) & 0x7F);
            $month  = ($et >> 21) & 0x0F;
            $day    = ($et >> 17) & 0x1F;
            $hour   = ($et >> 12) & 0x1F;
            $minute = ($et >> 6)  & 0x3F;
            $second = $et         & 0x3F;

            if ($month < 1 || $month > 12 || $day < 1 || $day > 31) continue;

            $logs[] = [
                'device_user_id' => (string) $uid,
                'punch_time'     => sprintf('%04d-%02d-%02d %02d:%02d:%02d', $year, $month, $day, $hour, $minute, $second),
                'punch_type'     => ($status === 1) ? 'out' : 'in',
                'verify_type'    => $this->verifyTypeLabel($status),
            ];
        }

        return $logs;
    }

    private function verifyTypeLabel(int $status): string
    {
        return match ($status) {
            1  => 'fingerprint',
            4  => 'card',
            15 => 'face',
            default => 'unknown',
        };
    }
}
