import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Wrench, 
  LineChart, 
  FileText, 
  Settings, 
  LogOut, 
  TrendingUp 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, businessName, onLogout, user }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Business Chat', icon: MessageSquare },
    { id: 'tools', label: 'Business Tools', icon: Wrench },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">B</div>
        <span className="logo-text">BizPilot AI</span>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-muted)' }}>Active Business:</div>
          <div style={{ fontWeight: '700', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {businessName || 'Create Profile'}
          </div>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
            <button 
              onClick={onLogout} 
              className="theme-toggle" 
              style={{ width: '32px', height: '32px', border: 'none' }}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
