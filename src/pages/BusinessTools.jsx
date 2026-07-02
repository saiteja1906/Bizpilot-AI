import React, { useState } from 'react';
import { databaseService } from '../utils/firebase';
import { 
  FileCheck, 
  RefreshCw, 
  HelpCircle, 
  Download, 
  Eye, 
  Users, 
  Briefcase, 
  Target 
} from 'lucide-react';

export default function BusinessTools({ profile, apiKey, translate }) {
  const [activeSubTab, setActiveSubTab] = useState('swot');

  // Common Loading State
  const [isLoading, setIsLoading] = useState(false);

  // SWOT States
  const [swotIdea, setSwotIdea] = useState('');
  const [swotResult, setSwotResult] = useState(null);

  // Competitor States
  const [compName, setCompName] = useState('');
  const [compIndustry, setCompIndustry] = useState('');
  const [compResult, setCompResult] = useState(null);

  // Market Research States
  const [marketIndustry, setMarketIndustry] = useState('');
  const [marketAudience, setMarketAudience] = useState('');
  const [marketResult, setMarketResult] = useState(null);

  // Business Plan States
  const [planIdea, setPlanIdea] = useState('');
  const [planDetails, setPlanDetails] = useState('');
  const [planResult, setPlanResult] = useState(null);

  // Helper to trigger MS-Word DOC download client-side
  const downloadAsWord = (filename, title, contentHtml) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
          "xmlns:w='urn:schemas-microsoft-com:office:word' " +
          "xmlns='http://www.w3.org/TR/REC-html40'>" +
          "<head><title>" + title + "</title><style>body { font-family: Arial, sans-serif; line-height: 1.5; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + contentHtml + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = filename;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  // Helper to trigger Print (Save as PDF)
  const triggerPrint = () => {
    window.print();
  };

  // API Call: SWOT
  const handleSwotGenerate = async (e) => {
    e.preventDefault();
    if (!swotIdea.trim()) return;
    setIsLoading(true);
    setSwotResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/swot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ idea: swotIdea, profile })
      });
      const data = await response.json();
      setSwotResult(data);

      databaseService.saveReport({
        id: `report-${Date.now()}`,
        title: `SWOT: ${swotIdea.substring(0, 20)}`,
        type: 'SWOT Analysis',
        created: new Date().toISOString(),
        content: `Strengths: ${data.strengths.join(', ')}\nWeaknesses: ${data.weaknesses.join(', ')}\nOpportunities: ${data.opportunities.join(', ')}\nThreats: ${data.threats.join(', ')}\nSummary: ${data.summary}`
      });
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // API Call: Competitors
  const handleCompGenerate = async (e) => {
    e.preventDefault();
    if (!compName.trim()) return;
    setIsLoading(true);
    setCompResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/competitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ companyName: compName, industry: compIndustry || profile.industry })
      });
      const data = await response.json();
      setCompResult(data);

      databaseService.saveReport({
        id: `report-${Date.now()}`,
        title: `Competitors: ${compName.substring(0, 20)}`,
        type: 'Competitor Analysis',
        created: new Date().toISOString(),
        content: JSON.stringify(data, null, 2)
      });
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // API Call: Market Research
  const handleMarketGenerate = async (e) => {
    e.preventDefault();
    if (!marketIndustry.trim()) return;
    setIsLoading(true);
    setMarketResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/market-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ industry: marketIndustry, targetAudience: marketAudience || profile.target })
      });
      const data = await response.json();
      setMarketResult(data);

      databaseService.saveReport({
        id: `report-${Date.now()}`,
        title: `Research: ${marketIndustry.substring(0, 20)}`,
        type: 'Market Research',
        created: new Date().toISOString(),
        content: JSON.stringify(data, null, 2)
      });
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // API Call: Business Plan
  const handlePlanGenerate = async (e) => {
    e.preventDefault();
    if (!planIdea.trim()) return;
    setIsLoading(true);
    setPlanResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/business-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ idea: planIdea, details: planDetails, profile })
      });
      const data = await response.json();
      setPlanResult(data);

      databaseService.saveReport({
        id: `report-${Date.now()}`,
        title: `Plan: ${planIdea.substring(0, 20)}`,
        type: 'Business Plan',
        created: new Date().toISOString(),
        content: JSON.stringify(data, null, 2)
      });
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Sub menu navigation */}
      <div className="tab-header">
        <button 
          onClick={() => setActiveSubTab('swot')} 
          className={`tab-btn ${activeSubTab === 'swot' ? 'active' : ''}`}
        >
          SWOT Generator
        </button>
        <button 
          onClick={() => setActiveSubTab('competitors')} 
          className={`tab-btn ${activeSubTab === 'competitors' ? 'active' : ''}`}
        >
          Competitor Map
        </button>
        <button 
          onClick={() => setActiveSubTab('market')} 
          className={`tab-btn ${activeSubTab === 'market' ? 'active' : ''}`}
        >
          Market Research
        </button>
        <button 
          onClick={() => setActiveSubTab('plan')} 
          className={`tab-btn ${activeSubTab === 'plan' ? 'active' : ''}`}
        >
          Business Plan
        </button>
      </div>

      {/* SWOT TAB */}
      {activeSubTab === 'swot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>AI SWOT Generator</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Create a custom Matrix detailing Strengths, Weaknesses, Opportunities, and Threats for your core idea.
            </p>

            <form onSubmit={handleSwotGenerate} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: '1', minWidth: '280px', marginBottom: 0 }}>
                <label className="form-label">Core Business Idea</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Eco-friendly organic dog treats delivered on subscription model"
                  value={swotIdea}
                  onChange={e => setSwotIdea(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading || !swotIdea.trim()}
              >
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Generate SWOT Matrix'}
              </button>
            </form>
          </div>

          {swotResult && (
            <div className="glass-card fade-in" id="print-area">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>SWOT Analysis Report</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={triggerPrint} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    <Download size={14} /> PDF
                  </button>
                  <button 
                    onClick={() => downloadAsWord(
                      'SWOT_Analysis.doc', 
                      'SWOT Analysis', 
                      `<h1>SWOT Analysis for: ${swotIdea}</h1><h2>Strengths</h2><ul>${swotResult.strengths.map(s => `<li>${s}</li>`).join('')}</ul><h2>Weaknesses</h2><ul>${swotResult.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul><h2>Opportunities</h2><ul>${swotResult.opportunities.map(o => `<li>${o}</li>`).join('')}</ul><h2>Threats</h2><ul>${swotResult.threats.map(t => `<li>${t}</li>`).join('')}</ul><h2>Summary</h2><p>${swotResult.summary}</p>`
                    )} 
                    className="btn btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Word
                  </button>
                </div>
              </div>

              <div className="swot-grid" style={{ marginBottom: '24px' }}>
                <div className="swot-box strengths">
                  <h4 className="swot-title" style={{ color: 'var(--swot-s-border)' }}>S - Strengths</h4>
                  <ul className="swot-list">
                    {swotResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="swot-box weaknesses">
                  <h4 className="swot-title" style={{ color: 'var(--swot-w-border)' }}>W - Weaknesses</h4>
                  <ul className="swot-list">
                    {swotResult.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
                <div className="swot-box opportunities">
                  <h4 className="swot-title" style={{ color: 'var(--swot-o-border)' }}>O - Opportunities</h4>
                  <ul className="swot-list">
                    {swotResult.opportunities.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
                <div className="swot-box threats">
                  <h4 className="swot-title" style={{ color: 'var(--swot-t-border)' }}>T - Threats</h4>
                  <ul className="swot-list">
                    {swotResult.threats.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Strategic Recommendation</h4>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>{swotResult.summary}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPETITORS TAB */}
      {activeSubTab === 'competitors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Competitor Analysis</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Map out competitive threats, check market shares, and design counter-strategies.
            </p>

            <form onSubmit={handleCompGenerate} className="grid-3" style={{ alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Your Company Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Apex Tech"
                  value={compName}
                  onChange={e => setCompName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Industry Sector</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. AI Workflow tools"
                  value={compIndustry}
                  onChange={e => setCompIndustry(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading || !compName.trim()}
              >
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Generate Comparison'}
              </button>
            </form>
          </div>

          {compResult && (
            <div className="glass-card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Competitor Matrix</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={triggerPrint} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    <Download size={12} /> PDF
                  </button>
                  <button 
                    onClick={() => downloadAsWord(
                      'Competitor_Analysis.doc', 
                      'Competitor Analysis', 
                      `<h1>Competitor Analysis for: ${compName}</h1>${compResult.competitors.map(c => `<h3>${c.name} (Share: ${c.share})</h3><p><b>Strengths:</b> ${c.strengths}<br/><b>Weaknesses:</b> ${c.weaknesses}<br/><b>Defense Strategy:</b> ${c.strategy}</p>`).join('')}<h2>Insights</h2><p>${compResult.insights}</p>`
                    )} 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Word
                  </button>
                </div>
              </div>

              {/* Responsive Table */}
              <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Competitor</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Est. Share</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Key Strengths</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Weaknesses</th>
                      <th style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Counter Strategy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compResult.competitors.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 8px', fontWeight: '700', fontSize: '0.9rem' }}>{c.name}</td>
                        <td style={{ padding: '12px 8px', fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{c.share}</td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.strengths}</td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.weaknesses}</td>
                        <td style={{ padding: '12px 8px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500' }}>{c.strategy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Strategic Consulting Overview</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{compResult.insights}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MARKET RESEARCH TAB */}
      {activeSubTab === 'market' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Market Research Agent</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Analyze market sizes, identify customer cohorts, and examine structural industry trends.
            </p>

            <form onSubmit={handleMarketGenerate} className="grid-3" style={{ alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Industry Sector</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Telehealth services for seniors"
                  value={marketIndustry}
                  onChange={e => setMarketIndustry(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Core Target Audience</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Elderly demographics and caretakers"
                  value={marketAudience}
                  onChange={e => setMarketAudience(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading || !marketIndustry.trim()}
              >
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Run Market Search'}
              </button>
            </form>
          </div>

          {marketResult && (
            <div className="glass-card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Market Report: {marketIndustry}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={triggerPrint} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    <Download size={12} /> PDF
                  </button>
                  <button 
                    onClick={() => downloadAsWord(
                      'Market_Research.doc', 
                      'Market Research Report', 
                      `<h1>Market Research: ${marketIndustry}</h1><p><b>Market Size:</b> ${marketResult.marketSize}<br/><b>Growth:</b> ${marketResult.growthRate}</p><h3>Trends</h3><ul>${marketResult.trends.map(t => `<li>${t}</li>`).join('')}</ul><h3>Cohorts</h3><ul>${marketResult.segments.map(s => `<li><b>${s.name}</b> (Priority: ${s.priority}) - ${s.needs}</li>`).join('')}</ul><h2>Summary</h2><p>${marketResult.summary}</p>`
                    )} 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Word
                  </button>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: '24px' }}>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Addressable Market</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '6px', color: 'var(--accent-primary)' }}>{marketResult.marketSize}</div>
                </div>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Growth Velocity</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '6px', color: 'var(--accent-success)' }}>{marketResult.growthRate}</div>
                </div>
              </div>

              <div className="grid-2" style={{ marginBottom: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Structural Industry Trends</h4>
                  <ul className="swot-list">
                    {marketResult.trends.map((t, i) => <li key={i} style={{ fontSize: '0.85rem', marginBottom: '8px' }}>{t}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Customer Cohort Priorities</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {marketResult.segments.map((s, i) => (
                      <div key={i} style={{ fontSize: '0.85rem', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: '700' }}>
                          <span>{s.name}</span>
                          <span style={{ color: s.priority === 'High' ? 'var(--accent-success)' : 'var(--accent-warning)' }}>{s.priority} Priority</span>
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>{s.needs}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Summary Insight</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>{marketResult.summary}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BUSINESS PLAN TAB */}
      {activeSubTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Business Plan Writer</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Draft structural summaries, problem statements, revenue forecasts, and product roadmap vectors.
            </p>

            <form onSubmit={handlePlanGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Core Business Concept</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Multi-tier subscription-based workflow assistant tool"
                  value={planIdea}
                  onChange={e => setPlanIdea(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Product & Sales Insights (Optional)</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="e.g. Plan to expand B2B sales starting Month 6, using cold outreaches and freemium trials..."
                  value={planDetails}
                  onChange={e => setPlanDetails(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading || !planIdea.trim()}
                style={{ alignSelf: 'flex-start' }}
              >
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Compile Business Plan'}
              </button>
            </form>
          </div>

          {planResult && (
            <div className="glass-card fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Executive Business Plan</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created for: {planIdea}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={triggerPrint} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    <Download size={14} /> PDF
                  </button>
                  <button 
                    onClick={() => downloadAsWord(
                      'Business_Plan.doc', 
                      'Business Plan Report', 
                      `<h1>Business Plan: ${planIdea}</h1><h2>1. Executive Summary</h2><p>${planResult.executiveSummary}</p><h2>2. Problem Statement</h2><p>${planResult.problemStatement}</p><h2>3. Solution</h2><p>${planResult.solution}</p><h2>4. Target Market</h2><p>${planResult.targetMarket}</p><h2>5. Revenue Model</h2><p>${planResult.revenueModel}</p><h2>6. Marketing Strategy</h2><p>${planResult.marketingStrategy}</p><h2>7. Financial Projections</h2><p>${planResult.financialProjections}</p><h2>8. Future Roadmap</h2><p>${planResult.roadmap}</p>`
                    )} 
                    className="btn btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Word
                  </button>
                </div>
              </div>

              {/* Sections Layout */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                
                <section>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>1. Executive Summary</h4>
                  <p style={{ color: 'var(--text-main)' }}>{planResult.executiveSummary}</p>
                </section>

                <section>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>2. Problem Statement</h4>
                  <p style={{ color: 'var(--text-main)' }}>{planResult.problemStatement}</p>
                </section>

                <section>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>3. Proposed Solution</h4>
                  <p style={{ color: 'var(--text-main)' }}>{planResult.solution}</p>
                </section>

                <section>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>4. Target Market & Demographics</h4>
                  <p style={{ color: 'var(--text-main)' }}>{planResult.targetMarket}</p>
                </section>

                <section>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>5. Revenue & Business Model</h4>
                  <p style={{ color: 'var(--text-main)' }}>{planResult.revenueModel}</p>
                </section>

                <section>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>6. Marketing & Go-To-Market Strategy</h4>
                  <p style={{ color: 'var(--text-main)' }}>{planResult.marketingStrategy}</p>
                </section>

                <section>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>7. Financial Projections</h4>
                  <p style={{ color: 'var(--text-main)' }}>{planResult.financialProjections}</p>
                </section>

                <section>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '8px' }}>8. Roadmap & Key Milestones</h4>
                  <p style={{ color: 'var(--text-main)' }}>{planResult.roadmap}</p>
                </section>

              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
