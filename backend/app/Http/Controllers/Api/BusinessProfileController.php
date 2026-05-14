<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessProfile;
use Illuminate\Http\Request;

class BusinessProfileController extends Controller
{
    public function show()
    {
        $profile = BusinessProfile::first();
        if (!$profile) {
            $profile = BusinessProfile::create([
                'name' => 'ProGst Solutions',
                'gstin' => '27AAACP0000A1Z5',
                'address' => '123 Business Hub, Mumbai, Maharashtra',
                'phone' => '+91 98765 43210',
                'email' => 'contact@progst.com'
            ]);
        }
        return response()->json($profile);
    }

    public function update(Request $request)
    {
        $profile = BusinessProfile::first();
        if (!$profile) {
            $profile = new BusinessProfile();
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'gstin' => 'nullable|string|max:15',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:15',
            'email' => 'nullable|email',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo_url'] = '/storage/' . $path;
        }

        $profile->fill($validated);
        $profile->save();
        
        return response()->json($profile);
    }
}
