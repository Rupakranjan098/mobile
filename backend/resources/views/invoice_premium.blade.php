<!DOCTYPE html>
<html lang="en" class="notranslate">
<head>
    <meta name="google" content="notranslate">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <style>
        :root {
            --primary: #22c55e;
            --primary-light: #bcf0da;
            --primary-bg: #f0fdf4;
            --text-dark: #1f2937;
            --text-gray: #4b5563;
            --border: #e5e7eb;
        }
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: var(--text-dark);
            background-color: #fff;
            min-height: 100vh;
        }
        .invoice-container {
            width: 100%;
            max-width: 850px;
            margin: 0 auto;
            background: #fff;
            position: relative;
            min-height: 100vh;
        }
        @media (min-width: 851px) {
            body { background-color: #f3f4f6; padding: 40px 0; }
            .invoice-container { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); border-radius: 12px; min-height: auto; }
        }

        .company-header {
            background-color: var(--primary-light);
            padding: 40px 25px 30px;
            padding-top: max(50px, env(safe-area-inset-top));
            padding-left: max(25px, env(safe-area-inset-left));
            padding-right: max(25px, env(safe-area-inset-right));
            position: relative;
        }
        .logo-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .logo-row img { max-height: 45px; }
        .logo-row h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: -0.5px;
        }
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            font-size: 14px;
            font-weight: 500;
        }
        .contact-item { display: flex; align-items: center; gap: 10px; }

        .main-content {
            padding: 30px 25px;
            padding-left: max(25px, env(safe-area-inset-left));
            padding-right: max(25px, env(safe-area-inset-right));
        }

        .section-header {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--primary);
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .section-header::after {
            content: "";
            flex: 1;
            height: 2px;
            background: var(--primary-light);
        }

        .info-cards {
            display: grid;
            grid-template-columns: 1fr;
            gap: 25px;
            margin-bottom: 35px;
        }
        @media (min-width: 600px) {
            .info-cards { grid-template-columns: 1fr 1fr; }
        }

        .card h3 { margin: 0 0 8px; font-size: 18px; font-weight: 800; }
        .card p { margin: 4px 0; font-size: 14px; color: var(--text-gray); }

        .invoice-banner {
            background: #111827;
            color: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 35px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        .inv-title h2 { margin: 0; font-size: 20px; font-weight: 900; color: var(--primary); }
        .inv-dates { display: flex; gap: 25px; }
        .date-item span { display: block; font-size: 10px; text-transform: uppercase; opacity: 0.7; }
        .date-item strong { font-size: 14px; }

        .table-wrap {
            width: 100%;
            overflow-x: auto;
            margin-bottom: 35px;
            -webkit-overflow-scrolling: touch;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            min-width: 500px;
        }
        th {
            text-align: left;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 12px 10px;
            border-bottom: 2px solid var(--text-dark);
        }
        td {
            padding: 15px 10px;
            font-size: 14px;
            border-bottom: 1px solid var(--border);
        }
        .text-right { text-align: right; }

        .summary-wrap {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
            margin-bottom: 40px;
        }
        .summary-row {
            display: flex;
            width: 100%;
            max-width: 280px;
            justify-content: space-between;
            font-size: 14px;
        }
        .summary-row.total {
            margin-top: 10px;
            padding: 15px;
            background: var(--primary-bg);
            border-radius: 8px;
            font-size: 18px;
            font-weight: 900;
            color: var(--primary);
        }

        .footer-wrap {
            margin-top: auto;
            border-top: 1px solid var(--border);
            padding-top: 30px;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }
        @media (min-width: 600px) {
            .footer-wrap { flex-direction: row; justify-content: space-between; align-items: flex-end; }
        }

        .payment-box {
            background: var(--primary-bg);
            padding: 20px;
            border-radius: 8px;
            flex: 1;
        }
        .payment-box h4 { margin: 0 0 10px; font-size: 13px; font-weight: 800; }
        .payment-box p { margin: 3px 0; font-size: 12px; }

        .sig-box {
            text-align: center;
            width: 200px;
        }
        .sig-line { border-top: 2px solid #111827; padding-top: 8px; font-weight: 800; font-size: 14px; }

        @media print {
            body { padding: 0; background: #fff; }
            .invoice-container { width: 100%; max-width: none; box-shadow: none; margin: 0; }
            .no-print { display: none !important; }
        }

        /* Floating Print Button */
        .print-btn {
            position: fixed;
            bottom: 40px;
            right: 30px;
            background: var(--primary);
            color: #fff;
            width: 70px;
            height: 70px;
            border-radius: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 15px 35px rgba(34, 197, 94, 0.5);
            cursor: pointer;
            z-index: 99999;
            border: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            -webkit-tap-highlight-color: transparent;
        }
        .print-btn:active { transform: scale(0.85); box-shadow: 0 5px 15px rgba(34, 197, 94, 0.3); }
        .print-btn svg { width: 32px; height: 32px; display: block; }
        
        /* Glass ripple effect */
        .print-btn::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 35px;
            background: rgba(255, 255, 255, 0.2);
            opacity: 0;
            transition: all 0.5s;
        }
        .print-btn:active::after { opacity: 1; transform: scale(0); transition: 0s; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="company-header">
            <div class="logo-row">
                @if($business->logo_url)
                    <img src="{{ url($business->logo_url) }}" alt="Logo">
                @endif
                <h1>{{ $business->name }}</h1>
            </div>
            <div class="contact-grid">
                <div class="contact-item">📞 {{ $business->phone }}</div>
                <div class="contact-item">📍 {{ $business->address }}</div>
                <div class="contact-item">📧 {{ $business->email }}</div>
                <div class="contact-item"><strong>GSTIN:</strong> {{ $business->gstin }}</div>
            </div>
        </div>

        <div class="main-content">
            <div class="info-cards">
                <div class="card">
                    <div class="section-header">Bill To</div>
                    <h3>{{ $invoice->customer->name }}</h3>
                    <p>{{ $invoice->customer->address }}</p>
                    <p>{{ $invoice->customer->city }}, {{ $invoice->customer->state }}</p>
                    <p><strong>Phone:</strong> {{ $invoice->customer->phone }}</p>
                    <p><strong>GSTIN:</strong> {{ $invoice->customer->gstin ?: 'N/A' }}</p>
                </div>
            </div>

            <div class="invoice-banner">
                <div class="inv-title">
                    <span>Invoice Number</span>
                    <h2>#{{ str_replace('INV-', '', $invoice->invoice_number) }}</h2>
                </div>
                <div class="inv-dates">
                    <div class="date-item">
                        <span>Date Issued</span>
                        <strong>{{ \Carbon\Carbon::parse($invoice->date)->format('d M Y') }}</strong>
                    </div>
                    <div class="date-item">
                        <span>Due Date</span>
                        <strong>{{ \Carbon\Carbon::parse($invoice->date)->addDays(15)->format('d M Y') }}</strong>
                    </div>
                </div>
            </div>

            <div class="table-wrap">
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
                                    <strong>{{ $item->product->name }}</strong><br>
                                    <small style="color: var(--text-gray)">HSN: {{ $item->product->hsn }}</small>
                                </td>
                                <td class="text-right">₹{{ number_format($item->price, 2) }}</td>
                                <td class="text-right">{{ $item->quantity }}</td>
                                <td class="text-right">₹{{ number_format($item->total, 2) }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <div class="summary-wrap">
                <div class="summary-row">
                    <span style="color: var(--text-gray)">Taxable Amount</span>
                    <strong>₹{{ number_format($invoice->taxable_amount, 2) }}</strong>
                </div>
                <div class="summary-row">
                    <span style="color: var(--text-gray)">Total Tax</span>
                    <strong>₹{{ number_format($invoice->tax_amount, 2) }}</strong>
                </div>
                <div class="summary-row total">
                    <span>Total Due</span>
                    <span>₹{{ number_format($invoice->total_amount, 2) }}</span>
                </div>
            </div>

            <div class="footer-wrap">
                <div class="payment-box">
                    <h4>Payment Information</h4>
                    <p><strong>Bank:</strong> ProGst Business Bank</p>
                    <p><strong>Acc No:</strong> 0123 4567 8901</p>
                    <p><strong>IFSC:</strong> PROG0001234</p>
                </div>
                <div class="sig-box">
                    <div class="sig-line">Authorized Signatory</div>
                </div>
            </div>
        </div>
    </div>
    <button class="print-btn no-print" onclick="window.print()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231a1.125 1.125 0 0 1-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-14.326 0C3.768 7.44 3 8.375 3 9.456v6.294a2.25 2.25 0 0 0 2.25 2.25h1.091M15 7V4.5a2.25 2.25 0 0 0-2.25-2.25h-1.5A2.25 2.25 0 0 0 9 4.5V7m6 0h-6M9 7h6" />
        </svg>
    </button>

    <script>
        // Optional: Auto-trigger print on load if requested
        window.onload = function() {
            if (window.location.search.includes('auto=true')) {
                window.print();
            }
        };
    </script>
</body>
</html>
