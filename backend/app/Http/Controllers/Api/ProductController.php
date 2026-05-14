<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'hsn' => 'nullable|string|max:20',
            'barcode' => 'nullable|string|unique:products,barcode',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:10',
        ]);

        $data = $request->all();
        $data['status'] = $this->calculateStatus($data['stock']);

        $product = Product::create($data);
        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'hsn' => 'nullable|string|max:20',
            'barcode' => 'nullable|string|unique:products,barcode,' . $product->id,
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'unit' => 'nullable|string|max:10',
        ]);

        $data = $request->all();
        $data['status'] = $this->calculateStatus($data['stock']);

        $product->update($data);
        return response()->json($product);
    }

    private function calculateStatus($stock)
    {
        if ($stock <= 0) return 'Out of Stock';
        if ($stock <= 5) return 'Low Stock';
        return 'In Stock';
    }

    public function findByBarcode($barcode)
    {
        // 1. Check local database first
        $product = Product::where('barcode', $barcode)->first();
        
        if ($product) {
            return response()->json([
                'source' => 'local',
                'product' => $product
            ]);
        }

        $foundData = [
            'name' => '',
            'price' => 0,
            'category' => '',
            'source' => 'placeholder'
        ];

        // 2. Try UPCItemDB (Free Trial API - No Key required for low volume)
        try {
            $upcResponse = \Illuminate\Support\Facades\Http::get("https://api.upcitemdb.com/prod/trial/lookup?upc={$barcode}");
            if ($upcResponse->successful() && !empty($upcResponse->json('items'))) {
                $item = $upcResponse->json('items')[0];
                $foundData['name'] = $item['title'] ?? '';
                $foundData['price'] = $item['lowest_recorded_price'] ?? $item['highest_recorded_price'] ?? 0;
                $foundData['category'] = $item['category'] ?? '';
                $foundData['source'] = 'upcitemdb';
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("UPCItemDB Error: " . $e->getMessage());
        }

        // 3. Fallback to Open Food Facts if not found or name is empty
        if (empty($foundData['name'])) {
            try {
                $offResponse = \Illuminate\Support\Facades\Http::get("https://world.openfoodfacts.org/api/v0/product/{$barcode}.json");
                if ($offResponse->successful() && $offResponse->json('status') === 1) {
                    $p = $offResponse->json('product');
                    $foundData['name'] = $p['product_name'] ?? $p['product_name_en'] ?? '';
                    $foundData['category'] = $p['categories'] ?? '';
                    $foundData['source'] = 'openfoodfacts';
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("OFF Error: " . $e->getMessage());
            }
        }

        // 4. Return the best data found
        if (!empty($foundData['name'])) {
            return response()->json([
                'source' => $foundData['source'],
                'product' => [
                    'name' => $foundData['name'],
                    'barcode' => $barcode,
                    'hsn' => $this->generateMockHSN(['product_name' => $foundData['name'], 'categories' => $foundData['category']]),
                    'price' => (float)$foundData['price'],
                    'unit' => 'PCS',
                    'is_new' => true
                ]
            ]);
        }

        // 5. Ultimate Fallback
        return response()->json([
            'source' => 'placeholder',
            'product' => [
                'name' => 'New Item (' . $barcode . ')',
                'barcode' => $barcode,
                'hsn' => '8517',
                'price' => 0,
                'unit' => 'PCS',
                'is_new' => true
            ]
        ]);
    }

    private function generateMockHSN($data)
    {
        $name = strtolower(($data['product_name'] ?? '') . ' ' . ($data['categories'] ?? ''));
        
        $hsnData = [
            ['keyword' => 'noodle', 'hsn' => '1902'],
            ['keyword' => 'pasta', 'hsn' => '1902'],
            ['keyword' => 'biscuit', 'hsn' => '1905'],
            ['keyword' => 'cookie', 'hsn' => '1905'],
            ['keyword' => 'chocolate', 'hsn' => '1806'],
            ['keyword' => 'chips', 'hsn' => '2106'],
            ['keyword' => 'snack', 'hsn' => '2106'],
            ['keyword' => 'namkeen', 'hsn' => '2106'],
            ['keyword' => 'milk', 'hsn' => '0401'],
            ['keyword' => 'butter', 'hsn' => '0405'],
            ['keyword' => 'cheese', 'hsn' => '0406'],
            ['keyword' => 'oil', 'hsn' => '1512'],
            ['keyword' => 'tea', 'hsn' => '0902'],
            ['keyword' => 'coffee', 'hsn' => '0901'],
            ['keyword' => 'soap', 'hsn' => '3401'],
            ['keyword' => 'shampoo', 'hsn' => '3305'],
            ['keyword' => 'toothpaste', 'hsn' => '3306'],
            ['keyword' => 'mobile', 'hsn' => '8517'],
            ['keyword' => 'phone', 'hsn' => '8517'],
            ['keyword' => 'pen', 'hsn' => '9608'],
            ['keyword' => 'pencil', 'hsn' => '9609'],
            ['keyword' => 'notebook', 'hsn' => '4820'],
            ['keyword' => 'battery', 'hsn' => '8506'],
            ['keyword' => 'bulb', 'hsn' => '8539'],
        ];

        foreach ($hsnData as $item) {
            if (str_contains($name, $item['keyword'])) {
                return $item['hsn'];
            }
        }

        return "8517"; // Default HSN
    }

    private function estimatePrice($data)
    {
        // Barcode APIs rarely provide price. We'll return 0 or a placeholder.
        return 0;
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(null, 204);
    }
}
