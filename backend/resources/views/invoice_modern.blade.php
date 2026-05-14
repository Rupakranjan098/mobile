<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        :root {
            --primary-color: #22c55e;
            --secondary-color: #16a34a;
            --text-main: #111827;
            --text-muted: #6b7280;
            --bg-light: #f9fafb;
            --border-color: #e5e7eb;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: var(--text-main);
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            line-height: 1.5;
        }
        .invoice-container {
            max-width: 850px;
            margin: 30px auto;
            background: #fff;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
            border-radius: 8px;
        }
        .header-bar {
            background-color: var(--primary-color);
            height: 12px;
            width: 100%;
        }
        .top-section {
            padding: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .logo-container img {
            max-height: 50px;
            margin-bottom: 15px;
        }
        .company-info h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 800;
            color: var(--text-main);
            letter-spacing: -0.025em;
        }
        .company-info p {
            margin: 4px 0;
            font-size: 13px;
            color: var(--text-muted);
            max-width: 300px;
        }
        .invoice-meta {
            text-align: right;
        }
        .invoice-meta h2 {
            margin: 0;
            font-size: 32px;
            font-weight: 900;
            color: var(--primary-color);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .meta-grid {
            margin-top: 15px;
            display: grid;
            grid-template-columns: auto auto;
            gap: 8px 20px;
            text-align: right;
        }
        .meta-label {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
        }
        .meta-value {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-main);
        }

        .billing-section {
            padding: 0 40px 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        .card-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--primary-color);
            margin-bottom: 12px;
            letter-spacing: 0.1em;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 8px;
        }
        .bill-to h3 {
            margin: 0 0 8px;
            font-size: 18px;
            font-weight: 700;
        }
        .bill-to p {
            margin: 3px 0;
            font-size: 13px;
            color: var(--text-muted);
        }

        .table-section {
            padding: 0 40px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background-color: var(--bg-light);
            padding: 12px 15px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-muted);
            border-top: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
        }
        td {
            padding: 18px 15px;
            font-size: 14px;
            border-bottom: 1px solid var(--border-color);
        }
        .item-desc {
            font-weight: 700;
            color: var(--text-main);
            display: block;
        }
        .item-sub {
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 4px;
        }
        .text-right { text-align: right; }

        .bottom-section {
            padding: 40px;
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 40px;
        }
        .notes-box {
            background-color: var(--bg-light);
            padding: 20px;
            border-radius: 6px;
        }
        .notes-box h4 {
            margin: 0 0 10px;
            font-size: 12px;
            color: var(--text-main);
        }
        .notes-box p {
            margin: 0;
            font-size: 12px;
            color: var(--text-muted);
        }

        .summary-table {
            width: 100%;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
        }
        .summary-row.total {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid var(--primary-color);
            font-size: 20px;
            font-weight: 900;
            color: var(--primary-color);
        }
        .label { color: var(--text-muted); }
        .value { font-weight: 700; }

        .footer {
            background-color: var(--bg-light);
            padding: 30px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .footer-text p {
            margin: 0;
            font-size: 11px;
            color: var(--text-muted);
        }
        .signature-area {
            text-align: center;
        }
        .sig-line {
            width: 150px;
            border-top: 1px solid var(--text-main);
            margin-bottom: 5px;
        }
        .sig-text {
            font-size: 11px;
            font-weight: 700;
        }

        @media (max-width: 600px) {
            .top-section, .billing-section, .bottom-section {
                flex-direction: column;
                grid-template-columns: 1fr;
                padding: 20px;
            }
            .invoice-meta {
                text-align: left;
                margin-top: 20px;
            }
            .meta-grid {
                text-align: left;
                justify-content: flex-start;
            }
            .footer {
                flex-direction: column;
                gap: 20px;
                text-align: center;
            }
        }
        @media print {
            body { background: #fff; padding: 0; }
            .invoice-container { box-shadow: none; margin: 0; max-width: none; width: 100%; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header-bar"></div>
        
        <div class="top-section">
            <div class="company-info">
                @if($business->logo_url)
                    <div class="logo-container">
                        <img src="{{ url($business->logo_url) }}" alt="Logo">
                    </div>
                @endif
                <h1>{{ $business->name }}</h1>
                <p>{{ $business->address }}</p>
                <p><strong>GSTIN:</strong> {{ $business->gstin }}</p>
                <p><strong>Email:</strong> {{ $business->email }} | <strong>Phone:</strong> {{ $business->phone }}</p>
            </div>
            
            <div class="invoice-meta">
                <h2>INVOICE</h2>
                <div class="meta-grid">
                    <span class="meta-label">Invoice #</span>
                    <span class="meta-value">{{ $invoice->invoice_number }}</span>
                    <span class="meta-label">Date</span>
                    <span class="meta-value">{{ \Carbon\Carbon::parse($invoice->date)->format('d/m/Y') }}</span>
                    <span class="meta-label">Status</span>
                    <span class="meta-value" style="color: {{ $invoice->status == 'Paid' ? '#059669' : '#d97706' }}">{{ strtoupper($invoice->status) }}</span>
                </div>
            </div>
        </div>

        <div class="billing-section">
            <div class="bill-to">
                <div class="card-title">Bill To</div>
                <h3>{{ $invoice->customer->name }}</h3>
                <p>{{ $invoice->customer->address }}</p>
                <p>{{ $invoice->customer->city }}, {{ $invoice->customer->state }}</p>
                <p><strong>GSTIN:</strong> {{ $invoice->customer->gstin ?: 'N/A' }}</p>
                <p><strong>Phone:</strong> {{ $invoice->customer->phone }}</p>
            </div>
            <div class="payment-info">
                <div class="card-title">Payment Information</div>
                <div class="meta-grid" style="text-align: left; justify-content: flex-start;">
                    <span class="meta-label">Due Date</span>
                    <span class="meta-value">{{ \Carbon\Carbon::parse($invoice->date)->addDays(15)->format('d/m/Y') }}</span>
                    <span class="meta-label">Bank Name</span>
                    <span class="meta-value">HDFC Bank Ltd</span>
                    <span class="meta-label">Acc Number</span>
                    <span class="meta-value">XXXX XXXX XXXX</span>
                    <span class="meta-label">IFSC Code</span>
                    <span class="meta-value">HDFC0001234</span>
                </div>
            </div>
        </div>

        <div class="table-section">
            <table>
                <thead>
                    <tr>
                        <th>Item Details</th>
                        <th class="text-right">Price</th>
                        <th class="text-right">Qty</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($invoice->items as $item)
                        <tr>
                            <td>
                                <span class="item-desc">{{ $item->product->name }}</span>
                                <span class="item-sub">HSN: {{ $item->product->hsn }}</span>
                            </td>
                            <td class="text-right">₹{{ number_format($item->price, 2) }}</td>
                            <td class="text-right">{{ $item->quantity }}</td>
                            <td class="text-right">₹{{ number_format($item->total, 2) }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="bottom-section">
            <div class="notes-box">
                <h4>Terms & Conditions:</h4>
                <p>1. Please pay within 15 days of receiving this invoice.</p>
                <p>2. Goods once sold will not be taken back.</p>
                <p>3. Subject to local jurisdiction.</p>
            </div>
            
            <div class="summary-box">
                <div class="summary-row">
                    <span class="label">Sub Total</span>
                    <span class="value">₹{{ number_format($invoice->sub_total, 2) }}</span>
                </div>
                <div class="summary-row">
                    <span class="label">Taxable Amount</span>
                    <span class="value">₹{{ number_format($invoice->taxable_amount, 2) }}</span>
                </div>
                @if($invoice->cgst > 0)
                <div class="summary-row">
                    <span class="label">CGST (9%)</span>
                    <span class="value">₹{{ number_format($invoice->cgst, 2) }}</span>
                </div>
                @endif
                @if($invoice->sgst > 0)
                <div class="summary-row">
                    <span class="label">SGST (9%)</span>
                    <span class="value">₹{{ number_format($invoice->sgst, 2) }}</span>
                </div>
                @endif
                <div class="summary-row total">
                    <span>Grand Total</span>
                    <span>₹{{ number_format($invoice->total_amount, 2) }}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="footer-text">
                <p>Thank you for choosing ProGst Solutions!</p>
                <p>For any queries, contact us at support@progst.com</p>
            </div>
            <div class="signature-area">
                <div class="sig-line"></div>
                <div class="sig-text">Authorized Signatory</div>
            </div>
        </div>
    </div>
</body>
</html>
