<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index()
    {
        $outputGst = Invoice::sum('cgst') + Invoice::sum('sgst') + Invoice::sum('igst');
        $inputGst = Expense::sum('tax_amount');

        $gstData = [
            ['name' => 'CGST', 'value' => (float)Invoice::sum('cgst'), 'color' => '#3b82f6'],
            ['name' => 'SGST', 'value' => (float)Invoice::sum('sgst'), 'color' => '#10b981'],
            ['name' => 'IGST', 'value' => (float)Invoice::sum('igst'), 'color' => '#f59e0b'],
        ];

        // Monthly Sales Trend (Last 6 months)
        $monthlySales = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = \Carbon\Carbon::now()->subMonths($i);
            $sales = Invoice::whereYear('date', $month->year)
                           ->whereMonth('date', $month->month)
                           ->sum('total_amount');
            $monthlySales[] = [
                'month' => $month->format('M'),
                'value' => (float)$sales
            ];
        }

        // Expense Categories
        $expenseCategories = Expense::select('category', DB::raw('SUM(amount) as total'))
                                   ->groupBy('category')
                                   ->get()
                                   ->map(function($item) {
                                       return [
                                           'name' => $item->category,
                                           'value' => (float)$item->total
                                       ];
                                   });

        // Sales by Customer
        $salesByCustomer = Invoice::join('customers', 'invoices.customer_id', '=', 'customers.id')
                                 ->select('customers.name', DB::raw('SUM(invoices.total_amount) as total'))
                                 ->groupBy('customers.name')
                                 ->orderBy('total', 'desc')
                                 ->take(5)
                                 ->get()
                                 ->map(function($item) {
                                     return [
                                         'name' => $item->name ?: 'Unknown',
                                         'value' => (float)$item->total
                                     ];
                                 });

        $summary = [
            'totalInvoices' => Invoice::count(),
            'taxableValue' => (float)Invoice::sum('taxable_amount'),
            'totalLiability' => (float)$outputGst,
            'inputTaxCredit' => (float)$inputGst,
            'netPayable' => (float)($outputGst - $inputGst),
        ];

        return response()->json([
            'outputGst' => $outputGst,
            'inputGst' => $inputGst,
            'gstData' => $gstData,
            'monthlySales' => $monthlySales,
            'expenseCategories' => $expenseCategories,
            'salesByCustomer' => $salesByCustomer,
            'summary' => $summary
        ]);
    }

    public function export(Request $request)
    {
        // In a real app, you'd use a PDF library like DomPDF or Snappy
        // For now, we'll return a formatted HTML that looks like a report
        // which the browser can easily print to PDF.
        
        $type = $request->query('type', 'GST');
        $data = $this->index()->getData(true);

        return view('reports.export', [
            'type' => $type,
            'data' => $data,
            'business' => \App\Models\BusinessProfile::first()
        ]);
    }
}
