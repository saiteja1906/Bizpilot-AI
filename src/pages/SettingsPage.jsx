import React, { useState, useEffect } from 'react';
import { databaseService } from '../utils/firebase';
import { Settings, Save, RotateCcw, AlertTriangle, Key } from 'lucide-react';

export default function SettingsPage({ profile, onProfileUpdate, apiKey, onApiKeyUpdate }) {
  // Local profile states
  const [name, setName] = useState(profile.name || '');
  const [industry, setIndustry] = useState(profile.industry || '');
  const [size, setSize] = useState(profile.size || '');
  const [target, setTarget] = useState(profile.target || '');
  const [valueProp, setValueProp] = useState(profile.valueProp || '');

  // Local key state
  const [localKey, setLocalKey] = useState(apiKey || '');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Sync state if profile changes prop-wise
  useEffect(() => {
    setName(profile.name || '');
    setIndustry(profile.industry || '');
    setSize(profile.size || '');
    setTarget(profile.target || '');
    setValueProp(profile.valueProp || '');
  }, [profile]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = { name, industry, size, target, valueProp };
    databaseService.saveProfile(updated);
    onProfileUpdate(updated);
    
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('bizpilot_gemini_key', localKey);
    onApiKeyUpdate(localKey);
    
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleResetProfile = () => {
    if (confirm('Reset profile to default demo settings?')) {
      const defaults = {
        name: "Apex Tech Labs",
        industry: "Software as a Service (SaaS)",
        size: "1-10 employees",
        target: "SME Owners & Startup Founders",
        valueProp: "Automated business advice using cutting-edge AI diagnostics"
      };
      databaseService.saveProfile(defaults);
      onProfileUpdate(defaults);
    }
  };

  return (
    <div className="fade-in grid-2" style={{ alignItems: 'flex-start' }}>
      
      {/* Profile Form */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem' }}>Business Profile</h3>
          <button 
            type="button" 
            onClick={handleResetProfile} 
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
          >
            <RotateCcw size={12} /> Reset Demo
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Configuring your business profile helps Gemini AI inject specific customer/competitor contexts directly into all SWOT calculations, reports, and campaign maps automatically!
        </p>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Company / Brand Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Apex Tech Labs"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Industry Sector</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. E-Learning Solutions"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Size</label>
            <select 
              className="form-select" 
              value={size}
              onChange={e => setSize(e.target.value)}
            >
              <option value="Just me">Just me</option>
              <option value="1-10 employees">1-10 employees</option>
              <option value="11-50 employees">11-50 employees</option>
              <option value="51-200 employees">51-200 employees</option>
              <option value="200+ employees">200+ employees</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Target Customers (ICP)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. College students, local bakery owners, HR directors"
              value={target}
              onChange={e => setTarget(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Core Value Proposition</label>
            <textarea 
              className="form-textarea" 
              placeholder="e.g. Offering modular study guides that cut review times in half by automating quiz cards..."
              value={valueProp}
              onChange={e => setValueProp(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', gap: '8px' }}>
            <Save size={16} /> Save Business Profile
          </button>
        </form>
      </div>

      {/* API Key Configuration & Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* API settings */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} style={{ color: 'var(--accent-primary)' }} /> Gemini Integration Key
          </h3>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Input your Google AI Studio Gemini API Key below. This key is stored securely in your local browser storage and is sent in request headers to prompt the AI model.
          </p>

          <form onSubmit={handleSaveKey} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Gemini API Key</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="AIzaSy..."
                value={localKey}
                onChange={e => setLocalKey(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
              Update Gemini Key
            </button>
          </form>
        </div>

        {/* Status Warnings */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-warning)' }}>
          <h4 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-warning)', marginBottom: '8px' }}>
            <AlertTriangle size={16} /> Evaluation Notice
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            If no API key is specified, BizPilot runs in **Demo Mode**. It will supply realistic, mock advisory structures so you can inspect page dynamics, forms, and charts without configuration.
          </p>
        </div>

        {isSavedNotice && (
          <div className="glass-card fade-in" style={{ backgroundColor: 'var(--swot-s-bg)', borderColor: 'var(--swot-s-border)', textAlign: 'center', padding: '12px' }}>
            <span style={{ color: 'var(--swot-s-border)', fontWeight: '700', fontSize: '0.9rem' }}>Settings updated successfully!</span>
          </div>
        )}
      </div>

    </div>
  );
}
