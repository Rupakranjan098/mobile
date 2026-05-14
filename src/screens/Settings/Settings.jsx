import React, { useState, useEffect } from 'react';
import { User as UserIcon, Briefcase, Users, RefreshCw, CreditCard, Bell, Settings as SettingsIcon, HelpCircle, LogOut, ChevronRight, Moon, Sun, Wallet, BarChart2 } from 'lucide-react';
import { getBusinessProfile, updateBusinessProfile, getMe, updateProfile, getSubscriptionPlans, subscribe } from '../../services/api';

const SettingsItem = ({ icon: Icon, label, value, color = "var(--text-muted)", onClick }) => (
  <div className="settings-item" onClick={onClick}>
    <div className="settings-icon-label">
      <Icon size={20} color={color} />
      <span>{label}</span>
    </div>
    <div className="settings-value-arrow">
      {value && <span className="settings-value">{value}</span>}
      <ChevronRight size={18} color="#9ca3af" />
    </div>
  </div>
);

const Settings = ({ onLogout, setActiveTab }) => {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isViewingPlans, setIsViewingPlans] = useState(false);
  const [isViewingSupport, setIsViewingSupport] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isEditingNotifs, setIsEditingNotifs] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', gstin: '', address: '' });
  const [accountFormData, setAccountFormData] = useState({ name: '', email: '', password: '' });
  const [appSettings, setAppSettings] = useState({ email_notifications: true, push_notifications: true, language: 'en', theme: 'light' });
  const [plans, setPlans] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [supportContact, setSupportContact] = useState(null);

  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme');
    setIsDark(theme === 'dark');
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, profileRes, plansRes, settingsRes, faqRes, supportRes] = await Promise.all([
        getMe(),
        getBusinessProfile(),
        getSubscriptionPlans(),
        getAppSettings(),
        getFAQs(),
        getSupportContact()
      ]);
      
      setUser(userRes.data);
      setAccountFormData({ name: userRes.data.name, email: userRes.data.email, password: '' });
      localStorage.setItem('user', JSON.stringify(userRes.data));

      setProfile(profileRes.data);
      setFormData({ name: profileRes.data.name, gstin: profileRes.data.gstin, address: profileRes.data.address });
      
      setPlans(plansRes.data);
      setAppSettings(settingsRes.data);
      setFaqs(faqRes.data);
      setSupportContact(supportRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (newData) => {
    try {
      setLoading(true);
      const res = await updateAppSettings(newData);
      setAppSettings(res.data.settings);
    } catch (error) {
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);
      const res = await subscribe(planId);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsViewingPlans(false);
      alert(`Subscribed to ${res.data.user.subscription_plan?.name} successfully!`);
    } catch (error) {
      alert('Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    setIsDark(!isDark);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('logo', file);
    data.append('name', profile.name);

    try {
      setLoading(true);
      const res = await updateBusinessProfile(data);
      setProfile(res.data);
    } catch (error) {
      alert('Failed to upload logo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await updateBusinessProfile(formData);
      setProfile(res.data);
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await updateProfile(accountFormData);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsEditingAccount(false);
    } catch (error) {
      alert('Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      const res = await syncData();
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Cloud Backup & Sync completed successfully!');
    } catch (error) {
      alert('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const formatLastSync = (dateString) => {
    if (!dateString) return 'Never synced';
    const date = new Date(dateString);
    return `Last sync: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const logoUrl = profile?.logo_url 
    ? `http://localhost/ProGst/backend/public${profile.logo_url}`
    : `https://ui-avatars.com/api/?name=${profile?.name || 'Business'}&background=22c55e&color=fff`;

  if (loading && !profile) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="screen settings-screen">
      <header className="screen-header">
        <h1>Settings</h1>
      </header>

      <div className="premium-card profile-card">
        <div className="profile-info">
          <div className="profile-avatar" onClick={() => document.getElementById('logo-input').click()}>
            <img src={logoUrl} alt="Logo" />
            <div className="avatar-edit-hint">Change</div>
            <input type="file" id="logo-input" hidden onChange={handleLogoUpload} accept="image/*" />
          </div>
          <div className="profile-details">
            <h3>{profile?.name || 'Business Name'}</h3>
            <p>{profile?.gstin || 'No GSTIN set'}</p>
          </div>
        </div>
        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing && (
        <form className="premium-card edit-form" onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Business Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>GSTIN</label>
            <input 
              type="text" 
              value={formData.gstin} 
              onChange={e => setFormData({...formData, gstin: e.target.value})} 
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      )}

      {isEditingAccount && (
        <form className="premium-card edit-form" onSubmit={handleUpdateAccount}>
          <h3>Account Details</h3>
          <div className="form-group">
            <label>Your Name</label>
            <input 
              type="text" 
              value={accountFormData.name} 
              onChange={e => setAccountFormData({...accountFormData, name: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={accountFormData.email} 
              onChange={e => setAccountFormData({...accountFormData, email: e.target.value})} 
              required 
            />
          </div>
          <div className="form-group">
            <label>New Password (Optional)</label>
            <input 
              type="password" 
              value={accountFormData.password} 
              onChange={e => setAccountFormData({...accountFormData, password: e.target.value})} 
              placeholder="Leave blank to keep current"
            />
          </div>
          <div className="flex-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsEditingAccount(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Update Account</button>
          </div>
        </form>
      )}

      {isViewingPlans && (
        <div className="premium-card plans-view">
          <div className="view-header">
            <h3>Choose Your Plan</h3>
            <button className="text-btn" onClick={() => setIsViewingPlans(false)}>Back to Settings</button>
          </div>
          <div className="plans-grid">
            {plans.map(plan => (
              <div key={plan.id} className={`plan-card ${user?.subscription_plan_id === plan.id ? 'active' : ''}`}>
                <div className="plan-header">
                  <h4>{plan.name}</h4>
                  {user?.subscription_plan_id === plan.id && <span className="active-badge">Active</span>}
                </div>
                <div className="plan-price">
                  ₹{parseFloat(plan.price).toLocaleString()}
                  <span className="duration"> / {plan.duration_months} mo</span>
                </div>
                <p className="plan-desc">{plan.description}</p>
                <ul className="features-list">
                  {JSON.parse(plan.features || '[]').map((f, i) => (
                    <li key={i}>✅ {f}</li>
                  ))}
                </ul>
                <button 
                  className={`btn-primary ${user?.subscription_plan_id === plan.id ? 'disabled' : ''}`}
                  disabled={user?.subscription_plan_id === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {user?.subscription_plan_id === plan.id ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="settings-group">
        <SettingsItem icon={Wallet} label="Expenses Management" onClick={() => setActiveTab('expenses')} />
        <SettingsItem icon={BarChart2} label="Financial Reports" onClick={() => setActiveTab('reports')} />
        <SettingsItem icon={Briefcase} label="Business Profile" onClick={() => setIsEditing(true)} />
        <SettingsItem icon={Users} label="Account Details" value={user?.name} onClick={() => setIsEditingAccount(true)} />
        <SettingsItem 
          icon={RefreshCw} 
          label="Backup & Sync" 
          value={formatLastSync(user?.last_sync_at)} 
          onClick={handleSync}
        />
        <SettingsItem 
          icon={CreditCard} 
          label="Subscription" 
          value={user?.subscription_plan?.name || 'Free Plan'} 
          color="var(--primary)" 
          onClick={() => setIsViewingPlans(true)}
        />
      </div>

      <div className="settings-group">
        <SettingsItem icon={Bell} label="Notification Settings" />
        <SettingsItem icon={SettingsIcon} label="App Settings" />
        <SettingsItem 
          icon={isDark ? Sun : Moon} 
          label={isDark ? "Light Mode" : "Dark Mode"} 
          onClick={toggleTheme}
          value={isDark ? "On" : "Off"}
        />
      </div>

      <div className="settings-group">
        <SettingsItem icon={HelpCircle} label="Help & Support" />
        <div className="settings-item logout" onClick={onLogout}>
          <div className="settings-icon-label">
            <LogOut size={20} color="var(--danger)" />
            <span style={{color: 'var(--danger)', fontWeight: '600'}}>Logout</span>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .settings-screen {
          padding: 20px;
          padding-bottom: 100px;
        }
        .screen-header {
          margin-bottom: 24px;
        }
        .screen-header h1 {
          font-size: 24px;
          font-weight: 700;
        }
        .profile-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          margin-bottom: 24px;
        }
        .profile-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .profile-avatar {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 2px solid var(--border);
        }
        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-edit-hint {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0,0,0,0.6);
          color: white;
          font-size: 10px;
          text-align: center;
          padding: 2px 0;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .profile-avatar:hover .avatar-edit-hint {
          opacity: 1;
        }
        .edit-btn {
          background: #f3f4f6;
          border: 1px solid var(--border);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .edit-form {
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }
        .form-group input, .form-group textarea {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid var(--border);
          font-size: 14px;
          background: #f9fafb;
        }
        .form-group textarea {
          height: 80px;
          resize: none;
        }
        .flex-actions {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }
        .btn-secondary {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: #f3f4f6;
          font-weight: 600;
          cursor: pointer;
        }
        .plans-view {
          padding: 24px;
          margin-bottom: 24px;
        }
        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .plan-card {
          background: #f9fafb;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s;
        }
        .plan-card.active {
          border: 2px solid var(--primary);
          background: #f0fdf4;
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .plan-header h4 {
          font-size: 18px;
          font-weight: 800;
        }
        .active-badge {
          background: var(--primary);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }
        .plan-price {
          font-size: 28px;
          font-weight: 900;
        }
        .plan-price .duration {
          font-size: 14px;
          font-weight: 400;
          color: var(--text-muted);
        }
        .plan-desc {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .features-list {
          list-style: none;
          padding: 0;
          margin: 10px 0;
          flex-grow: 1;
        }
        .features-list li {
          font-size: 13px;
          margin-bottom: 8px;
          font-weight: 500;
        }
        .btn-primary.disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .profile-details h3 {
          font-size: 18px;
          font-weight: 800;
        }
        .profile-details p {
          font-size: 12px;
          color: var(--text-muted);
        }
        .settings-group {
          background: white;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow: hidden;
          margin-bottom: 20px;
        }
        .settings-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .settings-item:last-child {
          border-bottom: none;
        }
        .settings-item:hover {
          background: #f9fafb;
        }
        .settings-icon-label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
        }
        .settings-value-arrow {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .settings-value {
          font-size: 12px;
          color: var(--text-muted);
        }
        .logout {
          border-top: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
};

export default Settings;
