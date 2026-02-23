import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Search, Eye, CheckCircle, XCircle, X, FileText, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL + '/api';
const fmt = (n) => `\u20b9${(n / 100000).toFixed(2)} L`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '\u2014';

const CP_LIMITS = {
  'Jagdamba Motors': { limit: 500, utilized: 150, available: 350, roi: 8.5, pte: 30 },
  'Krishna Auto Dealers': { limit: 300, utilized: 85, available: 215, roi: 9.0, pte: 45 },
  'Shree Ganesh Motors': { limit: 800, utilized: 320, available: 480, roi: 7.5, pte: 60 },
  'Meenakshi Auto': { limit: 250, utilized: 98, available: 152, roi: 9.5, pte: 30 },
  'Sunrise Vehicles': { limit: 450, utilized: 180, available: 270, roi: 8.0, pte: 45 },
};

const STATUS_MAP = {
  pending_checker_approval: ['badge-pending', 'Pending Checker Approval'],
  approved_l1: ['badge-checker', 'Approved (L1)'],
  rejected_checker: ['badge-rejected', 'Rejected (Checker)'],
  fully_approved: ['badge-approved', 'Fully Approved'],
  rejected_cp: ['badge-rejected', 'Rejected (CP)'],
};
const StatusBadge = ({ status }) => {
  const [cls, label] = STATUS_MAP[status] || ['badge-inactive', status];
  return <span className={`scf-badge ${cls}`}>{label}</span>;
};

const TABS = [
  { key: 'all', label: 'All Invoices' },
  { key: 'pending_checker_approval', label: 'Pending Approval' },
  { key: 'approved_l1', label: 'Approved (L1)' },
  { key: 'rejected_checker', label: 'Rejected' },
  { key: 'fully_approved', label: 'Fully Approved' },
];

