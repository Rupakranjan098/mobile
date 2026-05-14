<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f0f2f5;
            /* Support for mobile safe areas */
            padding-top: max(20px, env(safe-area-inset-top));
            padding-bottom: max(20px, env(safe-area-inset-bottom));
            padding-left: max(20px, env(safe-area-inset-left));
            padding-right: max(20px, env(safe-area-inset-right));
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 35px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        @media (max-width: 600px) {
            .invoice-box {
                padding: 20px;
                border-radius: 0; /* Full width on small mobile for better safe area usage */
            }
            body {
                padding-left: 0;
                padding-right: 0;
                background-color: #fff; /* Match background on mobile for seamless safe area */
            }
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 25px;
            flex-wrap: wrap;
            gap: 20px;
        }
        .logo {
            max-height: 55px;
            margin-bottom: 10px;
        }
        .business-details {
            flex: 1;
            min-width: 250px;
        }
        .business-details h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            color: #111827;
        }
        .business-details p {
            margin: 5px 0;
            font-size: 14px;
            color: #6b7280;
        }
        .invoice-info {
            text-align: right;
            min-width: 150px;
        }
        @media (max-width: 600px) {
            .invoice-info {
                text-align: left;
                width: 100%;
                background: #f9fafb;
                padding: 15px;
                border-radius: 8px;
            }
        }
        .invoice-info h2 {
            margin: 0;
            font-size: 26px;
            color: #22c55e;
            text-transform: uppercase;
            font-weight: 900;
        }
        .invoice-info p {
            margin: 4px 0;
            font-size: 14px;
            color: #374151;
            font-weight: 600;
        }
        .details-grid {
            display: flex;
            justify-content: space-between;
            gap: 30px;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }
        .customer-details, .payment-details {
            flex: 1;
            min-width: 240px;
        }
        .section-title {
            font-size: 12px;
            text-transform: uppercase;
            color: #9ca3af;
            font-weight: 800;
            margin-bottom: 12px;
            letter-spacing: 0.05em;
            border-left: 3px solid #22c55e;
            padding-left: 10px;
        }
        .customer-details h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: #111827;
        }
        .customer-details p, .payment-details p {
            margin: 6px 0;
            font-size: 14px;
            color: #4b5563;
        }
        .table-responsive {
            width: 100%;
            overflow-x: auto;
            margin-bottom: 40px;
            border-radius: 8px;
            border: 1px solid #f3f4f6;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 550px;
        }
        th {
            background-color: #f9fafb;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            font-weight: 800;
            padding: 15px;
            border-bottom: 2px solid #f3f4f6;
        }
        td {
            padding: 15px;
            font-size: 14px;
            border-bottom: 1px solid #f3f4f6;
        }
        .item-name {
            font-weight: 700;
            color: #111827;
        }
        .item-hsn {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 2px;
        }
        .totals {
            display: flex;
            justify-content: flex-end;
        }
        .totals-table {
            width: 100%;
            max-width: 320px;
            min-width: 0;
        }
        .totals-table td {
            padding: 8px 0;
            border: none;
        }
        .totals-table .label {
            color: #6b7280;
            font-weight: 600;
        }
        .totals-table .value {
            text-align: right;
            font-weight: 700;
            color: #111827;
        }
        .totals-table .grand-total {
            font-size: 20px;
            color: #22c55e;
            font-weight: 900;
            padding-top: 15px;
            border-top: 3px double #f3f4f6;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding-top: 25px;
        }
        @media print {
            body {
                background-color: #fff;
                padding: 0;
            }
            .invoice-box {
                box-shadow: none;
                border: none;
                width: 100%;
                max-width: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <div class="business-details">
                @if($business->logo_url)
                    <img src="{{ url($business->logo_url) }}" class="logo" alt="Logo">
                @endif
                <h1>{{ $business->name }}</h1>
                <p>{{ $business->address }}</p>
                <p><strong>GSTIN:</strong> {{ $business->gstin }}</p>
                <p><strong>Phone:</strong> {{ $business->phone }} | <strong>Email:</strong> {{ $business->email }}</p>
            </div>
            <div class="invoice-info">
                <h2>Tax Invoice</h2>
                <p>No: {{ $invoice->invoice_number }}</p>
                <p>Date: {{ \Carbon\Carbon::parse($invoice->date)->format('d M, Y') }}</p>
                <p>Status: {{ strtoupper($invoice->status) }}</p>
            </div>
        </div>

        <div class="details-grid">
            <div class="customer-details">
                <div class="section-title">Bill To</div>
                <h3>{{ $invoice->customer->name }}</h3>
                @if($invoice->customer->gstin)
                    <p><strong>GSTIN:</strong> {{ $invoice->customer->gstin }}</p>
                @endif
                <p>{{ $invoice->customer->address }}</p>
                <p>{{ $invoice->customer->city }}, {{ $invoice->customer->state }}</p>
                <p><strong>Phone:</strong> {{ $invoice->customer->phone }}</p>
            </div>
            <div class="payment-details">
                <div class="section-title">Payment Info</div>
                <p><strong>Due Date:</strong> {{ \Carbon\Carbon::parse($invoice->date)->addDays(15)->format('d M, Y') }}</p>
                <p><strong>Account Holder:</strong> {{ $business->name }}</p>
                <p><strong>Account No:</strong> XXXXXXXXXX</p>
                <p><strong>IFSC:</strong> XXXXXXXX</p>
            </div>
        </div>

        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($invoice->items as $item)
                        <tr>
                            <td>
                                <div class="item-name">{{ $item->product->name }}</div>
                                <div class="item-hsn">HSN: {{ $item->product->hsn }}</div>
                            </td>
                            <td>₹ {{ number_format($item->price, 2) }}</td>
                            <td>{{ $item->quantity }}</td>
                            <td>₹ {{ number_format($item->total, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="totals">
            <table class="totals-table">
                <tr>
                    <td class="label">Taxable Value</td>
                    <td class="value">₹ {{ number_format($invoice->taxable_amount, 2) }}</td>
                </tr>
                @if($invoice->cgst > 0)
                <tr>
                    <td class="label">CGST (9%)</td>
                    <td class="value">₹ {{ number_format($invoice->cgst, 2) }}</td>
                </tr>
                @endif
                @if($invoice->sgst > 0)
                <tr>
                    <td class="label">SGST (9%)</td>
                    <td class="value">₹ {{ number_format($invoice->sgst, 2) }}</td>
                </tr>
                @endif
                @if($invoice->igst > 0)
                <tr>
                    <td class="label">IGST (18%)</td>
                    <td class="value">₹ {{ number_format($invoice->igst, 2) }}</td>
                </tr>
                @endif
                <tr>
                    <td class="label grand-total">Grand Total</td>
                    <td class="value grand-total">₹ {{ number_format($invoice->total_amount, 2) }}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer generated invoice and does not require a signature.</p>
        </div>
    </div>
</body>
</html>
