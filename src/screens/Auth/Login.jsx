import React, { useState } from 'react';
import { login } from '../../services/api';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-icon">
            <LogIn size={32} color="var(--primary)" />
          </div>
          <h1>Welcome Back</h1>
          <p>Login to your ProGst account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-actions">
            <button type="submit" className="btn-primary full-width" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <button onClick={onSwitchToRegister}>Register</button></p>
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
          gap: 20px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
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
          padding: 12px 12px 12px 40px;
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

export default Login;
