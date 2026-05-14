import React, { useState, useEffect } from 'react';
import { Bell, User, TrendingUp, TrendingDown, ChevronRight, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardData } from '../../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
        
        const response = await getDashboardData();
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const dashboardData = data || { stats: [], salesChart: [] };
  const userName = user?.name?.split(' ')[0] || 'User';

  return (
    <div className="screen dashboard-screen">
      <header className="dashboard-header">
        <div className="user-info">
          <div className="welcome-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>Hello, {userName} 👋</h1>
            {user?.subscription_plan && (
              <span className="plan-badge">{user.subscription_plan.name}</span>
            )}
          </div>
          <p>Here's what's happening with your business</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn"><Bell size={20} /></button>
          <div className="avatar">
             <img src={`https://ui-avatars.com/api/?name=${userName}&background=22c55e&color=fff`} alt="User" />
          </div>
        </div>
      </header>

      <div className="date-selector">
        <button className="active">Real-time Insights</button>
      </div>

      <div className="stats-grid">
        {dashboardData.stats.map((stat, i) => (
          <div key={i} className="premium-card stat-card">
            <div className="stat-header">
              <span className={`stat-icon-wrapper type-${stat.type}`}>
                 {stat.type === 'sales' && <TrendingUp size={16} />}
                 {stat.type === 'invoices' && <TrendingUp size={16} />}
                 {stat.type === 'gst' && <TrendingUp size={16} />}
                 {stat.type === 'outstanding' && <TrendingDown size={16} />}
              </span>
            </div>
            <span className="stat-label">{stat.label}</span>
            <h2 className="stat-value">
              {stat.type !== 'invoices' ? '₹ ' : ''}
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </h2>
            <span className={`stat-trend ${stat.trend.startsWith('+') ? 'up' : 'down'}`}>
              {stat.trend}
            </span>
          </div>
        ))}
      </div>

      <div className="premium-card chart-card">
        <div className="card-header">
          <h3>Sales Overview</h3>
          <button className="filter-btn">Recent <ChevronRight size={16} /></button>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dashboardData.salesChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
              <Tooltip 
                formatter={(value) => [`₹ ${value.toLocaleString()}`, 'Sales']}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#22c55e" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-sections">
        <div className="premium-card recent-invoices">
          <div className="card-header">
            <h3>Recent Invoices</h3>
            <button className="text-btn">View All</button>
          </div>
          <div className="list">
            {dashboardData.recentInvoices?.map((invoice) => (
              <div key={invoice.id} className="list-item">
                <div className="item-main">
                  <span className="item-title">{invoice.customer?.name || 'Walk-in'}</span>
                  <span className="item-sub">{new Date(invoice.date).toLocaleDateString()}</span>
                </div>
                <div className="item-meta">
                  <span className="item-value">₹{parseFloat(invoice.total_amount).toLocaleString()}</span>
                  <span className={`status-pill ${invoice.status?.toLowerCase()}`}>{invoice.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="premium-card stock-alerts">
          <div className="card-header">
            <h3>Inventory Alerts</h3>
            <span className="badge">{dashboardData.lowStockProducts?.length || 0} items</span>
          </div>
          <div className="list">
            {dashboardData.lowStockProducts?.map((product) => (
              <div key={product.id} className="list-item">
                <div className="item-main">
                  <span className="item-title">{product.name}</span>
                  <span className="item-sub">Stock: {product.stock} {product.unit}</span>
                </div>
                <span className={`stock-label ${product.stock === 0 ? 'out' : 'low'}`}>
                  {product.stock === 0 ? 'Out' : 'Low'}
                </span>
              </div>
            ))}
            {!dashboardData.lowStockProducts?.length && (
              <div className="empty-msg">All products well stocked! ✅</div>
            )}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .dashboard-screen { padding: 20px; padding-bottom: 100px; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .user-info h1 { font-size: 20px; font-weight: 700; color: var(--text-main); }
        .user-info p { font-size: 13px; color: var(--text-muted); }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 2px solid var(--primary-light); }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .plan-badge { background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; border: 1px solid #86efac; }
        .date-selector { margin-bottom: 20px; }
        .date-selector button { background: #fff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; border: 1px solid var(--border); }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { display: flex; flex-direction: column; gap: 4px; padding: 16px; }
        .stat-icon-wrapper { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
        .type-sales { background: #dbeafe; color: #1e40af; }
        .type-invoices { background: #dcfce7; color: #15803d; }
        .type-gst { background: #fef3c7; color: #b45309; }
        .type-outstanding { background: #fee2e2; color: #b91c1c; }
        .stat-label { font-size: 12px; color: var(--text-muted); }
        .stat-value { font-size: 18px; font-weight: 700; color: var(--text-main); }
        .stat-trend.up { color: var(--success); font-size: 11px; font-weight: 600; }
        .stat-trend.down { color: var(--danger); font-size: 11px; font-weight: 600; }
        .chart-card { padding: 20px; margin-bottom: 20px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-header h3 { font-size: 16px; font-weight: 700; }
        .filter-btn { font-size: 12px; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; border: none; background: none; cursor: pointer; }
        .chart-container { margin-left: -20px; }
        
        .bottom-sections { display: flex; flex-direction: column; gap: 20px; }
        .text-btn { background: none; border: none; color: var(--primary); font-size: 12px; font-weight: 700; cursor: pointer; }
        .list-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .list-item:last-child { border-bottom: none; }
        .item-main { display: flex; flex-direction: column; gap: 2px; }
        .item-title { font-size: 14px; font-weight: 600; }
        .item-sub { font-size: 11px; color: var(--text-muted); }
        .item-meta { text-align: right; display: flex; flex-direction: column; gap: 2px; }
        .item-value { font-size: 14px; font-weight: 700; }
        .status-pill { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
        .status-pill.paid { background: #dcfce7; color: #15803d; }
        .status-pill.pending { background: #fef3c7; color: #b45309; }
        .badge { background: #fee2e2; color: #b91c1c; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; }
        .stock-label { font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
        .stock-label.low { background: #fff7ed; color: #c2410c; }
        .stock-label.out { background: #fef2f2; color: #991b1b; }
        .empty-msg { text-align: center; padding: 20px; color: var(--text-muted); font-size: 13px; }
      `}</style>
    </div>
  );
};

export default Dashboard;
