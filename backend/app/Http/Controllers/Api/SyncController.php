<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SyncController extends Controller
{
    public function sync(Request $request)
    {
        $user = $request->user();
        $user->last_sync_at = Carbon::now();
        $user->save();

        return response()->json([
            'message' => 'Data backed up and synced successfully',
            'last_sync_at' => $user->last_sync_at,
            'user' => $user->load('subscriptionPlan')
        ]);
    }
}
