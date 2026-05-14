<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function index()
    {
        return response()->json(SubscriptionPlan::where('is_active', true)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'duration_months' => 'required|integer',
            'description' => 'nullable|string',
            'features' => 'nullable|array'
        ]);

        if (isset($validated['features'])) {
            $validated['features'] = json_encode($validated['features']);
        }

        $plan = SubscriptionPlan::create($validated);
        return response()->json($plan, 201);
    }

    public function show(SubscriptionPlan $subscriptionPlan)
    {
        return response()->json($subscriptionPlan);
    }

    public function update(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric',
            'duration_months' => 'sometimes|required|integer',
            'description' => 'nullable|string',
            'features' => 'nullable|array'
        ]);

        if (isset($validated['features'])) {
            $validated['features'] = json_encode($validated['features']);
        }

        $subscriptionPlan->update($validated);
        return response()->json($subscriptionPlan);
    }

    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->delete();
        return response()->json(null, 204);
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id'
        ]);

        $user = $request->user();
        $plan = SubscriptionPlan::find($request->plan_id);

        $user->subscription_plan_id = $plan->id;
        $user->subscription_expires_at = Carbon::now()->addMonths($plan->duration_months);
        $user->save();

        return response()->json([
            'message' => 'Subscribed successfully',
            'user' => $user->load('subscriptionPlan')
        ]);
    }
}
