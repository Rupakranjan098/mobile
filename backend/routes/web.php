<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ReportController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-web', function () {
    return 'Web routes are working!';
});

// Invoice Print
Route::get('/invoices/{id}/print', [InvoiceController::class, 'print'])->name('invoices.print');

// Reports Export
Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
