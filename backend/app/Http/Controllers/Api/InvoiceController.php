<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index()
    {
        return response()->json(Invoice::with(['customer', 'items.product'])->latest()->get());
    }

    public function nextInvoiceNumber()
    {
        $lastInvoice = Invoice::latest()->first();
        if (!$lastInvoice) {
            return response()->json(['number' => 'INV-2024-001']);
        }

        $lastNumber = $lastInvoice->invoice_number;
        $number = (int) substr($lastNumber, strrpos($lastNumber, '-') + 1);
        $nextNumber = str_pad($number + 1, 3, '0', STR_PAD_LEFT);
        
        return response()->json(['number' => 'INV-' . date('Y') . '-' . $nextNumber]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'invoice_number' => 'required|string|unique:invoices',
            'date' => 'required|date',
            'total_amount' => 'required|numeric',
            'tax_amount' => 'required|numeric',
            'sub_total' => 'nullable|numeric',
            'taxable_amount' => 'nullable|numeric',
            'cgst' => 'nullable|numeric',
            'sgst' => 'nullable|numeric',
            'igst' => 'nullable|numeric',
            'status' => 'required|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'items.*.total' => 'required|numeric',
        ]);

        return DB::transaction(function () use ($validated) {
            $invoice = Invoice::create($validated);

            foreach ($validated['items'] as $itemData) {
                $invoice->items()->create($itemData);
                
                // Deduct Stock
                $product = \App\Models\Product::find($itemData['product_id']);
                if ($product) {
                    $product->stock -= $itemData['quantity'];
                    if ($product->stock <= 0) {
                        $product->status = 'Out of Stock';
                    }
                    $product->save();
                }
            }

            return response()->json($invoice->load(['customer', 'items.product']), 201);
        });
    }

    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load(['customer', 'items.product']));
    }

    public function update(Request $request, Invoice $invoice)
    {
        $invoice->update($request->all());
        
        if ($request->has('items')) {
            $invoice->items()->delete();
            foreach ($request->items as $item) {
                $invoice->items()->create($item);
            }
        }
        
        return response()->json($invoice->load(['customer', 'items.product']));
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return response()->json(null, 204);
    }

    public function print($id)
    {
        $invoice = Invoice::with(['customer', 'items.product'])->find($id);
        
        if (!$invoice) {
            abort(404, "Invoice with ID #$id not found.");
        }

        $business = \App\Models\BusinessProfile::first();
        return view('invoice_premium', compact('invoice', 'business'));
    }
}
