<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Expense;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        // 1. Total Sales
        $totalSales = (float)Invoice::sum('total_amount');
        $thisMonthSales = (float)Invoice::where('date', '>=', $currentMonth)->sum('total_amount');
        $lastMonthSales = (float)Invoice::whereBetween('date', [$lastMonth, $currentMonth->copy()->subSecond()])->sum('total_amount');
        $salesTrend = $this->calculateTrend($thisMonthSales, $lastMonthSales);

        // 2. Paid Invoices
        $paidSales = (float)Invoice::where('status', 'Paid')->sum('total_amount');
        $thisMonthPaid = (float)Invoice::where('status', 'Paid')->where('date', '>=', $currentMonth)->sum('total_amount');
        $lastMonthPaid = (float)Invoice::where('status', 'Paid')->whereBetween('date', [$lastMonth, $currentMonth->copy()->subSecond()])->sum('total_amount');
        $paidTrend = $this->calculateTrend($thisMonthPaid, $lastMonthPaid);

        // 3. Unpaid Invoices
        $unpaidSales = (float)Invoice::where('status', 'Unpaid')->sum('total_amount');
        $thisMonthUnpaid = (float)Invoice::where('status', 'Unpaid')->where('date', '>=', $currentMonth)->sum('total_amount');
        $lastMonthUnpaid = (float)Invoice::where('status', 'Unpaid')->whereBetween('date', [$lastMonth, $currentMonth->copy()->subSecond()])->sum('total_amount');
        $unpaidTrend = $this->calculateTrend($thisMonthUnpaid, $lastMonthUnpaid, true);

        // 4. Overdue Invoices
        $overdueSales = (float)Invoice::where('status', 'Overdue')->sum('total_amount');
        $thisMonthOverdue = (float)Invoice::where('status', 'Overdue')->where('date', '>=', $currentMonth)->sum('total_amount');
        $lastMonthOverdue = (float)Invoice::where('status', 'Overdue')->whereBetween('date', [$lastMonth, $currentMonth->copy()->subSecond()])->sum('total_amount');
        $overdueTrend = $this->calculateTrend($thisMonthOverdue, $lastMonthOverdue, true);

        // Sales overview chart data (last 7 days)
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayName = $date->format('D');
            $sales = Invoice::whereDate('date', $date->toDateString())->sum('total_amount');
            $chartData[] = ['day' => $dayName, 'value' => (float)$sales];
        }

        // Recent Invoices
        $recentInvoices = Invoice::with('customer')->latest()->take(10)->get();

        // Low stock products
        $lowStockProducts = Product::where('stock', '<', 10)->where('status', '!=', 'Out of Stock')->take(5)->get();

        return response()->json([
            'stats' => [
                ['label' => 'Total Sales', 'value' => $totalSales, 'trend' => $salesTrend, 'type' => 'sales'],
                ['label' => 'Paid Invoices', 'value' => $paidSales, 'trend' => $paidTrend, 'type' => 'paid'],
                ['label' => 'Unpaid Invoices', 'value' => $unpaidSales, 'trend' => $unpaidTrend, 'type' => 'unpaid'],
                ['label' => 'Overdue', 'value' => $overdueSales, 'trend' => $overdueTrend, 'type' => 'overdue'],
            ],
            'summary' => [
                'outstanding' => $unpaidSales + $overdueSales,
                'collected' => $paidSales,
            ],
            'salesChart' => $chartData,
            'recentInvoices' => $recentInvoices,
            'lowStockProducts' => $lowStockProducts
        ]);
    }

    private function calculateTrend($current, $previous, $inverse = false)
    {
        if ($previous == 0) {
            return $current > 0 ? '+ 100%' : '0%';
        }

        $percentage = (($current - $previous) / $previous) * 100;
        $prefix = $percentage >= 0 ? '+ ' : '- ';
        $value = abs(round($percentage, 1)) . '%';
        
        return $prefix . $value;
    }
}
