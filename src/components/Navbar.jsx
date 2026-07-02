import React from 'react';
import { Sun, Moon, Globe } from 'lucide-react';

export default function Navbar({ activeTab, theme, toggleTheme, language, setLanguage, industry }) {
  const titles = {
    dashboard: 'Business Dashboard',
    chat: 'AI Advisor Chat',
    tools: 'Business Strategy Tools',
    analytics: 'Analytics & Projections',
    reports: 'Report Archive',
    settings: 'System Settings'
  };

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' }
  ];

  return (
    <header className="navbar">
      <div className="navbar-title">
        {titles[activeTab] || 'BizPilot AI'}
      </div>
      
      <div className="navbar-actions">
        {industry && (
          <span className="business-badge">
            {industry}
          </span>
        )}

        <div style={{ display: 'flex', gap: '8px', borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              style={{
                background: 'transparent',
                border: 'none',
                color: language === lang.code ? 'var(--accent-primary)' : 'var(--text-muted)',
                fontWeight: language === lang.code ? '700' : '400',
                cursor: 'pointer',
                fontSize: '0.85rem',
                padding: '4px 8px'
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button 
          onClick={toggleTheme} 
          className="theme-toggle" 
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
