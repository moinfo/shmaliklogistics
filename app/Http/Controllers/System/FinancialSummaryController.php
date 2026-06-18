<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Concerns\UsesDateExtract;
use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\Expense;
use App\Models\Payment;
use App\Support\ReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinancialSummaryController extends Controller
{
    use UsesDateExtract;

    public function index(Request $request)
    {
        return Inertia::render('system/Reports/FinancialSummary', $this->compute($request));
    }

    public function export(Request $request)
    {
        $d = $this->compute($request);
        $totalCosts = $d['totalExpenses'] + $d['totalMaintenance'];

        $report = [
            'title'    => 'Financial Summary',
            'subtitle' => 'Year ' . $d['year'],
            'filename' => 'financial-summary-' . $d['year'],
            'summary'  => [
                'Total Revenue (TZS)'     => $d['totalRevenue'],
                'Total Expenses (TZS)'    => $d['totalExpenses'],
                'Total Maintenance (TZS)' => $d['totalMaintenance'],
                'Net Profit (TZS)'        => $d['totalProfit'],
                'Outstanding Billed (TZS)'   => $d['outstanding']->billed,
                'Outstanding Received (TZS)' => $d['outstanding']->received,
            ],
            'sections' => [
                [
                    'heading' => 'Month-by-Month',
                    'columns' => [
                        ['label' => 'Month',             'key' => 'month',  'type' => 'text'],
                        ['label' => 'Revenue (TZS)',     'key' => 'rev',    'type' => 'money'],
                        ['label' => 'Expenses (TZS)',    'key' => 'exp',    'type' => 'money'],
                        ['label' => 'Maintenance (TZS)', 'key' => 'mnt',    'type' => 'money'],
                        ['label' => 'Total Costs (TZS)', 'key' => 'cost',   'type' => 'money'],
                        ['label' => 'Profit (TZS)',      'key' => 'profit', 'type' => 'money'],
                        ['label' => 'Margin %',          'key' => 'margin', 'type' => 'percent'],
                    ],
                    'rows' => collect($d['months'])->map(fn ($m) => [
                        'month'  => self::monthName((int) $m['month']),
                        'rev'    => $m['revenue'],
                        'exp'    => $m['expenses'],
                        'mnt'    => $m['maintenance'],
                        'cost'   => $m['total_costs'],
                        'profit' => $m['profit'],
                        'margin' => $m['revenue'] > 0 ? round($m['profit'] / $m['revenue'] * 100, 1) : 0,
                    ])->all(),
                ],
                [
                    'heading' => 'Expenses by Category',
                    'columns' => [
                        ['label' => 'Category',     'key' => 'cat',   'type' => 'text'],
                        ['label' => 'Total (TZS)',  'key' => 'total', 'type' => 'money'],
                    ],
                    'rows' => collect($d['expenseByCategory'])->map(fn ($c) => [
                        'cat'   => $c->category ?: 'Uncategorised',
                        'total' => $c->total,
                    ])->all(),
                ],
            ],
        ];

        return $request->get('format') === 'excel'
            ? ReportExport::xlsx($report)
            : ReportExport::pdf($report);
    }

    private static function monthName(int $m): string
    {
        return $m >= 1 && $m <= 12
            ? \Carbon\Carbon::create(null, $m, 1)->format('F')
            : (string) $m;
    }

    private function compute(Request $request): array
    {
        $year  = $request->get('year', now()->year);
        $month = $request->get('month', '');

        // Monthly revenue from paid/partial invoices
        $revenueQuery = Payment::whereYear('payment_date', $year);
        if ($month) $revenueQuery->whereMonth('payment_date', $month);

        $monthlyRevenue = (clone $revenueQuery)
            ->selectRaw("{$this->monthExpr('payment_date')} as month, SUM(amount) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        // Monthly expenses (TZS only)
        $expenseQuery = Expense::where('currency', 'TZS')->whereYear('expense_date', $year);
        if ($month) $expenseQuery->whereMonth('expense_date', $month);

        $monthlyExpenses = (clone $expenseQuery)
            ->selectRaw("{$this->monthExpr('expense_date')} as month, SUM(amount) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        // Maintenance costs (TZS)
        $maintenanceCosts = DB::table('service_records')
            ->where('currency', 'TZS')
            ->whereYear('service_date', $year)
            ->when($month, fn ($q) => $q->whereMonth('service_date', $month))
            ->selectRaw("{$this->monthExpr('service_date')} as month, SUM(cost) as total")
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        // Build 12-month summary
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $rev  = $monthlyRevenue[$m]->total ?? 0;
            $exp  = $monthlyExpenses[$m]->total ?? 0;
            $mnt  = $maintenanceCosts[$m]->total ?? 0;
            $months[] = [
                'month'       => $m,
                'revenue'     => (float) $rev,
                'expenses'    => (float) $exp,
                'maintenance' => (float) $mnt,
                'total_costs' => (float) $exp + (float) $mnt,
                'profit'      => (float) $rev - (float) $exp - (float) $mnt,
            ];
        }

        // Year totals
        $totalRevenue     = array_sum(array_column($months, 'revenue'));
        $totalExpenses    = array_sum(array_column($months, 'expenses'));
        $totalMaintenance = array_sum(array_column($months, 'maintenance'));
        $totalProfit      = $totalRevenue - $totalExpenses - $totalMaintenance;

        // Expenses by category (TZS)
        $expenseByCategory = Expense::where('currency', 'TZS')
            ->whereYear('expense_date', $year)
            ->when($month, fn ($q) => $q->whereMonth('expense_date', $month))
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->get();

        // Outstanding invoices
        $outstandingIds = BillingDocument::where('type', 'invoice')
            ->whereIn('status', ['sent', 'partial'])
            ->pluck('id');

        $outstanding = (object) [
            'billed'   => BillingDocument::whereIn('id', $outstandingIds)->sum('total'),
            'received' => Payment::whereIn('billing_document_id', $outstandingIds)->sum('amount'),
        ];

        $availableYears = Payment::selectRaw("{$this->yearExpr('payment_date')} as year")
            ->groupBy('year')
            ->orderByDesc('year')
            ->pluck('year');

        return [
            'months'           => $months,
            'totalRevenue'     => $totalRevenue,
            'totalExpenses'    => $totalExpenses,
            'totalMaintenance' => $totalMaintenance,
            'totalProfit'      => $totalProfit,
            'expenseByCategory' => $expenseByCategory,
            'outstanding'      => $outstanding,
            'year'             => (int) $year,
            'month'            => $month,
            'availableYears'   => $availableYears,
        ];
    }
}
