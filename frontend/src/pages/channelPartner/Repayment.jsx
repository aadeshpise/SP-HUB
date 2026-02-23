import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Search, FileText, IndianRupee, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL + '/api';
const fmt = (n) => `₹${(n / 100000).toFixed(2)} L`;

const STATUS_COLORS = {
  Paid: ['badge-approved', 'Paid'],
  Pending: ['badge-pending', 'Pending'],
  Overdue: ['badge-rejected', 'Overdue'],
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'Paid', label: 'Paid' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Overdue', label: 'Overdue' },
];

export default function CPRepayment() {
  const { token } = useAuth();
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/repayment`, { headers })
      .then(r => setRepayments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = repayments.filter(r => {
    const matchTab = activeTab === 'all' || r.status === activeTab;
    const matchSearch = !search ||
      r.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      r.channel_partner.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {};
  TABS.forEach(t => { counts[t.key] = t.key === 'all' ? repayments.length : repayments.filter(r => r.status === t.key).length; });

  const totalDisbursed = repayments.reduce((s, r) => s + r.disbursed_amount, 0);
  const totalPaid = repayments.filter(r => r.status === 'Paid').reduce((s, r) => s + r.repayment_amount, 0);
  const totalPending = repayments.filter(r => r.status === 'Pending').reduce((s, r) => s + r.repayment_amount, 0);
  const totalOverdue = repayments.filter(r => r.status === 'Overdue').reduce((s, r) => s + r.repayment_amount, 0);

  return (
    <Layout>
      <div data-testid="cp-repayment">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total Disbursed', value: fmt(totalDisbursed), icon: <IndianRupee size={16} />, bg: '#ede9fe', ic: '#6d28d9' },
            { label: 'Repaid', value: fmt(totalPaid), icon: <CheckCircle size={16} />, bg: '#d1fae5', ic: '#059669' },
            { label: 'Pending', value: fmt(totalPending), icon: <Clock size={16} />, bg: '#fef3c7', ic: '#d97706' },
            { label: 'Overdue', value: fmt(totalOverdue), icon: <AlertTriangle size={16} />, bg: '#fee2e2', ic: '#dc2626' },
          ].map(c => (
            <div key={c.label} className="scf-stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
              <div className="scf-stat-icon" style={{ background: c.bg, width: 36, height: 36 }}>
                <span style={{ color: c.ic }}>{c.icon}</span>
              </div>
              <div>
                <div className="scf-stat-value" style={{ fontSize: 17 }}>{c.value}</div>
                <div className="scf-stat-label" style={{ marginBottom: 0, fontSize: 11 }}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="scf-table-card">
          <div style={{ padding: '0 20px' }}>
            <div className="scf-tabs">
              {TABS.map(t => (
                <div key={t.key} className={`scf-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)} data-testid={`rep-tab-${t.key}`}>
                  {t.label}{counts[t.key] > 0 && <span className="scf-tab-count">{counts[t.key]}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="scf-filter-bar">
            <div className="scf-search-wrap">
              <Search />
              <input className="scf-search-input" placeholder="Search by invoice no..." value={search} onChange={e => setSearch(e.target.value)} data-testid="repayment-search" />
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>{filtered.length} records</span>
          </div>
          <div className="scf-table-wrap">
            <table className="scf-table">
              <thead>
                <tr><th>#</th><th>Invoice No</th><th>Channel Partner</th><th>Invoice Date</th><th>Invoice Amount</th><th>Disbursed</th><th>Due Date</th><th>Repayment Date</th><th>Repayment Amount</th><th>Overdue Days</th><th>Status</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="scf-loading"><div className="scf-spinner"></div></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={11}><div className="scf-empty"><FileText /><h3>No repayment records found</h3></div></td></tr>
                ) : (
                  filtered.map((r, i) => {
                    const [cls, label] = STATUS_COLORS[r.status] || ['badge-inactive', r.status];
                    return (
                      <tr key={r.id} data-testid={`rep-row-${r.id}`}>
                        <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600, color: '#5b21b6' }}>{r.invoice_no}</td>
                        <td>{r.channel_partner}</td>
                        <td>{r.invoice_date}</td>
                        <td className="scf-amount">{fmt(r.invoice_amount)}</td>
                        <td className="scf-amount">{fmt(r.disbursed_amount)}</td>
                        <td>{r.due_date}</td>
                        <td>{r.repayment_date}</td>
                        <td className="scf-amount">{fmt(r.repayment_amount)}</td>
                        <td style={{ color: r.overdue_days > 0 ? '#dc2626' : '#059669', fontWeight: 600 }}>
                          {r.overdue_days > 0 ? `${r.overdue_days} days` : '-'}
                        </td>
                        <td><span className={`scf-badge ${cls}`}>{label}</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="scf-pagination"><span>Showing {filtered.length} of {repayments.length} records</span></div>
        </div>
      </div>
    </Layout>
  );
}
