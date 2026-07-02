import React, { useState, useEffect } from 'react';
import { databaseService } from '../utils/firebase';
import { FileText, Download, Trash2, Calendar, Eye } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    setReports(databaseService.getReports());
  }, []);

  const handleDeleteReport = (id, e) => {
    e.stopPropagation();
    const list = reports.filter(r => r.id !== id);
    setReports(list);
    // Overwrite mock list in storage
    localStorage.setItem('bizpilot_reports', JSON.stringify(list));
    if (selectedReport?.id === id) {
      setSelectedReport(null);
    }
  };

  const handleDownloadWord = (report) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
          "xmlns:w='urn:schemas-microsoft-com:office:word' " +
          "xmlns='http://www.w3.org/TR/REC-html40'>" +
          "<head><title>" + report.title + "</title><style>body { font-family: Arial, sans-serif; line-height: 1.5; }</style></head><body>";
    const footer = "</body></html>";
    const bodyContent = `<h1>${report.title}</h1><h3>Type: ${report.type}</h3><p>Created on: ${new Date(report.created).toLocaleString()}</p><hr/><pre style="white-space: pre-wrap;">${report.content}</pre>`;
    const sourceHTML = header + bodyContent + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${report.title.replace(/\s+/g, '_')}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="fade-in grid-2" style={{ alignItems: 'flex-start' }}>
      
      {/* Reports List */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>AI Report Archive</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Locally saved business plans, SWOT charts, and forecasting insights.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No reports compiled yet. Use Business Tools to generate plans or SWOT models.
            </div>
          ) : (
            reports.map(r => (
              <div 
                key={r.id} 
                onClick={() => setSelectedReport(r)}
                className={`menu-item ${selectedReport?.id === r.id ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', overflow: 'hidden' }}>
                  <FileText size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                      {r.title}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>{r.type}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Calendar size={10} /> {new Date(r.created).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button 
                    onClick={(e) => handleDeleteReport(r.id, e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-danger)', padding: '4px' }}
                    title="Delete Report"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Report details */}
      <div className="glass-card" style={{ minHeight: '340px' }}>
        {selectedReport ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{selectedReport.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{selectedReport.type}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button 
                  onClick={() => window.print()} 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  Print PDF
                </button>
                <button 
                  onClick={() => handleDownloadWord(selectedReport)} 
                  className="btn btn-secondary" 
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  Export Word
                </button>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'rgba(0,0,0,0.15)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              maxHeight: '360px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-main)',
              fontFamily: 'monospace'
            }}>
              {selectedReport.content}
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '240px',
            color: 'var(--text-muted)'
          }}>
            <Eye size={36} style={{ color: 'var(--accent-secondary)', marginBottom: '12px', opacity: '0.6' }} />
            <span>Select a report from the archive to view details.</span>
          </div>
        )}
      </div>

    </div>
  );
}
