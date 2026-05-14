<!DOCTYPE html>
<html>
<head>
    <title>{{ $type }} Report - ProGst</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
        .logo-section { display: flex; align-items: center; gap: 15px; }
        .logo-circle { width: 45px; height: 45px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
        .business-info { text-align: right; }
        h1 { color: #22c55e; margin: 0; font-size: 28px; letter-spacing: -0.5px; }
        .report-meta { color: #6b7280; font-size: 14px; margin-top: 5px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 40px 0; }
        .stat-card { background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .stat-label { font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
        .stat-value { font-size: 22px; font-weight: 800; margin-top: 8px; color: #111827; }
        
        h2 { font-size: 18px; margin-top: 40px; margin-bottom: 15px; color: #374151; border-left: 4px solid #22c55e; padding-left: 12px; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; }
        th { background: #f9fafb; text-align: left; padding: 14px; color: #4b5563; font-size: 13px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
        td { padding: 14px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
        tr:last-child td { border-bottom: none; }
        .amount { text-align: right; font-family: monospace; font-weight: 600; }
        
        .footer { margin-top: 80px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 11px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-green { background: #d1fae5; color: #065f46; }

        @media print {
            body { padding: 20px; }
            .stat-card { box-shadow: none; border: 1px solid #eee; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-section">
            <div class="logo-circle">G</div>
            <div>
                <h1>{{ strtoupper($type) }} REPORT</h1>
                <div class="report-meta">Generated on {{ date('d M Y, h:i A') }}</div>
            </div>
        </div>
        <div class="business-info">
            <strong style="font-size: 18px;">{{ $business->name ?? 'ProGst Business' }}</strong><br>
            <span style="color: #4b5563;">{{ $business->address ?? 'Address Not Set' }}</span><br>
            <span class="badge badge-green">GSTIN: {{ $business->gstin ?? 'N/A' }}</span>
        </div>
    </div>

    <div class="summary-grid">
        <div class="stat-card">
            <div class="stat-label">Total Invoices</div>
            <div class="stat-value">{{ $data['summary']['totalInvoices'] }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Taxable Value</div>
            <div class="stat-value">₹{{ number_format($data['summary']['taxableValue'], 2) }}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Net Liability</div>
            <div class="stat-value">₹{{ number_format($data['summary']['netPayable'], 2) }}</div>
        </div>
    </div>

    @if($type === 'GST' || $type === 'Dashboard')
    <h2>GST Analysis</h2>
    <table>
        <thead>
            <tr>
                <th>Tax Component</th>
                <th class="amount">Collected Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['gstData'] as $gst)
            <tr>
                <td>{{ $gst['name'] }}</td>
                <td class="amount">₹{{ number_format($gst['value'], 2) }}</td>
            </tr>
            @endforeach
            <tr style="background: #f9fafb; font-weight: bold;">
                <td>Total Output GST</td>
                <td class="amount">₹{{ number_format($data['summary']['totalLiability'], 2) }}</td>
            </tr>
        </tbody>
    </table>
    @endif

    @if($type === 'Expenses' || $type === 'Dashboard')
    <h2>Expense Breakdown</h2>
    <table>
        <thead>
            <tr>
                <th>Category</th>
                <th class="amount">Total Spending</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['expenseCategories'] as $cat)
            <tr>
                <td>{{ $cat['name'] }}</td>
                <td class="amount">₹{{ number_format($cat['value'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if($type === 'Sales' || $type === 'Dashboard')
    <h2>Customer Performance</h2>
    <table>
        <thead>
            <tr>
                <th>Customer Name</th>
                <th class="amount">Revenue Contribution</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['salesByCustomer'] as $cust)
            <tr>
                <td>{{ $cust['name'] }}</td>
                <td class="amount">₹{{ number_format($cust['value'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <div class="footer">
        <strong>ProGst Mobile Application</strong> • Secure GST & Business Management<br>
        This is a computer-generated document and does not require a physical signature.
    </div>
    
    <script>
        // Automatically trigger print dialog
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
