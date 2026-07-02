import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardHome from './pages/DashboardHome';
import BusinessChat from './pages/BusinessChat';
import BusinessTools from './pages/BusinessTools';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { authService, databaseService } from './utils/firebase';
import { Lock, Mail, User, Compass, RefreshCw } from 'lucide-react';

// Translation strings Map
const translations = {
  en: {
    dashboard_title: "Business Dashboard",
    kpi_revenue: "Revenue Forecast",
    kpi_sales: "Sales Projected",
    kpi_customers: "Client Count",
    kpi_conversion: "Conversion Rate",
    kpi_profit_margin: "Profit Margin",
    kpi_expenses: "Costs/Expenses",
    chat_nav: "Advisor Chat",
    tools_nav: "AI Strategy Suite",
    analytics_nav: "Forecasting & Trends",
    reports_nav: "Generated Reports",
    settings_nav: "Configurations",
    valuation_calc: "Startup Valuation",
    theme_dark: "Dark Mode",
    theme_light: "Light Mode",
    welcome: "Welcome back, {name}"
  },
  es: {
    dashboard_title: "Tablero de Negocios",
    kpi_revenue: "Previsión de Ingresos",
    kpi_sales: "Ventas Proyectadas",
    kpi_customers: "Total Clientes",
    kpi_conversion: "Tasa de Conversión",
    kpi_profit_margin: "Margen de Beneficio",
    kpi_expenses: "Costos/Gastos",
    chat_nav: "Chat de Asesor",
    tools_nav: "Suite de Estrategia AI",
    analytics_nav: "Pronósticos y Tendencias",
    reports_nav: "Informes Archivados",
    settings_nav: "Ajustes del Sistema",
    valuation_calc: "Valoración de Startup",
    theme_dark: "Modo Oscuro",
    theme_light: "Modo Claro",
    welcome: "Bienvenido, {name}"
  },
  fr: {
    dashboard_title: "Tableau de Bord",
    kpi_revenue: "Prévision des Ventes",
    kpi_sales: "Ventes Projetées",
    kpi_customers: "Nombre de Clients",
    kpi_conversion: "Taux de Conversion",
    kpi_profit_margin: "Marge Bénéficiaire",
    kpi_expenses: "Coûts et Dépenses",
    chat_nav: "Conseiller AI Chat",
    tools_nav: "Outils Stratégiques AI",
    analytics_nav: "Prévisions & Tendances",
    reports_nav: "Informes Enregistrés",
    settings_nav: "Configuration Système",
    valuation_calc: "Valorisation Startup",
    theme_dark: "Mode Sombre",
    theme_light: "Mode Clair",
    welcome: "Bienvenue, {name}"
  }
};

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // App Layout State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');
  const [businessProfile, setBusinessProfile] = useState({
    name: '', industry: '', size: '', target: '', valueProp: ''
  });
  const [apiKey, setApiKey] = useState('');

  // Load Initial Settings & Profile
  useEffect(() => {
    // Current user checks
    const user = authService.getCurrentUser();
    if (user) setCurrentUser(user);

    // Business profile loading
    const prof = databaseService.getProfile();
    if (prof) setBusinessProfile(prof);

    // API Key checking
    const savedKey = localStorage.getItem('bizpilot_gemini_key') || '';
    setApiKey(savedKey);

    // Theme config loading
    const savedTheme = localStorage.getItem('bizpilot_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    }
  }, []);

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('bizpilot_theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  // Translation Helper
  const translate = (key, replacements = {}) => {
    const langDict = translations[language] || translations.en;
    let text = langDict[key] || translations.en[key] || key;
    
    Object.keys(replacements).forEach(replaceKey => {
      text = text.replace(`{${replaceKey}}`, replacements[replaceKey]);
    });
    return text;
  };

  // Auth submits
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    try {
      if (authTab === 'login') {
        const user = await authService.signIn(email, password);
        setCurrentUser(user);
      } else {
        if (!name.trim()) {
          throw new Error("Name field is required.");
        }
        const user = await authService.signUp(email, password, name.trim());
        setCurrentUser(user);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Quick Demo Access login
  const handleDemoLogin = () => {
    setEmail('demo@bizpilot.ai');
    setPassword('password123');
    setAuthTab('login');
    // Settle brief timeout to let state sync, then trigger click
    setTimeout(() => {
      authService.signIn('demo@bizpilot.ai', 'password123')
        .then(user => setCurrentUser(user))
        .catch(err => setAuthError(err.message));
    }, 100);
  };

  const handleLogout = () => {
    authService.signOut().then(() => {
      setCurrentUser(null);
      setEmail('');
      setPassword('');
      setName('');
    });
  };

  // Login/Signup splash screen
  if (!currentUser) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        background: 'radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 1) 0%, rgba(8, 12, 20, 1) 90.2%)',
        padding: '24px',
        overflowY: 'auto'
      }}>
        <div className="glass-card fade-in" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
          
          {/* Logo Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div className="logo-icon" style={{ width: '48px', height: '48px', fontSize: '1.5rem', borderRadius: '12px' }}>B</div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BizPilot AI</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Your intelligent strategy, forecasting, and advisory board powered by Gemini AI
            </p>
          </div>

          {/* Tab Selector */}
          <div className="tab-header" style={{ marginBottom: '24px' }}>
            <button 
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
              className={`tab-btn ${authTab === 'login' ? 'active' : ''}`}
              style={{ flex: 1 }}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setAuthTab('signup'); setAuthError(''); }}
              className={`tab-btn ${authTab === 'signup' ? 'active' : ''}`}
              style={{ flex: 1 }}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {authTab === 'signup' && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Jane Founder" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="jane@company.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            {authError && (
              <div style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', textAlign: 'center', marginTop: '4px' }}>
                {authError}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isAuthLoading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              {isAuthLoading ? <RefreshCw className="animate-spin" size={16} /> : (authTab === 'login' ? 'Sign In' : 'Register Account')}
            </button>
          </form>

          {/* Quick Demo Access Trigger */}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button 
              onClick={handleDemoLogin} 
              className="btn btn-secondary" 
              style={{ width: '100%', gap: '8px', fontSize: '0.85rem' }}
            >
              <Compass size={16} /> Explore Demo Sandbox (One-Click)
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Dashboard Frame Layout
  return (
    <div className="app-container">
      {/* Sidebar Section */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        businessName={businessProfile.name}
        onLogout={handleLogout}
        user={currentUser}
      />

      {/* Main content wrapper */}
      <div className="main-wrapper">
        <Navbar 
          activeTab={activeTab}
          theme={theme}
          toggleTheme={toggleTheme}
          language={language}
          setLanguage={setLanguage}
          industry={businessProfile.industry}
        />

        <main className="page-content">
          {activeTab === 'dashboard' && (
            <DashboardHome 
              profile={businessProfile} 
              apiKey={apiKey}
              translate={translate}
            />
          )}

          {activeTab === 'chat' && (
            <BusinessChat 
              profile={businessProfile} 
              apiKey={apiKey}
              translate={translate}
            />
          )}

          {activeTab === 'tools' && (
            <BusinessTools 
              profile={businessProfile} 
              apiKey={apiKey}
              translate={translate}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage 
              apiKey={apiKey}
              translate={translate}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage />
          )}

          {activeTab === 'settings' && (
            <SettingsPage 
              profile={businessProfile}
              onProfileUpdate={setBusinessProfile}
              apiKey={apiKey}
              onApiKeyUpdate={setApiKey}
            />
          )}
        </main>
      </div>
    </div>
  );
}
