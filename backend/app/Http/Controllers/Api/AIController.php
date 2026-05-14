<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Expense;
use App\Models\Product;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AIController extends Controller
{
    public function query(Request $request)
    {
        $query = strtolower($request->input('query', ''));
        $response = [
            'text' => "I'm not sure I understand that yet. I can help you with sales trends, expense analysis, and inventory summaries.",
            'chartType' => null,
            'chartData' => null
        ];

        if (str_contains($query, 'sale') || str_contains($query, 'chart') || str_contains($query, 'revenue') || str_contains($query, 'income')) {
            $response = $this->getSalesTrends();
        } elseif (str_contains($query, 'expense') || str_contains($query, 'spend') || str_contains($query, 'cost')) {
            $response = $this->getExpenseAnalysis();
        } elseif (str_contains($query, 'unpaid') || str_contains($query, 'due') || str_contains($query, 'pending')) {
            $response = $this->getUnpaidSummary();
        } elseif (str_contains($query, 'stock') || str_contains($query, 'inventory') || str_contains($query, 'product')) {
            $response = $this->getInventorySummary();
        } elseif (str_contains($query, 'customer') || str_contains($query, 'client')) {
            $response = $this->getTopCustomers();
        } elseif (str_contains($query, 'profit') || str_contains($query, 'earning') || str_contains($query, 'growth')) {
            $response = $this->getProfitabilityAnalysis();
        } elseif (str_contains($query, 'top product') || str_contains($query, 'best seller')) {
            $response = $this->getTopProducts();
        }

        return response()->json($response);
    }

    private function getSalesTrends()
    {
        // Get last 6 months sales
        $labels = [];
        $data = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $labels[] = $date->format('M');
            $sales = Invoice::whereYear('date', $date->year)
                           ->whereMonth('date', $date->month)
                           ->sum('total_amount');
            $data[] = (float)$sales;
        }

        $totalSales = array_sum($data);
        $avgSales = $totalSales / 6;

        return [
            'text' => "Over the last 6 months, you've generated ₹" . number_format($totalSales) . " in total sales. Your best performing month was " . $labels[array_search(max($data), $data)] . " with ₹" . number_format(max($data)) . ".",
            'chartType' => 'line',
            'chartData' => [
                'labels' => $labels,
                'datasets' => [['data' => $data]]
            ]
        ];
    }

    private function getExpenseAnalysis()
    {
        // Get expenses grouped by category
        $expenses = Expense::select('category', DB::raw('SUM(amount) as total'))
                          ->groupBy('category')
                          ->orderBy('total', 'desc')
                          ->take(5)
                          ->get();

        if ($expenses->isEmpty()) {
            return ['text' => "You haven't recorded any expenses yet. tracking your costs will help me analyze your spending patterns!", 'chartType' => null, 'chartData' => null];
        }

        $labels = $expenses->pluck('category')->toArray();
        $data = $expenses->pluck('total')->map(fn($v) => (float)$v)->toArray();
        $topCategory = $expenses->first()->category;

        return [
            'text' => "Your highest expense category is '$topCategory'. Total spending across top categories is ₹" . number_format(array_sum($data)) . ".",
            'chartType' => 'bar',
            'chartData' => [
                'labels' => $labels,
                'datasets' => [['data' => $data]]
            ]
        ];
    }

    private function getTopCustomers()
    {
        $customers = Invoice::select('customer_id', DB::raw('SUM(total_amount) as total'))
                           ->with('customer')
                           ->groupBy('customer_id')
                           ->orderBy('total', 'desc')
                           ->take(5)
                           ->get();

        if ($customers->isEmpty()) {
            return ['text' => "I couldn't find any customer data yet. Start creating invoices to see your top clients!", 'chartType' => null, 'chartData' => null];
        }

        $labels = $customers->map(fn($c) => $c->customer->name ?? 'Walk-in')->toArray();
        $data = $customers->pluck('total')->map(fn($v) => (float)$v)->toArray();

        return [
            'text' => "Your most valuable customer is " . $labels[0] . ", who has contributed ₹" . number_format($data[0]) . " to your revenue.",
            'chartType' => 'bar',
            'chartData' => [
                'labels' => $labels,
                'datasets' => [['data' => $data]]
            ]
        ];
    }

    private function getProfitabilityAnalysis()
    {
        $sales = Invoice::sum('total_amount');
        $expenses = Expense::sum('amount');
        $profit = $sales - $expenses;
        $margin = $sales > 0 ? ($profit / $sales) * 100 : 0;

        return [
            'text' => "Your net profit is ₹" . number_format($profit) . " from a total revenue of ₹" . number_format($sales) . ". This gives you a profit margin of " . round($margin, 1) . "%.",
            'chartType' => 'bar',
            'chartData' => [
                'labels' => ['Revenue', 'Expense', 'Profit'],
                'datasets' => [['data' => [(float)$sales, (float)$expenses, (float)$profit]]]
            ]
        ];
    }

    private function getTopProducts()
    {
        // This would ideally join with an InvoiceItems table if it exists.
        // For now, let's look at stock value or a placeholder if items aren't tracked separately.
        $products = Product::orderBy('stock', 'desc')->take(5)->get();
        
        $labels = $products->pluck('name')->toArray();
        $data = $products->pluck('stock')->map(fn($v) => (float)$v)->toArray();

        return [
            'text' => "Currently, " . $products[0]->name . " is your highest stock item. Would you like me to analyze your sales volume per product instead?",
            'chartType' => 'bar',
            'chartData' => [
                'labels' => $labels,
                'datasets' => [['data' => $data]]
            ]
        ];
    }

    private function getUnpaidSummary()
    {
        $unpaidCount = Invoice::where('status', 'Unpaid')->count();
        $unpaidAmount = Invoice::where('status', 'Unpaid')->sum('total_amount');
        $overdueCount = Invoice::where('status', 'Overdue')->count();
        $overdueAmount = Invoice::where('status', 'Overdue')->sum('total_amount');

        if ($unpaidCount == 0 && $overdueCount == 0) {
            return ['text' => "Excellent! You have no unpaid or overdue invoices at the moment.", 'chartType' => null, 'chartData' => null];
        }

        return [
            'text' => "You have $unpaidCount unpaid invoices (₹" . number_format($unpaidAmount) . ") and $overdueCount overdue invoices (₹" . number_format($overdueAmount) . "). I recommend sending payment reminders to these customers.",
            'chartType' => 'bar',
            'chartData' => [
                'labels' => ['Unpaid', 'Overdue'],
                'datasets' => [['data' => [(float)$unpaidAmount, (float)$overdueAmount]]]
            ]
        ];
    }

    private function getInventorySummary()
    {
        $lowStock = Product::where('stock', '<', 10)->count();
        $outOfStock = Product::where('stock', '<=', 0)->count();
        $totalProducts = Product::count();

        if ($lowStock == 0 && $outOfStock == 0) {
            return ['text' => "Your inventory looks healthy! All $totalProducts products are well stocked.", 'chartType' => null, 'chartData' => null];
        }

        return [
            'text' => "Inventory Alert: $outOfStock products are out of stock and $lowStock products are running low. Would you like a detailed list to reorder?",
            'chartType' => 'bar',
            'chartData' => [
                'labels' => ['Out', 'Low', 'Total'],
                'datasets' => [['data' => [(float)$outOfStock, (float)$lowStock, (float)$totalProducts]]]
            ]
        ];
    }
}