export default function CheckerInvoices() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null); // 'approve' | 'reject'
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await axios.get(`${API}/invoices`, { headers, params });
      setInvoices(res.data);
    } catch { toast.error('Failed to load invoices'); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const filtered = invoices.filter(inv =>
    inv.invoice_no?.toLowerCase().includes(search.toLowerCase()) ||
    inv.buyer_name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.channel_partner?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {};
  TABS.forEach(t => { counts[t.key] = t.key === 'all' ? invoices.length : invoices.filter(i => i.status === t.key).length; });

  const handleAction = async () => {
    if (!selected || !action) return;
    if (action === 'reject' && !remarks.trim()) { toast.error('Rejection comment is mandatory'); return; }
    setActionLoading(true);
    try {
      const status = action === 'approve' ? 'approved_l1' : 'rejected_checker';
      await axios.put(`${API}/invoices/${selected.id}/status`, { status, remarks }, { headers });
      toast.success(action === 'approve' ? 'Invoice approved (L1)' : 'Invoice rejected');
      setSelected(null); setAction(null); setRemarks('');
      fetchInvoices();
    } catch (e) { toast.error(e.response?.data?.detail || 'Action failed'); }
    finally { setActionLoading(false); }
  };

  return (
    <Layout>
      <div data-testid="checker-invoices">
        <div className="scf-table-card">
          <div style={{ padding: '0 20px' }}>
            <div className="scf-tabs">
              {TABS.map(t => (
                <div key={t.key} className={`scf-tab${activeTab === t.key ? ' active' : ''}`} onClick={() => setActiveTab(t.key)} data-testid={`tab-${t.key}`}>
                  {t.label}{counts[t.key] > 0 && <span className="scf-tab-count">{counts[t.key]}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="scf-filter-bar">
            <div className="scf-search-wrap"><Search /><input className="scf-search-input" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>{filtered.length} records</span>
          </div>
          <div className="scf-table-wrap">
            <table className="scf-table">
              <thead><tr><th>#</th><th>Invoice No</th><th>Channel Partner</th><th>Invoice Date</th><th>Due Date</th><th>Amount</th><th>Net Amount</th><th>Raised By</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={10} className="scf-loading"><div className="scf-spinner"></div></td></tr>
                  : filtered.length === 0 ? <tr><td colSpan={10}><div className="scf-empty"><FileText /><h3>No invoices found</h3></div></td></tr>
                  : filtered.map((inv, i) => (
                    <tr key={inv.id}>
                      <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: '#5b21b6' }}>{inv.invoice_no}</td>
                      <td>{inv.channel_partner}</td>
                      <td>{fmtDate(inv.invoice_date)}</td>
                      <td>{fmtDate(inv.due_date)}</td>
                      <td className="scf-amount">{fmt(inv.amount)}</td>
                      <td className="scf-amount">{fmt(inv.net_amount)}</td>
                      <td style={{ fontSize: 12 }}>{inv.created_by_name}</td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="scf-btn scf-btn-secondary scf-btn-sm" onClick={() => { setSelected(inv); setAction(null); setRemarks(''); }} data-testid={`view-${inv.id}`}><Eye size={12} /> View</button>
                          {inv.status === 'pending_checker_approval' && (
                            <>
                              <button className="scf-btn scf-btn-success scf-btn-sm" onClick={() => { setSelected(inv); setAction('approve'); setRemarks(''); }} data-testid={`approve-${inv.id}`}><CheckCircle size={12} /></button>
                              <button className="scf-btn scf-btn-danger scf-btn-sm" onClick={() => { setSelected(inv); setAction('reject'); setRemarks(''); }} data-testid={`reject-${inv.id}`}><XCircle size={12} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="scf-pagination"><span>Showing {filtered.length} of {invoices.length} invoices</span></div>
        </div>

        {/* Detail + Action Panel */}
        {selected && (
          <div className="scf-modal-overlay" onClick={() => setSelected(null)}>
            <div className="scf-modal-panel" onClick={e => e.stopPropagation()} data-testid="checker-detail">
              <div className="scf-modal-header">
                <div><div className="scf-modal-title">{selected.invoice_no}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{selected.program_name}</div></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><StatusBadge status={selected.status} /><button className="scf-modal-close" onClick={() => setSelected(null)}><X size={14} /></button></div>
              </div>
              <div className="scf-modal-body">
                <div className="scf-detail-section">
                  <div className="scf-detail-section-title">Invoice Information</div>
                  <div className="scf-detail-grid">
                    {[['Invoice No', selected.invoice_no], ['Program', selected.program_name], ['Invoice Date', fmtDate(selected.invoice_date)], ['Due Date', fmtDate(selected.due_date)], ['Channel Partner', selected.channel_partner], ['Raised By', selected.created_by_name]].map(([l, v]) => (
                      <div key={l} className="scf-detail-item"><label>{l}</label><span>{v}</span></div>
                    ))}
                  </div>
                </div>

                {/* CP LIMIT - visible to checker */}
                {CP_LIMITS[selected.channel_partner] && (
                  <div className="scf-detail-section">
                    <div className="scf-detail-section-title">CP Limit Details</div>
                    <div style={{ background: '#f0f9ff', borderRadius: 8, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, border: '1px solid #bae6fd' }}>
                      {[['Sanctioned Limit', `\u20b9${CP_LIMITS[selected.channel_partner].limit} L`], ['Utilized', `\u20b9${CP_LIMITS[selected.channel_partner].utilized} L`], ['Available', `\u20b9${CP_LIMITS[selected.channel_partner].available} L`], ['ROI', `${CP_LIMITS[selected.channel_partner].roi}% p.a.`], ['PTE Days', `${CP_LIMITS[selected.channel_partner].pte} Days`]].map(([l, v]) => (
                        <div key={l}><div style={{ fontSize: 10.5, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13.5, fontWeight: 600, color: v.includes('L') && l === 'Available' ? '#059669' : '#1e1b4b' }}>{v}</div></div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="scf-detail-section">
                  <div className="scf-detail-section-title">Financial Summary</div>
                  <div className="scf-detail-grid">
                    {[['Invoice Amount', fmt(selected.amount)], ['Discount Rate', `${selected.discount_rate}% p.a.`], ['Discount Amount', fmt(selected.discount_amount)], ['Net Amount', fmt(selected.net_amount)]].map(([l, v]) => (
                      <div key={l} className="scf-detail-item"><label>{l}</label><span style={{ fontWeight: l === 'Net Amount' ? 700 : 500 }}>{v}</span></div>
                    ))}
                  </div>
                </div>
                {selected.line_items?.length > 0 && (
                  <div className="scf-detail-section">
                    <div className="scf-detail-section-title">Line Items</div>
                    <table className="scf-line-table">
                      <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                      <tbody>{selected.line_items.map((li, idx) => (<tr key={idx}><td>{li.description}</td><td>{li.qty}</td><td>{fmt(li.unit_price)}</td><td>{fmt(li.total)}</td></tr>))}</tbody>
                      <tfoot><tr><td colSpan={3}>Total</td><td>{fmt(selected.amount)}</td></tr></tfoot>
                    </table>
                  </div>
                )}
                {selected.remarks && (
                  <div className="scf-detail-section">
                    <div className="scf-detail-section-title">Remarks</div>
                    <p style={{ margin: 0, fontSize: 13, color: '#374151', background: '#f8f9fc', padding: '10px 14px', borderRadius: 6 }}>{selected.remarks}</p>
                  </div>
                )}
              </div>

              {/* Action section */}
              {selected.status === 'pending_checker_approval' && (
                <>
                  {action && (
                    <div className="scf-remarks-section" style={{ borderTop: '2px solid ' + (action === 'reject' ? '#fee2e2' : '#d1fae5'), background: action === 'reject' ? '#fff5f5' : '#f0fdf4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        {action === 'reject' && <AlertCircle size={14} style={{ color: '#dc2626' }} />}
                        <label style={{ fontSize: 12, fontWeight: 700, color: action === 'reject' ? '#dc2626' : '#059669', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          {action === 'approve' ? 'Approval Comment (optional)' : 'Rejection Comment (required *)'}
                        </label>
                      </div>
                      <textarea rows={3} placeholder={action === 'reject' ? 'Please provide reason for rejection...' : 'Add approval notes...'}
                        value={remarks} onChange={e => setRemarks(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: `1.5px solid ${action === 'reject' ? '#fca5a5' : '#6ee7b7'}`, borderRadius: 7, fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', color: '#374151', background: '#fff' }}
                        data-testid="action-remarks" />
                    </div>
                  )}
                  <div className="scf-modal-footer">
                    <button className="scf-btn scf-btn-secondary" onClick={() => { setSelected(null); setAction(null); }}>Cancel</button>
                    {(!action || action === 'reject') && (
                      <button className="scf-btn scf-btn-danger" onClick={() => action === 'reject' ? handleAction() : setAction('reject')} disabled={actionLoading} data-testid="reject-action-btn">
                        <XCircle size={14} /> {action === 'reject' ? 'Confirm Reject' : 'Reject'}
                      </button>
                    )}
                    {(!action || action === 'approve') && (
                      <button className="scf-btn scf-btn-success" onClick={() => action === 'approve' ? handleAction() : setAction('approve')} disabled={actionLoading} data-testid="approve-action-btn">
                        <CheckCircle size={14} /> {action === 'approve' ? 'Confirm Approve (L1)' : 'Approve'}
                      </button>
                    )}
                  </div>
                </>
              )}
              {selected.status !== 'pending_checker_approval' && (
                <div className="scf-modal-footer"><button className="scf-btn scf-btn-secondary" onClick={() => setSelected(null)}>Close</button></div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
