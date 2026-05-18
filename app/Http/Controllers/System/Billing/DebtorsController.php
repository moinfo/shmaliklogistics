<?php

namespace App\Http\Controllers\System\Billing;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DebtorsController extends Controller
{
    public function index(Request $request)
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

        return Inertia::render('system/Billing/Debtors/Index', [
            'debtors' => $debtors,
            'totals'  => $totals,
            'filters' => $request->only(['search', 'age']),
        ]);
    }
}
