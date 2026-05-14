import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, X } from 'lucide-react';
import { getProducts, api } from '../../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', hsn: '', price: '', stock: '', status: 'In Stock' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/products', formData);
      setIsModalOpen(false);
      setFormData({ name: '', hsn: '', price: '', stock: '', status: 'In Stock' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container">Loading Products...</div>;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.hsn.includes(searchTerm)
  );

  return (
    <div className="screen products-screen">
      <header className="screen-header">
        <h1>Products</h1>
        <button className="icon-btn-rounded" onClick={() => setIsModalOpen(true)}>+</button>
      </header>

      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="product-list">
        {filteredProducts.map((product) => (
          <div key={product.id} className="premium-card product-item">
            <div className="product-image">
              <Package size={24} />
            </div>
            <div className="product-info">
              <div className="product-top">
                <h3 className="product-name">{product.name}</h3>
                <span className="product-stock-count">{product.stock} units</span>
              </div>
              <div className="product-mid">
                <span className="product-hsn">HSN: {product.hsn}</span>
              </div>
              <div className="product-bottom">
                <span className="product-price">₹ {parseFloat(product.price).toLocaleString()}</span>
                <span className={`badge badge-${product.status.toLowerCase().replace(' ', '-') === 'in-stock' ? 'success' : product.status.toLowerCase() === 'low stock' ? 'warning' : 'danger'}`}>
                  {product.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && <div className="empty-state">No products found</div>}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Product</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="modal-form">
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>HSN Code</label>
                <input type="text" required value={formData.hsn} onChange={(e) => setFormData({...formData, hsn: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Initial Stock</label>
                <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <button type="submit" className="btn-primary full-width" disabled={saving}>
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .products-screen { padding: 20px; padding-bottom: 100px; }
        .product-list { display: flex; flex-direction: column; gap: 12px; }
        .product-item { display: flex; gap: 16px; padding: 16px; }
        .product-image { width: 60px; height: 60px; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
        .product-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .product-top { display: flex; justify-content: space-between; align-items: center; }
        .product-name { font-size: 14px; font-weight: 700; }
        .product-stock-count { font-size: 12px; font-weight: 600; color: var(--text-muted); }
        .product-hsn { font-size: 11px; color: var(--text-muted); }
        .product-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
        .product-price { font-size: 14px; font-weight: 700; color: var(--text-main); }
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

export default Products;
