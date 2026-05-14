<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Invoice;
use App\Models\Expense;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create Demo User
        $user = User::updateOrCreate(
            ['email' => 'demo@progst.com'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password123'),
                'plan' => 'Pro'
            ]
        );

        // Create Customers
        $customers = [
            ['name' => 'Rahul Enterprises', 'email' => 'rahul@example.com', 'gstin' => '29ABCDE1234F1Z5', 'city' => 'Bangalore', 'state' => 'Karnataka'],
            ['name' => 'Global Solutions', 'email' => 'info@globalsol.com', 'gstin' => '27AAACG1234H1Z2', 'city' => 'Mumbai', 'state' => 'Maharashtra'],
            ['name' => 'Tech Innovators', 'email' => 'contact@techinn.com', 'gstin' => '07BBBCD5678J1Z9', 'city' => 'New Delhi', 'state' => 'Delhi'],
        ];

        foreach ($customers as $c) {
            Customer::updateOrCreate(['gstin' => $c['gstin']], $c);
        }

        // Create Products
        $products = [
            ['name' => 'Wireless Headphone', 'hsn' => '85183000', 'barcode' => '8901234567890', 'price' => 2500, 'stock' => 50, 'status' => 'In Stock'],
            ['name' => 'Portable Speaker', 'hsn' => '91021200', 'barcode' => '8901234567891', 'price' => 1200, 'stock' => 30, 'status' => 'In Stock'],
            ['name' => 'USB-C Cable', 'hsn' => '85444299', 'barcode' => '8901234567892', 'price' => 450, 'stock' => 100, 'status' => 'In Stock'],
            ['name' => 'Gaming Mouse', 'hsn' => '84716060', 'barcode' => '8901234567893', 'price' => 1800, 'stock' => 5, 'status' => 'Low Stock'],
            ['name' => 'iPhone 15 Case', 'hsn' => '39269099', 'barcode' => '8901234567894', 'price' => 899, 'stock' => 20, 'status' => 'In Stock'],
            ['name' => 'Laptop Stand', 'hsn' => '84733099', 'barcode' => '8901234567895', 'price' => 1500, 'stock' => 15, 'status' => 'In Stock'],
        ];

        foreach ($products as $p) {
            Product::updateOrCreate(['barcode' => $p['barcode']], $p);
        }

        // Create Invoices for last 30 days
        $customerIds = Customer::pluck('id')->toArray();
        $productIds = Product::pluck('id')->toArray();

        for ($i = 0; $i < 20; $i++) {
            $date = Carbon::now()->subDays(rand(0, 30));
            $dueDate = (clone $date)->addDays(15);
            
            $status = ['Paid', 'Unpaid', 'Overdue'][rand(0, 2)];
            
            // If status is overdue, make sure due_date is in the past
            if ($status == 'Overdue') {
                $date = Carbon::now()->subDays(rand(20, 40));
                $dueDate = (clone $date)->addDays(5);
            }

            $subTotal = rand(1000, 10000);
            $tax = $subTotal * 0.18;
            $total = $subTotal + $tax;

            $invoice = Invoice::create([
                'customer_id' => $customerIds[array_rand($customerIds)],
                'invoice_number' => 'INV-' . (2024001 + $i),
                'date' => $date->toDateString(),
                'due_date' => $dueDate->toDateString(),
                'sub_total' => $subTotal,
                'taxable_amount' => $subTotal,
                'total_amount' => $total,
                'tax_amount' => $tax,
                'cgst' => $tax / 2,
                'sgst' => $tax / 2,
                'igst' => 0,
                'status' => $status,
            ]);

            // Add 1-3 random items
            for ($j = 0; $j < rand(1, 3); $j++) {
                $pId = $productIds[array_rand($productIds)];
                $product = Product::find($pId);
                $qty = rand(1, 5);
                
                $invoice->items()->create([
                    'product_id' => $pId,
                    'quantity' => $qty,
                    'price' => $product->price,
                    'total' => $product->price * $qty,
                ]);
            }
        }

        // Create Expenses
        $expenses = [
            ['name' => 'Office Rent', 'amount' => 15000, 'date' => Carbon::now()->subDays(10)->toDateString(), 'category' => 'Office'],
            ['name' => 'Internet Bill', 'amount' => 1200, 'date' => Carbon::now()->subDays(5)->toDateString(), 'category' => 'Internet'],
            ['name' => 'Travel Fuel', 'amount' => 2500, 'date' => Carbon::now()->subDays(2)->toDateString(), 'category' => 'Travel'],
        ];

        foreach ($expenses as $e) {
            Expense::updateOrCreate(['name' => $e['name']], $e);
        }
    }
}
