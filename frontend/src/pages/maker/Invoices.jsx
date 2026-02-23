import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Search, Eye, PlusCircle, X, FileText, Upload, Trash2, Calendar } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL + '/api';
const fmt = (n) => `\u20b9${(n / 100000).toFixed(2)} L`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '\u2014';

const CP_OPTIONS = ['Jagdamba Motors', 'Krishna Auto Dealers', 'Shree Ganesh Motors', 'Meenakshi Auto', 'Sunrise Vehicles'];
const PROGRAMS = ['Dealer Finance Program', 'Vendor Finance Program'];

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
  { key: 'pending_checker_approval', label: 'Pending Checker' },
  { key: 'approved_l1', label: 'Approved (L1)' },
  { key: 'rejected_checker', label: 'Rejected' },
  { key: 'fully_approved', label: 'Fully Approved' },
];

export default function MakerInvoices() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showRaise, setShowRaise] = useState(false);
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

  return (
    <Layout headerActions={
      <button className="scf-btn scf-btn-primary" onClick={() => setShowRaise(true)} data-testid="raise-invoice-btn">
        <PlusCircle size={14} /> Raise Invoice
      </button>
    }>
      <div data-testid="maker-invoices">
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
            <div className="scf-search-wrap"><Search /><input className="scf-search-input" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} data-testid="invoice-search" /></div>
            <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>{filtered.length} records</span>
          </div>
          <div className="scf-table-wrap">
            <table className="scf-table">
              <thead><tr><th>#</th><th>Invoice No</th><th>Channel Partner</th><th>Invoice Date</th><th>Due Date</th><th>Amount</th><th>Disc. Rate</th><th>Net Amount</th><th>Status</th><th>Actions</th></tr></thead>
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
                      <td>{inv.discount_rate}%</td>
                      <td className="scf-amount">{fmt(inv.net_amount)}</td>
                      <td><StatusBadge status={inv.status} /></td>
                      <td><button className="scf-btn scf-btn-secondary scf-btn-sm" onClick={() => setSelected(inv)} data-testid={`view-${inv.id}`}><Eye size={12} /> View</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="scf-pagination"><span>Showing {filtered.length} of {invoices.length} invoices</span></div>
        </div>

        {/* Invoice Detail Panel */}
        {selected && (
          <div className="scf-modal-overlay" onClick={() => setSelected(null)}>
            <div className="scf-modal-panel" onClick={e => e.stopPropagation()} data-testid="invoice-detail">
              <div className="scf-modal-header">
                <div><div className="scf-modal-title">{selected.invoice_no}</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{selected.program_name}</div></div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><StatusBadge status={selected.status} /><button className="scf-modal-close" onClick={() => setSelected(null)} data-testid="close-detail"><X size={14} /></button></div>
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
                <div className="scf-detail-section">
                  <div className="scf-detail-section-title">Financial Summary</div>
                  <div className="scf-detail-grid">
                    {[['Invoice Amount', fmt(selected.amount)], ['Discount Rate', `${selected.discount_rate}% p.a.`], ['Discount Amount', fmt(selected.discount_amount)], ['Net Amount', fmt(selected.net_amount)]].map(([l, v]) => (
                      <div key={l} className="scf-detail-item"><label>{l}</label><span style={{ fontWeight: l === 'Net Amount' ? 700 : 500 }}>{v}</span></div>
                    ))}
                  </div>
                </div>
                {/* CP Limits Box */}
                {CP_LIMITS[selected.channel_partner] && (
                  <div className="scf-detail-section">
                    <div className="scf-detail-section-title">CP Limit Details</div>
                    <div style={{ background: '#f0f4ff', borderRadius: 8, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      {Object.entries({ 'Sanctioned Limit': `\u20b9${CP_LIMITS[selected.channel_partner].limit} L`, 'Utilized': `\u20b9${CP_LIMITS[selected.channel_partner].utilized} L`, 'Available': `\u20b9${CP_LIMITS[selected.channel_partner].available} L`, 'ROI': `${CP_LIMITS[selected.channel_partner].roi}%`, 'PTE Days': `${CP_LIMITS[selected.channel_partner].pte} Days` }).map(([l, v]) => (
                        <div key={l}><div style={{ fontSize: 10.5, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b' }}>{v}</div></div>
                      ))}
                    </div>
                  </div>
                )}
                {selected.line_items?.length > 0 && (
                  <div className="scf-detail-section">
                    <div className="scf-detail-section-title">Line Items</div>
                    <table className="scf-line-table">
                      <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                      <tbody>{selected.line_items.map((li, i) => (<tr key={i}><td>{li.description}</td><td>{li.qty}</td><td>{fmt(li.unit_price)}</td><td>{fmt(li.total)}</td></tr>))}</tbody>
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
              <div className="scf-modal-footer"><button className="scf-btn scf-btn-secondary" onClick={() => setSelected(null)}>Close</button></div>
            </div>
          </div>
        )}

        {/* Raise Invoice Modal */}
        {showRaise && <RaiseInvoiceModal headers={headers} onClose={() => setShowRaise(false)} onSuccess={() => { setShowRaise(false); fetchInvoices(); }} />}
      </div>
    </Layout>
  );
}

function RaiseInvoiceModal({ headers, onClose, onSuccess }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    invoice_no: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    invoice_date: today, due_date: '', channel_partner: '', buyer_name: '', seller_name: 'Tata Motors Ltd',
    program_name: '', amount: '', discount_rate: '8.5', description: ''
  });
  const [lineItems, setLineItems] = useState([{ description: '', qty: 1, unit_price: '', total: 0 }]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const cpLimit = CP_LIMITS[form.channel_partner];
  const discountAmt = (Number(form.amount) * Number(form.discount_rate)) / 100 / 12;
  const netAmt = Number(form.amount) - discountAmt;

  const updateLI = (i, key, val) => {
    const items = [...lineItems];
    items[i] = { ...items[i], [key]: val };
    if (key === 'qty' || key === 'unit_price') items[i].total = Number(key === 'qty' ? val : items[i].qty) * Number(key === 'unit_price' ? val : items[i].unit_price);
    setLineItems(items);
    setF('amount', items.reduce((s, l) => s + (l.total || 0), 0).toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.channel_partner || !form.amount || !form.program_name || !form.due_date) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/invoices`, { ...form, amount: Number(form.amount), discount_rate: Number(form.discount_rate), line_items: lineItems.filter(li => li.description), documents: docs }, { headers });
      toast.success('Invoice raised! Pending Checker Approval.');
      onSuccess();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to raise invoice'); }
    finally { setLoading(false); }
  };

  return (
    <div className="scf-modal-overlay" onClick={onClose}>
      <div className="scf-modal-panel" style={{ width: 680 }} onClick={e => e.stopPropagation()} data-testid="raise-invoice-modal">
        <div className="scf-modal-header">
          <div className="scf-modal-title">Raise New Invoice</div>
          <button className="scf-modal-close" onClick={onClose} data-testid="close-raise-modal"><X size={14} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="scf-modal-body" style={{ paddingBottom: 0 }}>
            {/* Invoice Details */}
            <div className="scf-detail-section">
              <div className="scf-detail-section-title">Invoice Details</div>
              <div className="scf-form-grid-2">
                <div className="scf-form-group"><label className="scf-label">Invoice No *</label><input className="scf-input" value={form.invoice_no} onChange={e => setF('invoice_no', e.target.value)} required data-testid="ri-no" /></div>
                <div className="scf-form-group">
                  <label className="scf-label">Channel Partner *</label>
                  <select className="scf-select" value={form.channel_partner} onChange={e => { setF('channel_partner', e.target.value); setF('buyer_name', e.target.value); }} required data-testid="ri-cp">
                    <option value="">Select Channel Partner...</option>
                    {CP_OPTIONS.map(cp => <option key={cp}>{cp}</option>)}
                  </select>
                </div>
                {cpLimit && (
                  <div style={{ gridColumn: 'span 2', background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 24, border: '1px solid #bae6fd' }}>
                    <div><span style={{ fontSize: 11, color: '#6b7280' }}>Available Limit</span><div style={{ fontWeight: 700, color: '#0369a1' }}>\u20b9{cpLimit.available} L</div></div>
                    <div><span style={{ fontSize: 11, color: '#6b7280' }}>Utilized</span><div style={{ fontWeight: 600, color: '#374151' }}>\u20b9{cpLimit.utilized} L</div></div>
                    <div><span style={{ fontSize: 11, color: '#6b7280' }}>ROI</span><div style={{ fontWeight: 600, color: '#374151' }}>{cpLimit.roi}% p.a.</div></div>
                    <div><span style={{ fontSize: 11, color: '#6b7280' }}>PTE Days</span><div style={{ fontWeight: 600, color: '#374151' }}>{cpLimit.pte} Days</div></div>
                  </div>
                )}
                <div className="scf-form-group"><label className="scf-label">Program *</label><select className="scf-select" value={form.program_name} onChange={e => setF('program_name', e.target.value)} required data-testid="ri-program"><option value="">Select Program...</option>{PROGRAMS.map(p => <option key={p}>{p}</option>)}</select></div>
                <div className="scf-form-group"><label className="scf-label">Seller Name</label><input className="scf-input" value={form.seller_name} onChange={e => setF('seller_name', e.target.value)} /></div>
                <div className="scf-form-group"><label className="scf-label">Invoice Date *</label><input type="date" className="scf-input" value={form.invoice_date} onChange={e => setF('invoice_date', e.target.value)} required /></div>
                <div className="scf-form-group"><label className="scf-label">Due Date *</label><input type="date" className="scf-input" value={form.due_date} onChange={e => setF('due_date', e.target.value)} required data-testid="ri-due" /></div>
              </div>
              <div className="scf-form-group"><label className="scf-label">Description</label><textarea className="scf-textarea" rows={2} value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Invoice description..." /></div>
            </div>

            {/* Line Items */}
            <div className="scf-detail-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div className="scf-detail-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Line Items</div>
                <button type="button" className="scf-btn scf-btn-outline-purple scf-btn-sm" onClick={() => setLineItems([...lineItems, { description: '', qty: 1, unit_price: '', total: 0 }])} data-testid="add-li"><PlusCircle size={12} /> Add Item</button>
              </div>
              <table className="scf-line-table">
                <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th><th></th></tr></thead>
                <tbody>
                  {lineItems.map((li, i) => (
                    <tr key={i}>
                      <td><input className="scf-input" style={{ padding: '5px 8px' }} value={li.description} onChange={e => updateLI(i, 'description', e.target.value)} placeholder="Item description" /></td>
                      <td><input className="scf-input" style={{ padding: '5px 8px', width: 60 }} type="number" min={1} value={li.qty} onChange={e => updateLI(i, 'qty', e.target.value)} /></td>
                      <td><input className="scf-input" style={{ padding: '5px 8px', width: 110 }} type="number" min={0} value={li.unit_price} onChange={e => updateLI(i, 'unit_price', e.target.value)} /></td>
                      <td style={{ fontWeight: 600 }}>\u20b9{li.total.toLocaleString('en-IN')}</td>
                      <td><button type="button" onClick={() => setLineItems(lineItems.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={13} /></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Total</td><td style={{ fontWeight: 700 }}>\u20b9{Number(form.amount).toLocaleString('en-IN')}</td><td /></tr></tfoot>
              </table>
            </div>

            {/* Financial */}
            <div className="scf-detail-section">
              <div className="scf-detail-section-title">Financial Details</div>
              <div className="scf-form-grid-3">
                <div className="scf-form-group"><label className="scf-label">Invoice Amount (\u20b9)</label><input className="scf-input" type="number" value={form.amount} onChange={e => setF('amount', e.target.value)} required data-testid="ri-amount" /></div>
                <div className="scf-form-group"><label className="scf-label">Discount Rate (% p.a.)</label><input className="scf-input" type="number" step="0.1" value={form.discount_rate} onChange={e => setF('discount_rate', e.target.value)} /></div>
                <div className="scf-form-group"><label className="scf-label">Net Amount</label><input className="scf-input" value={`\u20b9${netAmt.toFixed(2)}`} readOnly style={{ background: '#f8f9fc', fontWeight: 600, color: '#059669' }} /></div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="scf-detail-section" style={{ marginBottom: 0 }}>
              <div className="scf-detail-section-title">Supporting Documents</div>
              <div style={{ border: '2px dashed #e5e7eb', borderRadius: 8, padding: '20px', textAlign: 'center', background: '#fafafa', cursor: 'pointer' }} onClick={() => document.getElementById('doc-upload').click()}>
                <Upload size={24} style={{ color: '#9ca3af', margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Click to upload documents <span style={{ fontSize: 11 }}>(PDF, JPG, PNG)</span></p>
                <input id="doc-upload" type="file" multiple accept=".pdf,.jpg,.png" style={{ display: 'none' }}
                  onChange={e => { const files = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, type: f.type })); setDocs([...docs, ...files]); }} />
              </div>
              {docs.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {docs.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#f8f9fc', borderRadius: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 12.5, color: '#374151' }}>{d.name}</span>
                      <button type="button" onClick={() => setDocs(docs.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><X size={13} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="scf-modal-footer">
            <button type="button" className="scf-btn scf-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="scf-btn scf-btn-primary" disabled={loading} data-testid="submit-raise-btn">{loading ? 'Submitting...' : 'Save & Submit for Checker'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
