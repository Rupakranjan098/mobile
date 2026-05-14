import { Home, FileText, Package, Users, MoreHorizontal } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'invoices', icon: FileText, label: 'Invoices' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'more', icon: MoreHorizontal, label: 'More' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
      <style jsx="true">{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: var(--bg-card);
          display: flex;
          justify-content: space-around;
          align-items: center;
          border-top: 1px solid var(--border);
          padding-bottom: env(safe-area-inset-bottom);
          z-index: 1000;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          transition: all 0.2s ease;
          width: 20%;
        }
        .nav-item span {
          font-size: 10px;
          font-weight: 500;
        }
        .nav-item.active {
          color: var(--primary);
        }
        .nav-item.active span {
          font-weight: 700;
        }
      `}</style>
    </nav>
  );
};

export default BottomNav;
