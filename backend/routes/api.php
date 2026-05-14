<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\DashboardController;

use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\BusinessProfileController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\AppSettingController;
use App\Http\Controllers\Api\SupportController;
use App\Http\Controllers\Api\AIController;

Route::get('/ping', function () {
    return response()->json(['status' => 'pong']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Subscriptions
    Route::apiResource('subscription-plans', SubscriptionController::class);
    Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
    
    // Sync
    Route::post('/sync', [SyncController::class, 'sync']);
    
    // App Settings
    Route::get('/app-settings', [AppSettingController::class, 'show']);
    Route::put('/app-settings', [AppSettingController::class, 'update']);

    // Support
    Route::get('/faqs', [SupportController::class, 'getFAQs']);
    Route::get('/support-contact', [SupportController::class, 'getSupportContact']);
    Route::post('/ai/query', [AIController::class, 'query']);
    
    // Protected Data Routes
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/business-profile', [BusinessProfileController::class, 'show']);
    Route::put('/business-profile', [BusinessProfileController::class, 'update']);
    Route::get('/products/barcode/{barcode}', [ProductController::class, 'findByBarcode'])->where('barcode', '.*');
    Route::apiResource('products', ProductController::class);
    Route::get('/invoices/next-number', [InvoiceController::class, 'nextInvoiceNumber']);
    Route::apiResource('invoices', InvoiceController::class);
    Route::apiResource('expenses', ExpenseController::class);
    Route::apiResource('customers', CustomerController::class);
});
