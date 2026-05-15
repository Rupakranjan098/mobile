<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Otp;
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Generate OTP
        $otpCode = rand(100000, 999999);
        
        Otp::updateOrCreate(
            ['email' => $request->email],
            [
                'otp' => $otpCode,
                'expires_at' => Carbon::now()->addMinutes(10)
            ]
        );

        // Send Email (Logged in storage/logs/laravel.log)
        try {
            Mail::to($request->email)->send(new OtpMail($otpCode));
        } catch (\Exception $e) {
            \Log::error("Mail failed: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'OTP sent to your email. Please verify to complete registration.',
            'email' => $request->email,
            'debug_otp' => config('app.env') === 'local' ? $otpCode : null
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $otpRecord = Otp::where('email', $request->email)
                        ->where('otp', $request->otp)
                        ->where('expires_at', '>', Carbon::now())
                        ->first();

        if (!$otpRecord) {
            return response()->json(['message' => 'Invalid or expired OTP'], 422);
        }

        // Create User
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'email_verified_at' => Carbon::now()
        ]);

        // Delete OTP
        $otpRecord->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('subscriptionPlan')
        ]);
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request['email'])->firstOrFail();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('subscriptionPlan')
        ]);
    }

    public function sendLoginOtp(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $otpCode = rand(100000, 999999);
        
        Otp::updateOrCreate(
            ['email' => $request->email],
            [
                'otp' => $otpCode,
                'expires_at' => Carbon::now()->addMinutes(10)
            ]
        );

        try {
            Mail::to($request->email)->send(new OtpMail($otpCode));
        } catch (\Exception $e) {
            \Log::error("Mail failed: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Login OTP sent to your email.',
            'debug_otp' => config('app.env') === 'local' ? $otpCode : null
        ]);
    }

    public function verifyLoginOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string|size:6',
        ]);

        $otpRecord = Otp::where('email', $request->email)
                        ->where('otp', $request->otp)
                        ->where('expires_at', '>', Carbon::now())
                        ->first();

        if (!$otpRecord) {
            return response()->json(['message' => 'Invalid or expired OTP'], 422);
        }

        $user = User::where('email', $request->email)->first();
        
        // Delete OTP
        $otpRecord->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('subscriptionPlan')
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('subscriptionPlan'));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('subscriptionPlan')
        ]);
    }
}
