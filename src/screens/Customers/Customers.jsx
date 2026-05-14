import React, { useState, useEffect } from 'react';
import { Search, Plus, User, X, Phone, Mail, MapPin } from 'lucide-react';
import { getCustomers, api } from '../../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', gstin: '', address: '', city: '', state: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/customers', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', gstin: '', address: '', city: '', state: '' });
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert('Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container">Loading Customers...</div>;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.gstin && c.gstin.includes(searchTerm))
  );

  return (
    <div className="screen customers-screen">
      <header className="screen-header">
        <h1>Customers</h1>
        <button className="icon-btn-rounded" onClick={() => setIsModalOpen(true)}>+</button>
      </header>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search by name or GSTIN..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="customer-list">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="premium-card customer-item">
            <div className="customer-avatar">
              <User size={24} />
            </div>
            <div className="customer-info">
              <div className="customer-top">
                <h3 className="customer-name">{customer.name}</h3>
                {customer.gstin && <span className="gstin-badge">{customer.gstin}</span>}
              </div>
              <div className="customer-details">
                {customer.phone && <div className="detail-item"><Phone size={12} /> {customer.phone}</div>}
                {customer.email && <div className="detail-item"><Mail size={12} /> {customer.email}</div>}
                {(customer.city || customer.state) && (
                  <div className="detail-item">
                    <MapPin size={12} /> {customer.city}{customer.city && customer.state ? ', ' : ''}{customer.state}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && <div className="empty-state">No customers found</div>}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Customer</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCustomer} className="modal-form">
              <div className="form-group">
                <label>Customer Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>GSTIN (Optional)</label>
                <input type="text" value={formData.gstin} onChange={(e) => setFormData({...formData, gstin: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea rows="2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary full-width" disabled={saving}>
                {saving ? 'Saving...' : 'Save Customer'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .customers-screen { padding: 20px; padding-bottom: 100px; }
        .customer-list { display: flex; flex-direction: column; gap: 12px; }
        .customer-item { display: flex; gap: 16px; padding: 16px; align-items: center; }
        .customer-avatar { width: 48px; height: 48px; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary); }
        .customer-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .customer-top { display: flex; justify-content: space-between; align-items: center; }
        .customer-name { font-size: 15px; font-weight: 700; color: var(--text-main); }
        .gstin-badge { font-size: 10px; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: var(--text-muted); font-weight: 600; }
        .customer-details { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
        .detail-item { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { background: white; width: 100%; max-width: 450px; border-radius: 24px; padding: 24px; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-form { display: flex; flex-direction: column; gap: 16px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
        .form-group input, .form-group select, .form-group textarea { padding: 12px; border-radius: 10px; border: 1px solid var(--border); font-size: 14px; }
        .empty-state { text-align: center; color: var(--text-muted); padding: 40px; font-style: italic; }
      `}</style>
    </div>
  );
};

export default Customers;
