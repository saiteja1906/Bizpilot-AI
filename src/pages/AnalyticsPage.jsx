import React, { useState } from 'react';
import { databaseService } from '../utils/firebase';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { 
  Upload, 
  Play, 
  RefreshCw, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  Smile 
} from 'lucide-react';

export default function AnalyticsPage({ apiKey, translate }) {
  const [activeSubTab, setActiveSubTab] = useState('forecast');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Financial Forecasting State
  const [initialRev, setInitialRev] = useState(12000);
  const [initialExp, setInitialExp] = useState(8000);
  const [growthRate, setGrowthRate] = useState(8);
  const [forecastMonths, setForecastMonths] = useState(6);
  const [forecastData, setForecastData] = useState([]);

  // 2. Sales Prediction CSV Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [salesChartData, setSalesChartData] = useState([]);
  const [salesInsights, setSalesInsights] = useState('');
  const [slopeValue, setSlopeValue] = useState(0);

  // 3. Sentiment Analysis State
  const [feedbackText, setFeedbackText] = useState('');
  const [sentimentResult, setSentimentResult] = useState(null);

  // Calculate Financial Forecast Projections
  const handleCalculateForecast = (e) => {
    e.preventDefault();
    const data = [];
    let currentRev = initialRev;
    let currentExp = initialExp;
    let cumulativeCash = 0;

    for (let m = 1; m <= forecastMonths; m++) {
      if (m > 1) {
        currentRev = currentRev * (1 + growthRate / 100);
        // Cost inflation assumption of 1.5% monthly
        currentExp = currentExp * 1.015;
      }
      const profit = currentRev - currentExp;
      cumulativeCash += profit;

      data.push({
        name: `Month ${m}`,
        Revenue: Math.round(currentRev),
        Expenses: Math.round(currentExp),
        Profit: Math.round(profit),
        CashFlow: Math.round(cumulativeCash)
      });
    }

    setForecastData(data);
  };

  // Generate Sample CSV utility
  const handleDownloadSample = () => {
    const csvContent = "Date,Sales\n2026-01,15000\n2026-02,18500\n2026-03,16200\n2026-04,19800\n2026-05,22500\n2026-06,26000\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sales_history_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload CSV file to backend
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCsvSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsLoading(true);
    setSalesChartData([]);
    setSalesInsights('');

    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/predict-sales', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey || ''
        },
        body: formData
      });
      const data = await response.json();
      
      if (response.ok) {
        setSalesChartData(data.chartData);
        setSlopeValue(data.slope);
        setSalesInsights(data.insights);

        databaseService.saveReport({
          id: `report-${Date.now()}`,
          title: `Sales Prediction: ${selectedFile.name}`,
          type: 'Sales Forecast',
          created: new Date().toISOString(),
          content: `Historical vs Forecast sales parsed successfully. Projected growth slope is ${data.slope.toFixed(2)} units. Insights:\n${data.insights}`
        });
      } else {
        alert(data.error || 'Failed to upload CSV file.');
      }
    } catch (err) {
      console.error(err);
      alert('Error parsing file or connecting to backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run Sentiment Analysis
  const handleSentimentAnalyze = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setIsLoading(true);
    setSentimentResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ text: feedbackText })
      });
      const data = await response.json();
      setSentimentResult(data);

      databaseService.saveReport({
        id: `report-${Date.now()}`,
        title: `Sentiment Analysis: ${feedbackText.substring(0, 20)}...`,
        type: 'Sentiment Study',
        created: new Date().toISOString(),
        content: `Positive: ${data.positive}%, Negative: ${data.negative}%, Neutral: ${data.neutral}%. Recommendations: ${data.recommendations.join(', ')}`
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
      
      {/* Sub tabs navigation */}
      <div className="tab-header">
        <button 
          onClick={() => setActiveSubTab('forecast')} 
          className={`tab-btn ${activeSubTab === 'forecast' ? 'active' : ''}`}
        >
          Financial Projections
        </button>
        <button 
          onClick={() => setActiveSubTab('csv_sales')} 
          className={`tab-btn ${activeSubTab === 'csv_sales' ? 'active' : ''}`}
        >
          Sales Prediction (CSV)
        </button>
        <button 
          onClick={() => setActiveSubTab('sentiment')} 
          className={`tab-btn ${activeSubTab === 'sentiment' ? 'active' : ''}`}
        >
          Sentiment Analysis
        </button>
      </div>

      {/* FINANCIAL FORECAST TAB */}
      {activeSubTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Financial Forecasting Engine</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Estimate multi-month paths for revenue, costs, and profits based on compound rates.
            </p>

            <form onSubmit={handleCalculateForecast} className="grid-4" style={{ alignItems: 'flex-end', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Initial Monthly Revenue ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={initialRev}
                  onChange={e => setInitialRev(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Initial Monthly Expenses ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={initialExp}
                  onChange={e => setInitialExp(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Growth Rate per Month (%)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={growthRate}
                  onChange={e => setGrowthRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Forecast Horizon</label>
                <select 
                  className="form-select" 
                  value={forecastMonths}
                  onChange={e => setForecastMonths(parseInt(e.target.value))}
                >
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                  <option value={24}>24 Months</option>
                </select>
              </div>
            </form>

            <button onClick={handleCalculateForecast} className="btn btn-primary">
              Compute Forecast
            </button>
          </div>

          {forecastData.length > 0 && (
            <div className="glass-card fade-in" style={{ minHeight: '380px' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '20px' }}>Financial Forecast Projections</h4>
              
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                    <Legend style={{ fontSize: '0.85rem' }} />
                    <Line type="monotone" dataKey="Revenue" stroke="var(--accent-primary)" strokeWidth={2.5} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="Expenses" stroke="var(--accent-danger)" strokeWidth={2} />
                    <Line type="monotone" dataKey="Profit" stroke="var(--accent-success)" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Data Table */}
              <div style={{ marginTop: '24px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Month</th>
                      <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Projected Revenue</th>
                      <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Projected Costs</th>
                      <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Net Profit</th>
                      <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Cum. Cash Flow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastData.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '8px', fontSize: '0.85rem', fontWeight: '600' }}>{row.name}</td>
                        <td style={{ padding: '8px', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>${row.Revenue.toLocaleString()}</td>
                        <td style={{ padding: '8px', fontSize: '0.85rem', color: 'var(--accent-danger)' }}>${row.Expenses.toLocaleString()}</td>
                        <td style={{ padding: '8px', fontSize: '0.85rem', color: 'var(--accent-success)', fontWeight: '600' }}>${row.Profit.toLocaleString()}</td>
                        <td style={{ padding: '8px', fontSize: '0.85rem', fontWeight: '500' }}>${row.CashFlow.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SALES CSV FORECAST TAB */}
      {activeSubTab === 'csv_sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Sales Prediction Model</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Upload a historical Sales CSV. BizPilot will run linear regression projections and formulate Gemini-guided forecasts.
                </p>
              </div>
              <button onClick={handleDownloadSample} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem', gap: '6px' }}>
                <Download size={14} /> Download Sample CSV
              </button>
            </div>

            <form onSubmit={handleCsvSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  id="csvFile" 
                  accept=".csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label 
                  htmlFor="csvFile" 
                  className="btn btn-secondary"
                  style={{ cursor: 'pointer', gap: '8px' }}
                >
                  <FileSpreadsheet size={16} /> 
                  {selectedFile ? selectedFile.name : 'Select CSV File'}
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Process CSV Projections'}
              </button>
            </form>
          </div>

          {salesChartData.length > 0 && (
            <div className="glass-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '6px' }}>Sales Trend Projection Chart</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Trend Slope: <span style={{ fontWeight: '700', color: slopeValue >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>{slopeValue.toFixed(2)} units / period</span>
                </div>
              </div>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                    <Legend style={{ fontSize: '0.85rem' }} />
                    {/* Render historical sales */}
                    <Line type="monotone" dataKey="sales" name="Actual / Predicted Sales" stroke="var(--accent-primary)" strokeWidth={2.5} dot={(props) => {
                      const isFore = props.payload.isForecast;
                      return (
                        <circle cx={props.cx} cy={props.cy} r={isFore ? 5 : 4} fill={isFore ? "var(--accent-secondary)" : "var(--accent-primary)"} stroke="none" />
                      );
                    }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {salesInsights && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Gemini Strategic Insights</h4>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    lineHeight: '1.6', 
                    color: 'var(--text-muted)', 
                    whiteSpace: 'pre-wrap', 
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    padding: '16px',
                    borderRadius: '8px'
                  }}>
                    {salesInsights}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SENTIMENT ANALYSIS TAB */}
      {activeSubTab === 'sentiment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Customer Sentiment Analysis</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Paste customer reviews, feedback, or focus-group notes below to map net emotional polarity.
            </p>

            <form onSubmit={handleSentimentAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Client Reviews (Paste text blocks here)</label>
                <textarea 
                  className="form-textarea" 
                  rows={4}
                  placeholder="e.g. 'I absolutely love the new glass dashboard, but the loading screens are a bit sluggish. Support was helpful but took a day to respond.'"
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading || !feedbackText.trim()}
                style={{ alignSelf: 'flex-start' }}
              >
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Analyze Sentiment Polarity'}
              </button>
            </form>
          </div>

          {sentimentResult && (
            <div className="glass-card fade-in grid-2">
              {/* Chart section */}
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '20px' }}>Sentiment Distribution</h4>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <BarChart data={[
                      { name: 'Positive', value: sentimentResult.positive, color: 'var(--accent-success)' },
                      { name: 'Neutral', value: sentimentResult.neutral, color: 'var(--accent-warning)' },
                      { name: 'Negative', value: sentimentResult.negative, color: 'var(--accent-danger)' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
                      <YAxis stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />
                      <Bar dataKey="value" name="Percentage (%)">
                        {[0, 1, 2].map((entry, index) => {
                          const colors = ['var(--accent-success)', 'var(--accent-warning)', 'var(--accent-danger)'];
                          return <Cell key={`cell-${index}`} fill={colors[index]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '16px' }}>AI Strategic Recommendations</h4>
                <ul className="swot-list">
                  {sentimentResult.recommendations.map((rec, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', marginBottom: '8px', lineHeight: '1.4' }}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
