import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronRight, FileText } from 'lucide-react';
import { getInvoices } from '../../services/api';
import CreateInvoice from './CreateInvoice';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await getInvoices();
        setInvoices(response.data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (isCreating) {
    return <CreateInvoice onBack={() => setIsCreating(false)} />;
  }

  if (loading) {
    return <div className="loading-container">Loading Invoices...</div>;
  }

  const filteredInvoices = invoices.filter(inv => {
    const customerName = inv.customer?.name || '';
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || inv.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="screen invoices-screen">
      <header className="screen-header">
        <h1>Invoices</h1>
        <button className="icon-btn-rounded" onClick={() => setIsCreating(true)}>+</button>
      </header>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search invoices..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-chips">
        {['All', 'Paid', 'Unpaid', 'Overdue'].map(f => (
          <button 
            key={f} 
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="invoice-list">
        {filteredInvoices.map((inv) => (
          <div key={inv.id} className="premium-card invoice-item">
            <div className="inv-icon">
              <FileText size={20} />
            </div>
            <div className="inv-details">
              <div className="inv-row">
                <span className="inv-id">{inv.invoice_number}</span>
                <span className="inv-amount">₹ {parseFloat(inv.total_amount).toLocaleString()}</span>
              </div>
              <div className="inv-row">
                <span className="inv-customer">{inv.customer?.name}</span>
                <span className={`badge badge-${inv.status.toLowerCase() === 'paid' ? 'success' : inv.status.toLowerCase() === 'overdue' ? 'danger' : 'warning'}`}>
                  {inv.status}
                </span>
              </div>
              <div className="inv-row">
                <span className="inv-date">{inv.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx="true">{`
        .invoices-screen {
          padding: 20px;
          padding-bottom: 100px;
        }
        .screen-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .screen-header h1 {
          font-size: 24px;
          font-weight: 700;
        }
        .icon-btn-rounded {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .search-bar {
          position: relative;
          margin-bottom: 16px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-bar input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: white;
          font-size: 14px;
        }
        .filter-chips {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .chip {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          background: white;
          border: 1px solid var(--border);
          white-space: nowrap;
        }
        .chip.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .invoice-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .invoice-item {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 16px;
        }
        .inv-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .inv-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .inv-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .inv-id {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
        }
        .inv-amount {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }
        .inv-customer {
          font-size: 12px;
          color: var(--text-muted);
        }
        .inv-date {
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Invoices;
