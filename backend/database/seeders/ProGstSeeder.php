<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Expense;
use Carbon\Carbon;

class ProGstSeeder extends Seeder
{
    public function run(): void
    {
        // Test User
        \App\Models\User::create([
            'name' => 'Test User',
            'email' => 'test@test.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
        ]);

        // Business Profile
        \App\Models\BusinessProfile::create([
            'name' => 'ProGst Solutions',
            'gstin' => '27AAACP0000A1Z5',
            'address' => '123 Business Hub, MG Road, Mumbai, MH - 400001',
            'phone' => '+91 98765 43210',
            'email' => 'billing@progst.com'
        ]);

        // Customers
        $customer = Customer::create([
            'name' => 'Rahul Enterprises',
            'gstin' => '29ABCDE1234F1Z5',
            'address' => '123, MG Road, Bangalore, Karnataka',
            'phone' => '9876543210',
            'email' => 'rahul@enterprises.com'
        ]);

        Customer::create(['name' => 'Sharma Store', 'gstin' => '27ABCDE6789F1Z5', 'address' => 'Mumbai, Maharashtra']);
        Customer::create(['name' => 'Kumar Traders', 'gstin' => '24ABCDE4567F1Z6', 'address' => 'Delhi, Delhi']);

        // Products
        $p1 = Product::create(['name' => 'Wireless Headphone', 'hsn' => '85183000', 'price' => 2500, 'stock' => 120, 'status' => 'In Stock']);
        $p2 = Product::create(['name' => 'Portable Speaker', 'hsn' => '91021200', 'price' => 1200, 'stock' => 85, 'status' => 'In Stock']);
        $p3 = Product::create(['name' => 'Smart Watch', 'hsn' => '85182100', 'price' => 3999, 'stock' => 15, 'status' => 'Low Stock']);
        $p4 = Product::create(['name' => 'USB-C Cable', 'hsn' => '85444290', 'price' => 299, 'stock' => 200, 'status' => 'In Stock']);

        // Invoices
        Invoice::create([
            'invoice_number' => 'INV-2024-128',
            'customer_id' => $customer->id,
            'date' => Carbon::now(),
            'sub_total' => 6200,
            'discount' => 200,
            'taxable_amount' => 6000,
            'cgst' => 540,
            'sgst' => 540,
            'total_amount' => 7080,
            'status' => 'Paid'
        ]);

        // Expenses
        Expense::create(['name' => 'Office Rent', 'date' => Carbon::now(), 'amount' => 15000, 'category' => 'Business']);
        Expense::create(['name' => 'Electricity Bill', 'date' => Carbon::now()->subDays(2), 'amount' => 2500, 'category' => 'Business']);
        Expense::create(['name' => 'Internet Bill', 'date' => Carbon::now()->subDays(4), 'amount' => 1200, 'category' => 'Business']);
    }
}
