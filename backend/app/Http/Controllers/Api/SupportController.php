<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FAQ;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function getFAQs()
    {
        return response()->json(FAQ::where('is_published', true)->get());
    }

    public function getSupportContact()
    {
        return response()->json([
            'email' => 'support@progst.com',
            'phone' => '+91 98765 43210',
            'whatsapp' => '+91 98765 43210',
            'working_hours' => 'Mon-Sat, 10 AM - 7 PM'
        ]);
    }
}
