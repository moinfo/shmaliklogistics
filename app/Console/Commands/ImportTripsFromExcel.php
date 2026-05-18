<?php

namespace App\Console\Commands;

use App\Models\BillingDocument;
use App\Models\Client;
use App\Models\Payment;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportTripsFromExcel extends Command
{
    protected $signature = 'trips:import
        {file : Path to the .xlsx file}
        {year : Trip year, e.g. 2026}
        {--user=1 : ID of the user to assign as created_by}
        {--dry-run : Parse and preview only, no DB writes}';

    protected $description = 'Import trips from a Trip Sheet Excel file (DEBTORS sheet)';

    public function handle(): int
    {
        $filePath = $this->argument('file');
        $year     = (int) $this->argument('year');
        $userId   = (int) $this->option('user');
        $dryRun   = $this->option('dry-run');

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return self::FAILURE;
        }

        $this->info("Reading DEBTORS sheet from: " . basename($filePath));

        $reader = IOFactory::createReader('Xlsx');
        $reader->setLoadSheetsOnly(['DEBTORS']);
        $spreadsheet = $reader->load($filePath);
        $sheet       = $spreadsheet->getSheetByName('DEBTORS') ?? $spreadsheet->getActiveSheet();

        $rows = [];
        foreach ($sheet->getRowIterator(4) as $row) {
            $c = [];
            foreach ($row->getCellIterator('B', 'X') as $cell) {
                $c[$cell->getColumn()] = $cell->getCalculatedValue();
            }

            $raw = (string) ($c['B'] ?? '');
            if (!preg_match('/^TR\d+$/i', trim($raw))) continue;

            $seq     = (int) ltrim(substr(trim($raw), 2), '0');
            $tripNum = "TRP-{$year}-" . str_pad($seq, 3, '0', STR_PAD_LEFT);

            $invUsd  = (float) ($c['G'] ?? 0);
            $rate    = (float) ($c['H'] ?? 0);
            $advUsd  = (float) ($c['K'] ?? 0);
            $finUsd  = (float) ($c['P'] ?? 0);
            $balUsd  = (float) ($c['U'] ?? 0);

            $rows[] = [
                'trip_number'    => $tripNum,
                'vehicle_plate'  => trim((string) ($c['C'] ?? '')),
                'container'      => trim((string) ($c['D'] ?? '')) ?: null,
                'destination'    => trim((string) ($c['E'] ?? '')),
                'agent'          => trim((string) ($c['F'] ?? '')),
                'invoice_usd'    => $invUsd,
                'exchange_rate'  => $rate,
                'invoice_tzs'    => $invUsd && $rate ? round($invUsd * $rate, 2) : 0,
                'advance_usd'    => $advUsd,
                'advance_tzs'    => $advUsd && $rate ? round($advUsd * $rate, 2) : 0,
                'advance_cheque' => trim((string) ($c['N'] ?? '')),
                'final_usd'      => $finUsd,
                'final_tzs'      => $finUsd && $rate ? round($finUsd * $rate, 2) : 0,
                'final_cheque'   => trim((string) ($c['S'] ?? '')),
                'balance_usd'    => $balUsd,
                'notes'          => trim((string) ($c['X'] ?? '')),
                'exists'         => Trip::where('trip_number', $tripNum)->exists(),
            ];
        }

        $total    = count($rows);
        $existing = collect($rows)->where('exists', true)->count();
        $toImport = $total - $existing;

        $this->table(
            ['Total rows', 'Already in DB', 'To import'],
            [[$total, $existing, $toImport]]
        );

        if ($dryRun) {
            $this->warn('Dry run — no changes written.');
            return self::SUCCESS;
        }

        if ($toImport === 0) {
            $this->info('Nothing to import — all trips already exist.');
            return self::SUCCESS;
        }

        if (!$this->confirm("Import {$toImport} new trips into the database?", true)) {
            return self::SUCCESS;
        }

        $imported = 0;
        $skipped  = 0;
        $bar      = $this->output->createProgressBar($toImport);
        $bar->start();

        DB::transaction(function () use ($rows, $year, $userId, &$imported, &$skipped, $bar) {
            foreach ($rows as $r) {
                if ($r['exists']) { $skipped++; continue; }
                if (Trip::where('trip_number', $r['trip_number'])->exists()) { $skipped++; continue; }

                $vehicle = Vehicle::where('plate', $r['vehicle_plate'])->first();
                $driver  = $vehicle?->driver;

                $trip = Trip::create([
                    'trip_number'      => $r['trip_number'],
                    'status'           => 'completed',
                    'route_from'       => 'Dar es Salaam',
                    'route_to'         => $r['destination'],
                    'departure_date'   => $year . '-01-01',
                    'driver_name'      => $driver?->name ?? ($r['vehicle_plate'] . ' driver'),
                    'vehicle_plate'    => $r['vehicle_plate'],
                    'driver_id'        => $driver?->id,
                    'vehicle_id'       => $vehicle?->id,
                    'container_number' => $r['container'] ?: null,
                    'freight_amount'   => $r['invoice_tzs'] ?: 0,
                    'invoice_usd'      => $r['invoice_usd'] ?: null,
                    'exchange_rate'    => $r['exchange_rate'] ?: null,
                    'invoice_tzs'      => $r['invoice_tzs'] ?: null,
                    'fuel_cost'        => 0,
                    'driver_allowance' => 0,
                    'border_costs'     => 0,
                    'other_costs'      => 0,
                    'notes'            => $r['notes'] ?: null,
                    'created_by'       => $userId,
                ]);

                $client = Client::firstOrCreate(
                    ['name' => $r['agent']],
                    ['status' => 'active', 'created_by' => $userId]
                );

                $invoice = BillingDocument::create([
                    'type'            => 'invoice',
                    'document_number' => BillingDocument::nextNumber('invoice'),
                    'client_id'       => $client->id,
                    'trip_id'         => $trip->id,
                    'status'          => $r['balance_usd'] > 0.01 ? 'partial' : 'paid',
                    'issue_date'      => $year . '-01-01',
                    'currency'        => 'TZS',
                    'subtotal'        => $r['invoice_tzs'] ?: 0,
                    'discount_amount' => 0,
                    'tax_rate'        => 0,
                    'tax_amount'      => 0,
                    'total'           => $r['invoice_tzs'] ?: 0,
                    'created_by'      => $userId,
                ]);

                $invoice->items()->create([
                    'description' => "Freight — {$r['destination']}" . ($r['container'] ? " ({$r['container']})" : ''),
                    'quantity'    => 1,
                    'unit_price'  => $r['invoice_tzs'] ?: 0,
                    'total'       => $r['invoice_tzs'] ?: 0,
                    'sort_order'  => 0,
                ]);

                if (($r['advance_usd'] ?? 0) > 0) {
                    [$chequeNo, $chequeDate] = self::parseCheque($r['advance_cheque'] ?? '');
                    Payment::create([
                        'billing_document_id' => $invoice->id,
                        'amount'              => $r['advance_tzs'],
                        'usd_amount'          => $r['advance_usd'],
                        'exchange_rate'       => $r['exchange_rate'],
                        'payment_date'        => $chequeDate ?? ($year . '-01-01'),
                        'payment_method'      => $chequeNo ? 'cheque' : 'bank_transfer',
                        'payment_stage'       => 'advance',
                        'cheque_number'       => $chequeNo,
                        'cheque_date'         => $chequeDate,
                        'created_by'          => $userId,
                    ]);
                }

                if (($r['final_usd'] ?? 0) > 0) {
                    [$chequeNo, $chequeDate] = self::parseCheque($r['final_cheque'] ?? '');
                    Payment::create([
                        'billing_document_id' => $invoice->id,
                        'amount'              => $r['final_tzs'],
                        'usd_amount'          => $r['final_usd'],
                        'exchange_rate'       => $r['exchange_rate'],
                        'payment_date'        => $chequeDate ?? ($year . '-01-01'),
                        'payment_method'      => $chequeNo ? 'cheque' : 'bank_transfer',
                        'payment_stage'       => 'final',
                        'cheque_number'       => $chequeNo,
                        'cheque_date'         => $chequeDate,
                        'created_by'          => $userId,
                    ]);
                }

                $imported++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info("Done. Imported: {$imported}  |  Skipped (already existed): {$skipped}");

        return self::SUCCESS;
    }

    private static function parseCheque(string $raw): array
    {
        if (!$raw || $raw === '0') return [null, null];
        preg_match('/^([A-Z0-9\-]+)/i', $raw, $numMatch);
        $num = $numMatch[1] ?? null;
        preg_match('/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/', $raw, $dateMatch);
        $date = null;
        if ($dateMatch) {
            $date = sprintf('%04d-%02d-%02d', $dateMatch[3], $dateMatch[2], $dateMatch[1]);
        }
        return [$num ?: null, $date];
    }
}
