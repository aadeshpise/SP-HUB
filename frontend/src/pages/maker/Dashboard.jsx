import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { LeadCard, OfferDetailsModal, ACTIVE_LEADS } from '@/components/LeadComponents';
import { PlusCircle, FileText, CheckCircle, Clock, TrendingUp, IndianRupee } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const API = import.meta.env.VITE_BACKEND_URL + '/api';

export default function MakerDashboard() {
  const { token } = useAuth();
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/stats`, { headers }).then(r => setStats(r.data)).catch(() => {});
  }, []);

  const filters = ['All', 'Offer Submitted', 'Under Review', 'Approved'];
  const filteredLeads = activeFilter === 'All' ? ACTIVE_LEADS : ACTIVE_LEADS.filter(l => l.status === activeFilter);

  return (
    <Layout
      headerActions={
        <button
          className="scf-btn scf-btn-primary"
          style={{ gap: 6 }}
          data-testid="new-lead-btn"
        >
          <PlusCircle size={15} /> + New Lead
        </button>
      }
    >
      <div data-testid="maker-dashboard">
        {/* Summary stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
          {[
            { label: 'Total SCF Limit', value: '₹200 Cr', icon: <IndianRupee size={16} />, bg: '#ede9fe', ic: '#6d28d9' },
            { label: 'Active Programs', value: ACTIVE_LEADS.length, icon: <TrendingUp size={16} />, bg: '#d1fae5', ic: '#059669' },
            { label: 'Total Invoices', value: stats?.total_invoices ?? '—', icon: <FileText size={16} />, bg: '#fef3c7', ic: '#d97706' },
            { label: 'Pending Approval', value: stats?.pending_approval ?? '—', icon: <Clock size={16} />, bg: '#fef3c7', ic: '#d97706' },
            { label: 'Approved', value: stats?.approved ?? '—', icon: <CheckCircle size={16} />, bg: '#d1fae5', ic: '#059669' },
          ].map(c => (
            <div key={c.label} className="scf-stat-card" style={{ padding: '14px 16px' }}>
              <div className="scf-stat-icon" style={{ background: c.bg, width: 32, height: 32, marginBottom: 8 }}>
                <span style={{ color: c.ic }}>{c.icon}</span>
              </div>
              <div className="scf-stat-value" style={{ fontSize: 20 }}>{c.value}</div>
              <div className="scf-stat-label" style={{ fontSize: 11 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Active Programs / Ongoing Leads Journey */}
        <div className="scf-table-card">
          <div className="scf-table-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="scf-table-title">Ongoing Leads Journey</div>
              <div className="scf-table-subtitle">Active programs and their current status</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    border: activeFilter === f ? '1.5px solid #6d28d9' : '1.5px solid #e5e7eb',
                    background: activeFilter === f ? '#ede9fe' : '#fff',
                    color: activeFilter === f ? '#5b21b6' : '#6b7280',
                    transition: 'all 0.15s'
                  }}
                  data-testid={`filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {f}
                  {f !== 'All' && (
                    <span style={{ marginLeft: 4, background: activeFilter === f ? '#6d28d9' : '#e5e7eb', color: activeFilter === f ? '#fff' : '#6b7280', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                      {ACTIVE_LEADS.filter(l => l.status === f).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '16px 20px' }}>
            {filteredLeads.length === 0 ? (
              <div className="scf-empty"><TrendingUp /><h3>No leads found</h3></div>
            ) : (
              filteredLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} onViewDetails={setSelectedLeadId} />
              ))
            )}
          </div>

          <div style={{ padding: '10px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Showing {filteredLeads.length} of {ACTIVE_LEADS.length} programs</span>
            <span style={{ fontSize: 11.5, color: '#9ca3af' }}>Data updated as of 2 hours ago</span>
          </div>
        </div>

        {/* Offer Details Modal */}
        {selectedLeadId && (
          <OfferDetailsModal
            leadId={selectedLeadId}
            onClose={() => setSelectedLeadId(null)}
          />
        )}
      </div>
    </Layout>
  );
}
