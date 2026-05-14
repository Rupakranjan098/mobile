<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \App\Models\SubscriptionPlan::truncate();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Plan 1: Monthly ₹99
        \App\Models\SubscriptionPlan::create([
            'name' => 'Monthly',
            'price' => 99.00,
            'duration_months' => 1,
            'description' => 'Great for individuals and small businesses getting started.',
            'features' => json_encode([
                'Unlimited Invoices',
                'GST Filing Reports',
                'Mobile App Access',
                'Basic Support',
                'Barcode Scanner',
                'Cloud Backup',
            ]),
        ]);

        // Plan 2: Quarterly ₹199 (3 months)
        \App\Models\SubscriptionPlan::create([
            'name' => 'Quarterly',
            'price' => 199.00,
            'duration_months' => 3,
            'description' => 'Best value for growing businesses. Save ₹98 vs monthly.',
            'features' => json_encode([
                'Everything in Monthly',
                'Inventory Management',
                'Expense Tracking',
                'Customer Management',
                'Priority Email Support',
                'Advanced Reports',
            ]),
        ]);

        // Plan 3: Half-Yearly ₹299 (6 months)
        \App\Models\SubscriptionPlan::create([
            'name' => 'Half-Yearly',
            'price' => 299.00,
            'duration_months' => 6,
            'description' => 'Power-packed plan for established businesses. Save ₹295 vs monthly.',
            'features' => json_encode([
                'Everything in Quarterly',
                'Multi-Device Access',
                'Bulk Product Import',
                'Custom Invoice Templates',
                'WhatsApp Invoice Sharing',
                'Priority Phone Support',
            ]),
        ]);

        // Plan 4: Annual ₹1999 (12 months)
        \App\Models\SubscriptionPlan::create([
            'name' => 'Annual',
            'price' => 1999.00,
            'duration_months' => 12,
            'description' => 'Maximum value for serious businesses. Save ₹989 vs monthly!',
            'features' => json_encode([
                'Everything in Half-Yearly',
                'Unlimited Users',
                'Dedicated Account Manager',
                'Advanced Analytics Dashboard',
                'API Access',
                '24/7 Premium Support',
            ]),
        ]);
    }
}
