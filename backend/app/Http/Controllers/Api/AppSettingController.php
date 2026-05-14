<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;

class AppSettingController extends Controller
{
    public function show(Request $request)
    {
        $settings = AppSetting::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'email_notifications' => true,
                'push_notifications' => true,
                'language' => 'en',
                'theme' => 'light',
                'currency' => 'INR'
            ]
        );

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $settings = AppSetting::updateOrCreate(
            ['user_id' => $request->user()->id],
            $request->validate([
                'email_notifications' => 'sometimes|boolean',
                'push_notifications' => 'sometimes|boolean',
                'language' => 'sometimes|string',
                'theme' => 'sometimes|string',
                'currency' => 'sometimes|string'
            ])
        );

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $settings
        ]);
    }
}
