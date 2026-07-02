import React, { useState, useEffect } from 'react';
import { databaseService } from '../utils/firebase';
import MetricCard from '../components/MetricCard';
import { Play, Plus, Trash2, CheckSquare, Square, FileCheck, RefreshCw, Send } from 'lucide-react';

export default function DashboardHome({ profile, apiKey, translate }) {
  // Goals State
  const [goals, setGoals] = useState([]);
  const [newGoalText, setNewGoalText] = useState('');
  
  // Valuation Calculator State
  const [revenue, setRevenue] = useState(150000);
  const [growth, setGrowth] = useState(25);
  const [sector, setSector] = useState('saas');
  const [valuationResult, setValuationResult] = useState(null);

  // Pitch & Campaign Generator State
  const [generatorType, setGeneratorType] = useState('pitch'); // 'pitch' or 'marketing'
  const [idea, setIdea] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load goals
  useEffect(() => {
    setGoals(databaseService.getGoals());
  }, []);

  // Update goals in mock DB
  const updateGoals = (updated) => {
    setGoals(updated);
    databaseService.saveGoals(updated);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const item = {
      id: Date.now().toString(),
      text: newGoalText.trim(),
      done: false
    };
    updateGoals([...goals, item]);
    setNewGoalText('');
  };

  const handleToggleGoal = (id) => {
    const updated = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    updateGoals(updated);
  };

  const handleDeleteGoal = (id) => {
    const updated = goals.filter(g => g.id !== id);
    updateGoals(updated);
  };

  // Valuation Math
  const calculateValuation = () => {
    const multiples = {
      saas: 8.5,
      fintech: 7.0,
      ecommerce: 2.5,
      services: 3.0,
      hardware: 4.0
    };
    const multiple = multiples[sector] || 3.0;
    // Basic standard multiplier model: Revenue * Multiple * Growth adjustment
    const growthFactor = 1 + (Math.max(growth, 0) / 100);
    const valuation = Math.round(revenue * multiple * growthFactor);
    
    setValuationResult({
      multiple,
      valuation,
      preMoney: Math.round(valuation * 0.85), // assume 15% dilution
      postMoney: valuation
    });
  };

  // Generate Pitch/Campaign via API
  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setIsLoading(true);
    setGeneratedOutput('');

    try {
      const response = await fetch('http://localhost:5000/api/pitch-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({
          type: generatorType,
          idea: idea,
          target: targetAudience || 'General SMB Customers',
          profile: profile
        })
      });
      const data = await response.json();
      setGeneratedOutput(data.content);
      
      // Save report in storage
      databaseService.saveReport({
        id: `report-${Date.now()}`,
        title: generatorType === 'pitch' ? `Pitch Deck: ${idea.substring(0, 20)}` : `Campaign Blueprint: ${idea.substring(0, 20)}`,
        type: generatorType === 'pitch' ? 'Investor Pitch' : 'Marketing Campaign',
        created: new Date().toISOString(),
        content: data.content
      });

    } catch (error) {
      console.error(error);
      setGeneratedOutput('Error: Failed to connect to backend server. Make sure node server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Progress Bar
  const completedGoalsCount = goals.filter(g => g.done).length;
  const progressPercent = goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Overview stats */}
      <section className="grid-4">
        <MetricCard 
          title={translate('kpi_revenue')} 
          value="$452,900" 
          change="+12.4%" 
          isPositive={true} 
          subtitle="vs. last quarter"
        />
        <MetricCard 
          title={translate('kpi_customers')} 
          value="1,482" 
          change="+8.3%" 
          isPositive={true} 
          subtitle="Active subscribers"
        />
        <MetricCard 
          title={translate('kpi_conversion')} 
          value="3.42%" 
          change="-0.5%" 
          isPositive={false} 
          subtitle="Traffic to checkout"
        />
        <MetricCard 
          title={translate('kpi_profit_margin')} 
          value="68.2%" 
          change="+2.1%" 
          isPositive={true} 
          subtitle="Net operational efficiency"
        />
      </section>

      {/* Row 2: Pitch/Campaign & Goal Tracker */}
      <section className="grid-2">
        
        {/* Startup Pitch & Campaign generator */}
        <div className="glass-card">
          <div className="tab-header">
            <button 
              onClick={() => { setGeneratorType('pitch'); setGeneratedOutput(''); }} 
              className={`tab-btn ${generatorType === 'pitch' ? 'active' : ''}`}
            >
              Investor Pitch Deck
            </button>
            <button 
              onClick={() => { setGeneratorType('marketing'); setGeneratedOutput(''); }} 
              className={`tab-btn ${generatorType === 'marketing' ? 'active' : ''}`}
            >
              Marketing Campaign Blueprint
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                {generatorType === 'pitch' ? 'What is your core business idea / product?' : 'What product are we launching?'}
              </label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. A marketplace matching freelance writers with fintech blogs" 
                value={idea}
                onChange={e => setIdea(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience / ICP</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Seed investors, marketing directors, freelance creators" 
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
              />
            </div>

            <button 
              onClick={handleGenerate} 
              className="btn btn-primary"
              disabled={isLoading || !idea.trim()}
              style={{ width: '100%' }}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> Generating AI Strategy...
                </>
              ) : (
                <>
                  <Play size={16} /> Generate Campaign Structure
                </>
              )}
            </button>

            {generatedOutput && (
              <div style={{ 
                marginTop: '16px', 
                backgroundColor: 'rgba(0,0,0,0.2)', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                maxHeight: '260px',
                overflowY: 'auto',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                color: 'var(--text-main)'
              }}>
                {generatedOutput}
              </div>
            )}
          </div>
        </div>

        {/* Goal Tracker */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Business Goal Tracker</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Keep track of milestones for {profile.name || 'your company'}</p>
          </div>

          {/* Goal progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>
              <span>Progress</span>
              <span>{progressPercent}% Done</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>

          {/* Goal List */}
          <div style={{ flex: '1', overflowY: 'auto', maxHeight: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No goals defined. Create one below.</div>
            ) : (
              goals.map((g) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <button 
                    onClick={() => handleToggleGoal(g.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  >
                    {g.done ? <CheckSquare size={18} className="trend-up" /> : <Square size={18} style={{ color: 'var(--text-muted)' }} />}
                    <span style={{ textDecoration: g.done ? 'line-through' : 'none', color: g.done ? 'var(--text-muted)' : 'var(--text-main)' }}>
                      {g.text}
                    </span>
                  </button>
                  <button 
                    onClick={() => handleDeleteGoal(g.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Goal Form */}
          <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Create new objective..." 
              value={newGoalText}
              onChange={e => setNewGoalText(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '10px' }}>
              <Plus size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* Row 3: Valuation Calculator */}
      <section className="grid-1">
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Startup Valuation Calculator</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Estimate your company's value based on standard sector multiples, revenue metrics, and growth indices.
          </p>

          <div className="grid-3" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">ARR / Annual Revenue ($)</label>
              <input 
                type="number" 
                className="form-input" 
                value={revenue}
                onChange={e => setRevenue(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Annual Growth Rate (%)</label>
              <input 
                type="number" 
                className="form-input" 
                value={growth}
                onChange={e => setGrowth(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Industry / Sector</label>
              <select 
                className="form-select" 
                value={sector}
                onChange={e => setSector(e.target.value)}
              >
                <option value="saas">Software (SaaS) - 8.5x</option>
                <option value="fintech">Financial Tech (FinTech) - 7.0x</option>
                <option value="ecommerce">E-Commerce - 2.5x</option>
                <option value="services">Agency & Professional Services - 3.0x</option>
                <option value="hardware">Hardware / Infrastructure - 4.0x</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={calculateValuation} className="btn btn-primary">
              Run Valuation Models
            </button>

            {valuationResult && (
              <div className="grid-3" style={{ flex: '1', padding: '16px', border: '1px dashed var(--border-color)', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Multiple</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-primary)' }}>{valuationResult.multiple}x ARR</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pre-money Valuation</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-success)' }}>
                    ${valuationResult.preMoney.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Post-money Valuation</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-secondary)' }}>
                    ${valuationResult.postMoney.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
