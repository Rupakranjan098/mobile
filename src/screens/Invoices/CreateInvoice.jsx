import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Plus, Trash2, Scan, Check, Package, X } from 'lucide-react';
import { getCustomers, getProducts, createInvoice } from '../../services/api';

const CreateInvoice = ({ onBack, onInvoiceCreated }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([getCustomers(), getProducts()]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  const addItem = (product) => {
    const existing = items.find(i => i.product_id === product.id);
    if (existing) {
      setItems(items.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i));
    } else {
      setItems([...items, { 
        product_id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        total: product.price,
        hsn: product.hsn
      }]);
    }
    setShowProductModal(false);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((acc, item) => acc + item.total, 0);
    const taxableAmount = subTotal;
    const cgst = taxableAmount * 0.09;
    const sgst = taxableAmount * 0.09;
    const total = taxableAmount + cgst + sgst;
    return { subTotal, taxableAmount, cgst, sgst, total };
  };

  const { subTotal, taxableAmount, cgst, sgst, total } = calculateTotals();

  const handleGenerateInvoice = async () => {
    if (!selectedCustomer) return alert('Please select a customer');
    if (items.length === 0) return alert('Please add at least one item');

    setLoading(true);
    try {
      const invoiceData = {
        customer_id: selectedCustomer.id,
        invoice_number: `INV-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        sub_total: subTotal,
        taxable_amount: taxableAmount,
        total_amount: total,
        status: 'Unpaid',
        items: items
      };

      await createInvoice(invoiceData);
      alert('Invoice Generated Successfully!');
      onInvoiceCreated();
    } catch (err) {
      console.error(err);
      alert('Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen create-invoice-screen">
      <header className="screen-header">
        <div className="header-left">
          <button onClick={onBack} className="back-btn"><ChevronLeft size={24} /></button>
          <h1>Create Invoice</h1>
        </div>
        <button className="icon-btn"><Scan size={20} /></button>
      </header>

      <div className="section-label">Customer Details</div>
      <div className="premium-card customer-card" onClick={() => setShowCustomerModal(true)} style={{ cursor: 'pointer' }}>
        {selectedCustomer ? (
          <div className="customer-info">
            <div className="customer-avatar"><User size={20} /></div>
            <div className="customer-details">
              <h3>{selectedCustomer.name}</h3>
              <p>{selectedCustomer.gstin || 'No GSTIN'}</p>
              <p>{selectedCustomer.city}, {selectedCustomer.state}</p>
            </div>
            <Check size={20} color="var(--primary)" />
          </div>
        ) : (
          <div className="placeholder-content">
            <User size={24} color="var(--text-muted)" />
            <span>Select Customer</span>
          </div>
        )}
      </div>

      <div className="section-header">
        <div className="section-label">Invoice Items</div>
        <button className="add-item-btn" onClick={() => setShowProductModal(true)}>
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="items-list">
        {items.map((item, idx) => (
          <div key={idx} className="premium-card item-card">
            <div className="item-main">
              <div className="item-icon"><Package size={20} /></div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>HSN: {item.hsn} | ₹{item.price} x {item.quantity}</p>
              </div>
              <div className="item-total">
                ₹ {item.total.toLocaleString()}
                <button onClick={() => removeItem(idx)} className="trash-btn"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="empty-state">No items added yet</div>}
      </div>

      {items.length > 0 && (
        <div className="price-summary">
          <div className="section-label">Price Details</div>
          <div className="premium-card price-details-card">
            <div className="price-row"><span>Sub Total</span><span>₹ {subTotal.toLocaleString()}</span></div>
            <div className="divider"></div>
            <div className="tax-grid">
              <div className="tax-item"><span>CGST (9%)</span><span>₹ {cgst.toLocaleString()}</span></div>
              <div className="tax-item"><span>SGST (9%)</span><span>₹ {sgst.toLocaleString()}</span></div>
            </div>
            <div className="total-row">
              <span>Total Amount</span>
              <span className="total-val">₹ {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <button 
        className="btn-primary full-width generate-btn" 
        onClick={handleGenerateInvoice}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Generate Invoice'}
      </button>

      {/* Modals */}
      {showCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Customer</h2>
              <button onClick={() => setShowCustomerModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {customers.map(c => (
                <div key={c.id} className="modal-item" onClick={() => { setSelectedCustomer(c); setShowCustomerModal(false); }}>
                  <div className="modal-item-info">
                    <strong>{c.name}</strong>
                    <span>{c.gstin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Product</h2>
              <button onClick={() => setShowProductModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {products.map(p => (
                <div key={p.id} className="modal-item" onClick={() => addItem(p)}>
                  <div className="modal-item-info">
                    <strong>{p.name}</strong>
                    <span>HSN: {p.hsn} | ₹{p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .create-invoice-screen { padding: 20px; background: #f9fafb; min-height: 100vh; }
        .customer-card { padding: 16px; margin-bottom: 20px; }
        .placeholder-content { display: flex; align-items: center; gap: 12px; justify-content: center; color: var(--text-muted); }
        .section-header { display: flex; justify-content: space-between; align-items: center; }
        .add-item-btn { font-size: 12px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 4px; border: none; background: none; cursor: pointer; }
        .empty-state { text-align: center; color: var(--text-muted); padding: 20px; font-style: italic; }
        .item-card { padding: 12px; margin-bottom: 12px; }
        .item-total { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .trash-btn { color: var(--danger); background: none; border: none; cursor: pointer; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; z-index: 1000; }
        .modal-content { background: white; width: 100%; max-width: 500px; margin: 0 auto; border-radius: 20px 20px 0 0; padding: 20px; max-height: 80vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-item { padding: 16px; border-bottom: 1px solid var(--border); cursor: pointer; }
        .modal-item-info { display: flex; flex-direction: column; gap: 4px; }
        .modal-item-info span { font-size: 12px; color: var(--text-muted); }
        .generate-btn { margin-top: 30px; height: 54px; }
        .tax-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .tax-item { display: flex; flex-direction: column; }
        .tax-item span:first-child { font-size: 11px; color: var(--text-muted); }
        .tax-item span:last-child { font-size: 14px; font-weight: 700; }
      `}</style>
    </div>
  );
};

export default CreateInvoice;
