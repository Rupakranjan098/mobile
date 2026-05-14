import React, { useState, useEffect } from 'react';
import { Home, Lightbulb, Wifi, Train, PenTool, Plus, Loader2, X } from 'lucide-react';
import { getExpenses, api } from '../../services/api';

const categoryIcons = {
  'Office': Home,
  'Utilities': Lightbulb,
  'Internet': Wifi,
  'Travel': Train,
  'Others': PenTool
};

const categoryColors = {
  'Office': '#f59e0b',
  'Utilities': '#fbbf24',
  'Internet': '#3b82f6',
  'Travel': '#ef4444',
  'Others': '#6366f1'
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', date: '', category: 'Others' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await getExpenses();
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/expenses', formData);
      setIsModalOpen(false);
      setFormData({ name: '', amount: '', date: '', category: 'Others' });
      fetchExpenses();
    } catch (err) {
      console.error(err);
      alert('Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container">Loading Expenses...</div>;

  return (
    <div className="screen expenses-screen">
      <header className="screen-header">
        <h1>Expenses</h1>
        <button className="icon-btn-rounded" onClick={() => setIsModalOpen(true)}>+</button>
      </header>

      <div className="report-tabs">
        <button className="active">All</button>
        <button>Business</button>
        <button>Personal</button>
      </div>

      <div className="expense-list">
        {expenses.map((exp) => {
          const Icon = categoryIcons[exp.category] || PenTool;
          const color = categoryColors[exp.category] || '#6366f1';
          return (
            <div key={exp.id} className="premium-card expense-item">
              <div className="exp-icon" style={{ backgroundColor: color + '20', color: color }}>
                <Icon size={20} />
              </div>
              <div className="exp-details">
                <div className="exp-row">
                  <h3 className="exp-name">{exp.name}</h3>
                  <span className="exp-amount">₹ {parseFloat(exp.amount).toLocaleString()}</span>
                </div>
                <div className="exp-row">
                  <span className="exp-date">{exp.date}</span>
                  <span className="badge badge-success">{exp.category}</span>
                </div>
              </div>
            </div>
          );
        })}
        {expenses.length === 0 && <div className="empty-state">No expenses found</div>}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Expense</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="modal-form">
              <div className="form-group">
                <label>Expense Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option value="Office">Office</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Internet">Internet</option>
                  <option value="Travel">Travel</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <button type="submit" className="btn-primary full-width" disabled={saving}>
                {saving ? 'Saving...' : 'Save Expense'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .expenses-screen { padding: 20px; padding-bottom: 100px; }
        .expense-list { display: flex; flex-direction: column; gap: 12px; }
        .expense-item { display: flex; gap: 16px; align-items: center; padding: 16px; }
        .exp-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .exp-details { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .exp-row { display: flex; justify-content: space-between; align-items: center; }
        .exp-name { font-size: 14px; font-weight: 700; }
        .exp-amount { font-size: 14px; font-weight: 700; }
        .exp-date { font-size: 11px; color: var(--text-muted); }
        .report-tabs { display: flex; background: #f3f4f6; padding: 4px; border-radius: 12px; margin-bottom: 24px; }
        .report-tabs button { flex: 1; padding: 8px; border-radius: 8px; font-size: 14px; font-weight: 600; color: var(--text-muted); }
        .report-tabs button.active { background: var(--primary); color: white; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { background: white; width: 100%; max-width: 400px; border-radius: 20px; padding: 24px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-form { display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
        .form-group input, .form-group select { padding: 10px; border-radius: 8px; border: 1px solid var(--border); }
        .empty-state { text-align: center; color: var(--text-muted); padding: 40px; font-style: italic; }
      `}</style>
    </div>
  );
};

export default Expenses;
