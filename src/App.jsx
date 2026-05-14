import React, { useState, useEffect } from 'react';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './screens/Dashboard/Dashboard';
import Invoices from './screens/Invoices/Invoices';
import Products from './screens/Products/Products';
import Reports from './screens/Reports/Reports';
import Settings from './screens/Settings/Settings';
import Expenses from './screens/Expenses/Expenses';
import Login from './screens/Auth/Login';
import Register from './screens/Auth/Register';
import Customers from './screens/Customers/Customers';
import { logout } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setInitializing(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log('Logout API error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setAuthView('login');
    }
  };

  if (initializing) {
    return <div className="initializing">Loading ProGst...</div>;
  }

  if (!user) {
    return authView === 'login' ? (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onSwitchToRegister={() => setAuthView('register')} 
      />
    ) : (
      <Register 
        onRegisterSuccess={handleLoginSuccess} 
        onSwitchToLogin={() => setAuthView('login')} 
      />
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'invoices':
        return <Invoices />;
      case 'products':
        return <Products />;
      case 'expenses':
        return <Expenses />;
      case 'reports':
        return <Reports />;
      case 'customers':
        return <Customers />;
      case 'more':
        return <Settings onLogout={handleLogout} setActiveTab={setActiveTab} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <main className="content">
        {renderScreen()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <style jsx="true">{`
        .app-container {
          max-width: 500px;
          margin: 0 auto;
          background: var(--bg-main);
          min-height: 100vh;
          position: relative;
          box-shadow: 0 0 100px rgba(0,0,0,0.05);
        }
        .content {
          padding-bottom: 80px;
        }
        .initializing {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-weight: 700;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}

export default App;
