<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\Client;
use App\Models\Payment;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;

class TripImportController extends Controller
{
    public function create()
    {
        return Inertia::render('system/Trips/Import');
    }

    // Parse uploaded file — return preview rows, no DB writes
    public function preview(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:20480',
            'year' => 'required|integer|min:2020|max:2030',
        ]);

        $year   = (int) $request->input('year', date('Y'));
        $path   = $request->file('file')->getRealPath();
        $reader = IOFactory::createReader('Xlsx');
        $reader->setLoadSheetsOnly(['DEBTORS']);
        $spreadsheet = $reader->load($path);
        $sheet       = $spreadsheet->getSheetByName('DEBTORS') ?? $spreadsheet->getActiveSheet();

        $rows   = [];
        $rowNum = 0;

        foreach ($sheet->getRowIterator(4) as $row) {
            $c = [];
            foreach ($row->getCellIterator('B', 'X') as $cell) {
                $c[$cell->getColumn()] = $cell->getCalculatedValue();
            }

            $raw = (string) ($c['B'] ?? '');
            // Only process rows that start with TR followed by digits
            if (!preg_match('/^TR\d+$/i', trim($raw))) continue;

            $seq     = (int) ltrim(substr(trim($raw), 2), '0');
            $tripNum = "TRP-{$year}-" . str_pad($seq, 3, '0', STR_PAD_LEFT);
            $plate     = trim((string) ($c['C'] ?? ''));
            $container = trim((string) ($c['D'] ?? '')) ?: null;
            $dest      = trim((string) ($c['E'] ?? ''));
            $agent     = trim((string) ($c['F'] ?? ''));
            $invUsd    = (float) ($c['G'] ?? 0);
            $rate      = (float) ($c['H'] ?? 0);
            $invTzs    = $invUsd && $rate ? round($invUsd * $rate, 2) : 0;
            $advUsd    = (float) ($c['K'] ?? 0);
            $advTzs    = $advUsd && $rate ? round($advUsd * $rate, 2) : 0;
            $advRaw    = trim((string) ($c['N'] ?? ''));
            $finUsd    = (float) ($c['P'] ?? 0);
            $finTzs    = $finUsd && $rate ? round($finUsd * $rate, 2) : 0;
            $finRaw    = trim((string) ($c['S'] ?? ''));
            $balUsd    = (float) ($c['U'] ?? 0);
            $notes     = trim((string) ($c['X'] ?? ''));

            $rows[] = [
                'row_num'        => ++$rowNum,
                'trip_number'    => $tripNum,
                'vehicle_plate'  => $plate,
                'container'      => $container,
                'destination'    => $dest,
                'agent'          => $agent,
                'invoice_usd'    => $invUsd,
                'exchange_rate'  => $rate,
                'invoice_tzs'    => $invTzs,
                'advance_usd'    => $advUsd,
                'advance_tzs'    => $advTzs,
                'advance_cheque' => $advRaw,
                'final_usd'      => $finUsd,
                'final_tzs'      => $finTzs,
                'final_cheque'   => $finRaw,
                'balance_usd'    => $balUsd,
                'notes'          => $notes,
                'exists'         => Trip::where('trip_number', $tripNum)->exists(),
            ];
        }

        return response()->json([
            'rows'  => $rows,
            'total' => count($rows),
            'new'   => collect($rows)->where('exists', false)->count(),
            'dupes' => collect($rows)->where('exists', true)->count(),
        ]);
    }

    // Commit confirmed rows to DB
    public function store(Request $request)
    {
        $request->validate([
            'rows'              => 'required|array|min:1',
            'rows.*.trip_number' => 'required|string',
            'rows.*.skip'        => 'boolean',
        ]);

        $imported = 0;
        $skipped  = 0;

        DB::transaction(function () use ($request, &$imported, &$skipped) {
            $userId = $request->user()->id;

            foreach ($request->rows as $r) {
                if (!empty($r['skip'])) { $skipped++; continue; }
                if (Trip::where('trip_number', $r['trip_number'])->exists()) { $skipped++; continue; }

                // Resolve vehicle + driver
                $vehicle = Vehicle::where('plate', $r['vehicle_plate'])->first();
                $driver  = $vehicle?->driver;

                // Extract year from TRP-YYYY-NNN format
                preg_match('/TRP-(\d{4})-/', $r['trip_number'], $ym);
                $tripYear = $ym[1] ?? date('Y');

                $trip = Trip::create([
                    'trip_number'      => $r['trip_number'],
                    'status'           => 'completed',
                    'route_from'       => 'Dar es Salaam',
                    'route_to'         => $r['destination'],
                    'departure_date'   => $tripYear . '-01-01',
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

                // Find or create client
                $client = Client::firstOrCreate(
                    ['name' => $r['agent']],
                    ['status' => 'active', 'created_by' => $userId]
                );

                // Create invoice
                $invNum = BillingDocument::nextNumber('invoice');
                $invoice = BillingDocument::create([
                    'type'            => 'invoice',
                    'document_number' => $invNum,
                    'client_id'       => $client->id,
                    'trip_id'         => $trip->id,
                    'status'          => $r['balance_usd'] > 0.01 ? 'partial' : 'paid',
                    'issue_date'      => $tripYear . '-01-01',
                    'currency'        => 'TZS',
                    'subtotal'        => $r['invoice_tzs'] ?: 0,
                    'discount_amount' => 0,
                    'tax_rate'        => 0,
                    'tax_amount'      => 0,
                    'total'           => $r['invoice_tzs'] ?: 0,
                    'created_by'      => $userId,
                ]);

                // Add one line item
                $invoice->items()->create([
                    'description' => "Freight — {$r['destination']}" . ($r['container'] ? " ({$r['container']})" : ''),
                    'quantity'    => 1,
                    'unit_price'  => $r['invoice_tzs'] ?: 0,
                    'total'       => $r['invoice_tzs'] ?: 0,
                    'sort_order'  => 0,
                ]);

                // Record advance payment
                if (($r['advance_usd'] ?? 0) > 0) {
                    [$chequeNo, $chequeDate] = self::parseCheque($r['advance_cheque'] ?? '');
                    Payment::create([
                        'billing_document_id' => $invoice->id,
                        'amount'              => $r['advance_tzs'],
                        'usd_amount'          => $r['advance_usd'],
                        'exchange_rate'       => $r['exchange_rate'],
                        'payment_date'        => $chequeDate ?? ($tripYear . '-01-01'),
                        'payment_method'      => $chequeNo ? 'cheque' : 'bank_transfer',
                        'payment_stage'       => 'advance',
                        'cheque_number'       => $chequeNo,
                        'cheque_date'         => $chequeDate,
                        'created_by'          => $userId,
                    ]);
                }

                // Record final payment
                if (($r['final_usd'] ?? 0) > 0) {
                    [$chequeNo, $chequeDate] = self::parseCheque($r['final_cheque'] ?? '');
                    Payment::create([
                        'billing_document_id' => $invoice->id,
                        'amount'              => $r['final_tzs'],
                        'usd_amount'          => $r['final_usd'],
                        'exchange_rate'       => $r['exchange_rate'],
                        'payment_date'        => $chequeDate ?? ($tripYear . '-01-01'),
                        'payment_method'      => $chequeNo ? 'cheque' : 'bank_transfer',
                        'payment_stage'       => 'final',
                        'cheque_number'       => $chequeNo,
                        'cheque_date'         => $chequeDate,
                        'created_by'          => $userId,
                    ]);
                }

                $imported++;
            }
        });

        return back()->with('success', "Imported {$imported} trips. Skipped {$skipped}.");
    }

    // Parse "873860, DTD 13/01/2026" → [cheque_no, date_string]
    private static function parseCheque(string $raw): array
    {
        if (!$raw || $raw === '0') return [null, null];
        // Extract cheque number (digits at the start)
        preg_match('/^([A-Z0-9\-]+)/i', $raw, $numMatch);
        $num = $numMatch[1] ?? null;
        // Extract date: DD/MM/YYYY
        preg_match('/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/', $raw, $dateMatch);
        $date = null;
        if ($dateMatch) {
            $date = sprintf('%04d-%02d-%02d', $dateMatch[3], $dateMatch[2], $dateMatch[1]);
        }
        return [$num ?: null, $date];
    }
}
