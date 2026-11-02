<?php

namespace Tests\Unit;

use App\Services\TeltonikaService;
use Carbon\Carbon;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class TeltonikaServiceTest extends TestCase
{
    private TeltonikaService $codec;

    protected function setUp(): void
    {
        $this->codec = new TeltonikaService();
    }

    /** Codec 8 example packet from the Teltonika wiki — an independent check of CRC and field offsets. */
    public function test_decodes_teltonika_documented_codec8_sample(): void
    {
        $hex = '000000000000003608010000016B40D8EA30010000000000000000000000000000000105021503010101425E0F01F10000601A014E0000000000000000010000C7CF';

        $packet = $this->codec->decodePacket(hex2bin($hex));

        $this->assertSame(TeltonikaService::CODEC_8, $packet['codec']);
        $this->assertCount(1, $packet['records']);

        $r = $packet['records'][0];
        $this->assertSame('2019-06-10 10:04:46', $r['timestamp']->format('Y-m-d H:i:s'));
        $this->assertSame(0, $r['satellites']);
        $this->assertSame([21 => 3, 1 => 1, 66 => 24079, 241 => 24602, 78 => 0], $r['io']);
    }

    public function test_round_trip_codec_8_and_8e_keeps_southern_hemisphere_coordinates(): void
    {
        foreach ([TeltonikaService::CODEC_8, TeltonikaService::CODEC_8E] as $codecId) {
            $frame = $this->codec->encodePacket($codecId, [
                [
                    'timestamp' => Carbon::parse('2026-10-30 08:15:00', 'UTC'),
                    'latitude'  => -6.8235123, 'longitude' => 39.2695321,
                    'altitude'  => -12, 'heading' => 315, 'satellites' => 11, 'speed' => 87,
                    'io'        => [239 => 1, 240 => 1, 66 => 24100, 16 => 5000000000],
                ],
                [
                    'timestamp' => Carbon::parse('2026-10-30 08:15:30', 'UTC'),
                    'latitude'  => -6.8300000, 'longitude' => 39.2600000,
                    'satellites' => 9,
                ],
            ]);

            $packet = $this->codec->decodePacket($frame);

            $this->assertSame($codecId, $packet['codec']);
            $this->assertCount(2, $packet['records']);

            $a = $packet['records'][0];
            $this->assertEqualsWithDelta(-6.8235123, $a['latitude'], 1e-7);
            $this->assertEqualsWithDelta(39.2695321, $a['longitude'], 1e-7);
            $this->assertSame(-12, $a['altitude']);
            $this->assertSame(87, $a['speed']);
            $this->assertSame(315, $a['heading']);
            $this->assertSame('2026-10-30 08:15:00', $a['timestamp']->format('Y-m-d H:i:s'));
            $this->assertSame([239 => 1, 240 => 1, 66 => 24100, 16 => 5000000000], $a['io']);
        }
    }

    public function test_rejects_corrupted_crc(): void
    {
        $frame = $this->codec->encodePacket(TeltonikaService::CODEC_8E, [
            ['timestamp' => Carbon::now('UTC'), 'latitude' => -6.8, 'longitude' => 39.2, 'satellites' => 8],
        ]);
        $frame[20] = chr(ord($frame[20]) ^ 0xFF);

        $this->expectException(InvalidArgumentException::class);
        $this->codec->decodePacket($frame);
    }

    public function test_frame_length_waits_for_the_whole_packet(): void
    {
        $frame = $this->codec->encodePacket(TeltonikaService::CODEC_8, [
            ['timestamp' => Carbon::now('UTC'), 'latitude' => -6.8, 'longitude' => 39.2, 'satellites' => 8],
        ]);

        $this->assertNull($this->codec->packetFrameLength(substr($frame, 0, 5)));
        $this->assertNull($this->codec->packetFrameLength(substr($frame, 0, -1)));
        $this->assertSame(strlen($frame), $this->codec->packetFrameLength($frame . 'trailing'));
    }

    public function test_imei_handshake(): void
    {
        $imei  = '353742373301795';
        $frame = pack('n', strlen($imei)) . $imei;

        $this->assertNull($this->codec->imeiFrameLength("\x00"));
        $this->assertNull($this->codec->imeiFrameLength(substr($frame, 0, 6)));
        $this->assertSame(17, $this->codec->imeiFrameLength($frame));
        $this->assertSame($imei, $this->codec->parseImei($frame));
    }

    public function test_garbage_is_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->codec->packetFrameLength("GET / HTTP/1.1\r\n");
    }

    public function test_ack_is_big_endian_record_count(): void
    {
        $this->assertSame("\x00\x00\x00\x05", $this->codec->ack(5));
    }
}
