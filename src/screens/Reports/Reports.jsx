import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, Loader2 } from 'lucide-react';
import { getReportsData } from '../../services/api';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await getReportsData();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const reportsData = data || { gstData: [], summary: {} };

  return (
    <div className="screen reports-screen">
      <header className="screen-header">
        <h1>Reports</h1>
        <button className="icon-btn-rounded"><Download size={20} /></button>
      </header>

      <div className="report-tabs">
        <button>Sales</button>
        <button className="active">GST</button>
        <button>Profit</button>
      </div>

      <div className="date-range">
        <span>Real-time Summary</span>
      </div>

      <div className="stats-grid">
        <div className="premium-card mini-stat">
          <span className="label">Output GST</span>
          <span className="value">₹ {reportsData.outputGst?.toLocaleString()}</span>
        </div>
        <div className="premium-card mini-stat">
          <span className="label">Input GST</span>
          <span className="value">₹ {reportsData.inputGst?.toLocaleString()}</span>
        </div>
      </div>

      <div className="premium-card chart-card">
        <div className="pie-chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={reportsData.gstData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {reportsData.gstData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹ ${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
             {reportsData.gstData.map((item, i) => (
               <div key={i} className="legend-item">
                 <span className="dot" style={{backgroundColor: item.color}}></span>
                 <span className="name">{item.name}</span>
                 <span className="val">₹ {item.value.toLocaleString()}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="premium-card summary-card">
        <div className="summary-section">
          <h3>Business Summary</h3>
          <div className="summary-row">
            <span>Total Invoices</span>
            <span>{reportsData.summary.totalInvoices}</span>
          </div>
          <div className="summary-row">
            <span>Taxable Value</span>
            <span>₹ {reportsData.summary.taxableValue?.toLocaleString()}</span>
          </div>
        </div>
        <div className="divider"></div>
        <div className="summary-section">
          <h3>GST Summary</h3>
          <div className="summary-row">
            <span>Total Liability</span>
            <span>₹ {reportsData.summary.totalLiability?.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Net Payable</span>
            <span>₹ {reportsData.summary.netPayable?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button className="btn-primary full-width">Download Detailed Report</button>

      <style jsx="true">{`
        .reports-screen { padding: 20px; padding-bottom: 100px; }
        .report-tabs { display: flex; background: #f3f4f6; padding: 4px; border-radius: 12px; margin-bottom: 20px; }
        .report-tabs button { flex: 1; padding: 8px; border-radius: 8px; font-size: 14px; font-weight: 600; color: var(--text-muted); }
        .report-tabs button.active { background: var(--primary); color: white; }
        .date-range { text-align: right; font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .mini-stat { display: flex; flex-direction: column; gap: 4px; padding: 16px; }
        .mini-stat .label { font-size: 11px; color: var(--text-muted); }
        .mini-stat .value { font-size: 14px; font-weight: 700; }
        .pie-chart-container { display: flex; flex-direction: column; align-items: center; }
        .pie-legend { width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .legend-item .dot { width: 8px; height: 8px; border-radius: 50%; }
        .legend-item .name { color: var(--text-muted); flex: 1; }
        .legend-item .val { font-weight: 700; }
        .summary-card { margin-top: 20px; margin-bottom: 20px; padding: 16px; }
        .summary-section h3 { font-size: 14px; font-weight: 700; margin-bottom: 12px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: var(--text-muted); }
        .summary-row span:last-child { font-weight: 700; color: var(--text-main); }
        .divider { height: 1px; background: var(--border); margin: 16px 0; }
        .full-width { width: 100%; }
      `}</style>
    </div>
  );
};

export default Reports;
