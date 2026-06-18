<?php

namespace App\Http\Controllers\System\Billing;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\Client;
use App\Support\ReportExport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DebtorsController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('system/Billing/Debtors/Index', $this->compute($request));
    }

    public function export(Request $request)
    {
        $d = $this->compute($request);
        $debtors = collect($d['debtors']);

        // Flatten every invoice across all clients for the detail section.
        $detailRows = $debtors->flatMap(function ($client) {
            return collect($client['invoices'])->map(fn ($inv) => [
                'client'  => $client['client_company'] ?: $client['client_name'],
                'invoice' => $inv['document_number'],
                'issued'  => $inv['issue_date'],
                'due'     => $inv['due_date'],
                'trip'    => $inv['trip_number'] ?: '—',
                'total'   => $inv['total'],
                'paid'    => $inv['amount_paid'],
                'balance' => $inv['balance_due'],
                'age'     => $inv['days_overdue'],
            ]);
        })->all();

        $report = [
            'title'    => 'Debtors — Outstanding Accounts Receivable',
            'subtitle' => 'As at ' . now()->format('d M Y'),
            'filename' => 'debtors-' . now()->format('Y-m-d'),
            'summary'  => [
                'Total Outstanding AR (TZS)' => $d['totals']['total_ar'],
                'Number of Debtors'          => $d['totals']['debtor_count'],
                '1–30 days (TZS)'            => $d['totals']['overdue_30'],
                '31–60 days (TZS)'          => $d['totals']['overdue_60'],
                '61–90 days (TZS)'          => $d['totals']['overdue_90'],
                'Over 90 days (TZS)'        => $d['totals']['overdue_90p'],
            ],
            'sections' => [
                [
                    'heading' => 'By Client',
                    'columns' => [
                        ['label' => 'Client',          'key' => 'client',   'type' => 'text'],
                        ['label' => 'Invoices',        'key' => 'count',    'type' => 'int'],
                        ['label' => 'Invoiced (TZS)',  'key' => 'invoiced', 'type' => 'money'],
                        ['label' => 'Paid (TZS)',      'key' => 'paid',     'type' => 'money'],
                        ['label' => 'Balance Due (TZS)','key' => 'balance', 'type' => 'money'],
                        ['label' => 'Max Days Overdue','key' => 'max_days', 'type' => 'int'],
                    ],
                    'rows' => $debtors->map(fn ($c) => [
                        'client'   => $c['client_company'] ?: $c['client_name'],
                        'count'    => count($c['invoices']),
                        'invoiced' => $c['total_invoiced'],
                        'paid'     => $c['total_paid'],
                        'balance'  => $c['balance_due'],
                        'max_days' => $c['max_days'],
                    ])->all(),
                ],
                [
                    'heading' => 'Invoice Detail',
                    'columns' => [
                        ['label' => 'Client',        'key' => 'client',  'type' => 'text'],
                        ['label' => 'Invoice #',     'key' => 'invoice', 'type' => 'text'],
                        ['label' => 'Issued',        'key' => 'issued',  'type' => 'text'],
                        ['label' => 'Due',           'key' => 'due',     'type' => 'text'],
                        ['label' => 'Trip #',        'key' => 'trip',    'type' => 'text'],
                        ['label' => 'Total (TZS)',   'key' => 'total',   'type' => 'money'],
                        ['label' => 'Paid (TZS)',    'key' => 'paid',    'type' => 'money'],
                        ['label' => 'Balance (TZS)', 'key' => 'balance', 'type' => 'money'],
                        ['label' => 'Age (days)',    'key' => 'age',     'type' => 'int'],
                    ],
                    'rows' => $detailRows,
                ],
            ],
        ];

        return $request->get('format') === 'excel'
            ? ReportExport::xlsx($report)
            : ReportExport::pdf($report);
    }

    private function compute(Request $request): array
    {
        $search  = $request->input('search', '');
        $ageBand = $request->input('age', '');   // '30', '60', '90', '90+'

        // Load all unpaid/partial invoices with their payments
        $query = BillingDocument::with(['client', 'payments', 'trip'])
            ->where('type', 'invoice')
            ->whereNotIn('status', ['paid', 'cancelled', 'draft'])
            ->orderBy('due_date');

        if ($search) {
            $query->whereHas('client', fn ($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('company_name', 'like', "%{$search}%")
            );
        }

        $invoices = $query->get()->map(function ($inv) {
            $paid       = (float) $inv->payments->sum('amount');
            $balance    = (float) $inv->total - $paid;
            $daysOverdue = $inv->due_date ? now()->diffInDays($inv->due_date, false) * -1 : 0;

            return [
                'id'             => $inv->id,
                'document_number'=> $inv->document_number,
                'issue_date'     => $inv->issue_date?->toDateString(),
                'due_date'       => $inv->due_date?->toDateString(),
                'currency'       => $inv->currency ?? 'TZS',
                'total'          => (float) $inv->total,
                'amount_paid'    => $paid,
                'balance_due'    => $balance,
                'days_overdue'   => max(0, (int) $daysOverdue),
                'status'         => $inv->status,
                'trip_number'    => $inv->trip?->trip_number,
                'client_id'      => $inv->client_id,
                'client_name'    => $inv->client?->name,
                'client_company' => $inv->client?->company_name,
            ];
        })->filter(fn ($r) => $r['balance_due'] > 0.01);

        // Apply age-band filter after computing days_overdue
        if ($ageBand) {
            $invoices = $invoices->filter(function ($r) use ($ageBand) {
                $d = $r['days_overdue'];
                return match($ageBand) {
                    '30'    => $d > 0  && $d <= 30,
                    '60'    => $d > 30 && $d <= 60,
                    '90'    => $d > 60 && $d <= 90,
                    '90+'   => $d > 90,
                    'future'=> $d <= 0,
                    default => true,
                };
            });
        }

        // Group by client
        $debtors = $invoices->groupBy('client_id')->map(function ($rows, $clientId) {
            $first = $rows->first();
            return [
                'client_id'      => $clientId,
                'client_name'    => $first['client_name'],
                'client_company' => $first['client_company'],
                'total_invoiced' => $rows->sum('total'),
                'total_paid'     => $rows->sum('amount_paid'),
                'balance_due'    => $rows->sum('balance_due'),
                'max_days'       => $rows->max('days_overdue'),
                'invoices'       => $rows->values(),
            ];
        })->sortByDesc('balance_due')->values();

        $totals = [
            'total_ar'      => $debtors->sum('balance_due'),
            'overdue_30'    => $invoices->where('days_overdue', '>', 0)->where('days_overdue', '<=', 30)->sum('balance_due'),
            'overdue_60'    => $invoices->where('days_overdue', '>', 30)->where('days_overdue', '<=', 60)->sum('balance_due'),
            'overdue_90'    => $invoices->where('days_overdue', '>', 60)->where('days_overdue', '<=', 90)->sum('balance_due'),
            'overdue_90p'   => $invoices->where('days_overdue', '>', 90)->sum('balance_due'),
            'debtor_count'  => $debtors->count(),
        ];

        return [
            'debtors' => $debtors,
            'totals'  => $totals,
            'filters' => $request->only(['search', 'age']),
        ];
    }
}
