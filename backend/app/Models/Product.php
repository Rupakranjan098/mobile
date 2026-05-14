<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'hsn',
        'barcode',
        'price',
        'stock',
        'unit',
        'status'
    ];
}
