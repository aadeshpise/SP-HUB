import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { LeadCard, OfferDetailsModal, ACTIVE_LEADS } from '@/components/LeadComponents';
import { PlusCircle, Search, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const API = import.meta.env.VITE_BACKEND_URL + '/api';

export default function MakerPrograms() {
  const { token } = useAuth();
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const headers = { Authorization: `Bearer ${token}` };

  const filters = ['All', 'Offer Submitted', 'Under Review', 'Approved'];

  const filtered = ACTIVE_LEADS.filter(l => {
    const matchFilter = activeFilter === 'All' || l.status === activeFilter;
    const matchSearch = !search ||
      l.id.toLowerCase().includes(search.toLowerCase()) ||
      l.lenders.some(lnd => lnd.name.toLowerCase().includes(search.toLowerCase())) ||
      l.company.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <Layout
      headerActions={
        <button className="scf-btn scf-btn-primary" data-testid="new-lead-btn-programs">
          <PlusCircle size={15} /> + New Lead
        </button>
      }
    >
      <div data-testid="maker-programs">
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total Programs', value: ACTIVE_LEADS.length },
            { label: 'Offer Submitted', value: ACTIVE_LEADS.filter(l => l.status === 'Offer Submitted').length },
            { label: 'Under Review', value: ACTIVE_LEADS.filter(l => l.status === 'Under Review').length },
            { label: 'Approved', value: ACTIVE_LEADS.filter(l => l.status === 'Approved').length },
          ].map(s => (
            <div key={s.label} className="scf-stat-card">
              <div className="scf-stat-label">{s.label}</div>
              <div className="scf-stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="scf-table-card">
          <div className="scf-table-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="scf-table-title">Active Programs</div>
              <div className="scf-table-subtitle">{filtered.length} programs found</div>
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
                  }}
                >
                  {f}
                </button>
              ))}
              <div className="scf-search-wrap">
                <Search />
                <input
                  className="scf-search-input"
                  placeholder="Search by ID, lender..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  data-testid="programs-search"
                />
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 20px' }}>
            {filtered.length === 0 ? (
              <div className="scf-empty"><TrendingUp /><h3>No programs found</h3></div>
            ) : (
              filtered.map(lead => (
                <LeadCard key={lead.id} lead={lead} onViewDetails={setSelectedLeadId} />
              ))
            )}
          </div>

          <div style={{ padding: '10px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Showing {filtered.length} of {ACTIVE_LEADS.length} programs</span>
            <span style={{ fontSize: 11.5, color: '#9ca3af' }}>Data updated as of 2 hours ago</span>
          </div>
        </div>

        {selectedLeadId && (
          <OfferDetailsModal leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
        )}
      </div>
    </Layout>
  );
}
