import React, { useState } from 'react';
import { register } from '../../services/api';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    try {
      const response = await register(formData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onRegisterSuccess(response.data.user);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data);
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-icon">
            <UserPlus size={32} color="var(--primary)" />
          </div>
          <h1>Create Account</h1>
          <p>Start managing your GST professionally</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input 
                name="name"
                type="text" 
                placeholder="Enter your name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            {errors.name && <span className="field-error">{errors.name[0]}</span>}
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                name="email"
                type="email" 
                placeholder="Enter your email" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            {errors.email && <span className="field-error">{errors.email[0]}</span>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                name="password"
                type="password" 
                placeholder="Create a password" 
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            {errors.password && <span className="field-error">{errors.password[0]}</span>}
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                name="password_confirmation"
                type="password" 
                placeholder="Confirm your password" 
                value={formData.password_confirmation}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <button onClick={onSwitchToLogin}>Sign In</button></p>
        </div>
      </div>

      <style jsx="true">{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          background: #f8fafc;
        }
        .auth-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .logo-icon {
          width: 64px;
          height: 64px;
          background: var(--primary-light);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .auth-header h1 {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 8px;
        }
        .auth-header p {
          color: var(--text-muted);
          font-size: 14px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .input-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }
        .input-wrapper input {
          width: 100%;
          padding: 10px 12px 10px 40px;
          border: 1px solid var(--border);
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.2s;
        }
        .input-wrapper input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
        }
        .error-message {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          text-align: center;
        }
        .field-error {
          color: #b91c1c;
          font-size: 11px;
          font-weight: 500;
        }
        .auth-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          color: var(--text-muted);
        }
        .auth-footer button {
          color: var(--primary);
          font-weight: 700;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;
