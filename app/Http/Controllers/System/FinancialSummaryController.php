<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Concerns\UsesDateExtract;
use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\Expense;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinancialSummaryController extends Controller
{
    use UsesDateExtract;
    public function index(Request $request)
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

        return Inertia::render('system/Reports/FinancialSummary', [
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
        ]);
    }
}
