import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_BACKEND_URL + '/api';

const CHANNEL_PARTNERS = ['Jagdamba Motors', 'Krishna Auto Dealers', 'Shree Ganesh Motors', 'Meenakshi Auto', 'Sunrise Vehicles', 'National Auto Hub'];
const PROGRAMS = ['Dealer Finance Program', 'Vendor Finance Program'];

export default function CheckerRaiseInvoice() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}` };
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    invoice_no: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
    invoice_date: today,
    due_date: '',
    channel_partner: '',
    buyer_name: '',
    seller_name: 'Tata Motors Ltd',
    program_name: '',
    amount: '',
    discount_rate: '8.5',
    description: '',
  });

  const [lineItems, setLineItems] = useState([
    { description: '', qty: 1, unit_price: '', total: 0 }
  ]);

  const [loading, setLoading] = useState(false);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCPChange = (cp) => {
    setField('channel_partner', cp);
    setField('buyer_name', cp);
  };

  const updateLineItem = (i, key, val) => {
    const items = [...lineItems];
    items[i] = { ...items[i], [key]: val };
    if (key === 'qty' || key === 'unit_price') {
      const qty = key === 'qty' ? Number(val) : Number(items[i].qty);
      const price = key === 'unit_price' ? Number(val) : Number(items[i].unit_price);
      items[i].total = qty * price;
    }
    setLineItems(items);
    const total = items.reduce((s, li) => s + (li.total || 0), 0);
    setField('amount', total.toString());
  };

  const addLineItem = () => setLineItems([...lineItems, { description: '', qty: 1, unit_price: '', total: 0 }]);
  const removeLineItem = (i) => {
    if (lineItems.length === 1) return;
    const items = lineItems.filter((_, idx) => idx !== i);
    setLineItems(items);
    setField('amount', items.reduce((s, li) => s + (li.total || 0), 0).toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.channel_partner || !form.amount || !form.program_name || !form.due_date) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/invoices`, {
        ...form,
        amount: Number(form.amount),
        discount_rate: Number(form.discount_rate),
        line_items: lineItems.filter(li => li.description),
      }, { headers });
      toast.success('Invoice raised successfully! Sent for maker approval.');
      navigate('/checker/invoices');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to raise invoice');
    } finally { setLoading(false); }
  };

  const discountAmt = (Number(form.amount) * Number(form.discount_rate)) / 100 / 12;
  const netAmt = Number(form.amount) - discountAmt;

  return (
    <Layout>
      <div data-testid="raise-invoice">
        <div style={{ marginBottom: 16 }}>
          <button className="scf-btn scf-btn-secondary scf-btn-sm" onClick={() => navigate('/checker/invoices')}>
            <ArrowLeft size={14} /> Back to Invoices
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="scf-form-card">
            <div className="scf-form-section-title">Invoice Details</div>
            <div className="scf-form-grid-2">
              <div className="scf-form-group">
                <label className="scf-label">Invoice Number *</label>
                <input className="scf-input" value={form.invoice_no} onChange={e => setField('invoice_no', e.target.value)} data-testid="inv-no" required />
              </div>
              <div className="scf-form-group">
                <label className="scf-label">Channel Partner *</label>
                <select className="scf-select" value={form.channel_partner} onChange={e => handleCPChange(e.target.value)} data-testid="inv-cp" required>
                  <option value="">Select channel partner...</option>
                  {CHANNEL_PARTNERS.map(cp => <option key={cp} value={cp}>{cp}</option>)}
                </select>
              </div>
              <div className="scf-form-group">
                <label className="scf-label">Program *</label>
                <select className="scf-select" value={form.program_name} onChange={e => setField('program_name', e.target.value)} data-testid="inv-program" required>
                  <option value="">Select program...</option>
                  {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="scf-form-group">
                <label className="scf-label">Seller Name</label>
                <input className="scf-input" value={form.seller_name} onChange={e => setField('seller_name', e.target.value)} data-testid="inv-seller" />
              </div>
              <div className="scf-form-group">
                <label className="scf-label">Invoice Date *</label>
                <input type="date" className="scf-input" value={form.invoice_date} onChange={e => setField('invoice_date', e.target.value)} data-testid="inv-date" required />
              </div>
              <div className="scf-form-group">
                <label className="scf-label">Due Date *</label>
                <input type="date" className="scf-input" value={form.due_date} onChange={e => setField('due_date', e.target.value)} data-testid="inv-due" required />
              </div>
            </div>
            <div className="scf-form-group">
              <label className="scf-label">Description</label>
              <textarea className="scf-textarea" rows={2} placeholder="Invoice description..." value={form.description} onChange={e => setField('description', e.target.value)} data-testid="inv-desc" />
            </div>
          </div>

          {/* Line Items */}
          <div className="scf-form-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>
              <div className="scf-form-section-title" style={{ margin: 0, padding: 0, border: 'none' }}>Line Items</div>
              <button type="button" className="scf-btn scf-btn-outline-purple scf-btn-sm" onClick={addLineItem} data-testid="add-line-item">
                <PlusCircle size={13} /> Add Item
              </button>
            </div>
            <table className="scf-line-table">
              <thead>
                <tr><th>Description</th><th>Qty</th><th>Unit Price (₹)</th><th>Total (₹)</th><th></th></tr>
              </thead>
              <tbody>
                {lineItems.map((li, i) => (
                  <tr key={i}>
                    <td><input className="scf-input" style={{ padding: '6px 10px' }} value={li.description} onChange={e => updateLineItem(i, 'description', e.target.value)} placeholder="Item description" data-testid={`li-desc-${i}`} /></td>
                    <td><input className="scf-input" style={{ padding: '6px 10px', width: 70 }} type="number" min={1} value={li.qty} onChange={e => updateLineItem(i, 'qty', e.target.value)} data-testid={`li-qty-${i}`} /></td>
                    <td><input className="scf-input" style={{ padding: '6px 10px', width: 120 }} type="number" min={0} value={li.unit_price} onChange={e => updateLineItem(i, 'unit_price', e.target.value)} placeholder="0" data-testid={`li-price-${i}`} /></td>
                    <td style={{ fontWeight: 600, color: '#1e1b4b' }}>₹{li.total.toLocaleString('en-IN')}</td>
                    <td>
                      <button type="button" onClick={() => removeLineItem(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }} data-testid={`li-remove-${i}`}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Total Invoice Amount</td><td style={{ fontWeight: 700, color: '#1e1b4b' }}>₹{Number(form.amount).toLocaleString('en-IN')}</td><td></td></tr>
              </tfoot>
            </table>
          </div>

          {/* Financial */}
          <div className="scf-form-card">
            <div className="scf-form-section-title">Financial Details</div>
            <div className="scf-form-grid-3">
              <div className="scf-form-group">
                <label className="scf-label">Invoice Amount (₹)</label>
                <input className="scf-input" type="number" value={form.amount} onChange={e => setField('amount', e.target.value)} data-testid="inv-amount" required />
              </div>
              <div className="scf-form-group">
                <label className="scf-label">Discount Rate (% p.a.)</label>
                <input className="scf-input" type="number" step="0.1" value={form.discount_rate} onChange={e => setField('discount_rate', e.target.value)} data-testid="inv-rate" />
              </div>
              <div className="scf-form-group">
                <label className="scf-label">Discount Amount (₹)</label>
                <input className="scf-input" value={discountAmt.toFixed(2)} readOnly style={{ background: '#f8f9fc' }} />
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#166534', fontWeight: 500 }}>Net Disbursement Amount</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#166534' }}>₹{netAmt.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="scf-btn scf-btn-secondary" onClick={() => navigate('/checker/invoices')}>Cancel</button>
            <button type="submit" className="scf-btn scf-btn-primary" disabled={loading} data-testid="submit-invoice-btn">
              <Save size={14} /> {loading ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
