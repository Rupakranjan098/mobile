<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'customer_id',
        'invoice_number',
        'date',
        'due_date',
        'sub_total',
        'taxable_amount',
        'total_amount',
        'tax_amount',
        'cgst',
        'sgst',
        'igst',
        'status',
        'notes'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
