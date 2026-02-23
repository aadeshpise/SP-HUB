import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Search, X, Building2, MapPin, CreditCard, Phone, Mail } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL + '/api';

export default function CPChannelPartners() {
  const { token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/channel-partners`, { headers }).then(r => setPartners(r.data)).catch(() => {});
  }, []);

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.state.toLowerCase().includes(search.toLowerCase())
  );

  const pct = (u, t) => t ? Math.round((u / t) * 100) : 0;

  return (
    <Layout>
      <div data-testid="cp-channel-partners">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total Partners', value: partners.length },
            { label: 'Active', value: partners.filter(p => p.status === 'Active').length },
            { label: 'Dealers', value: partners.filter(p => p.type === 'Dealer').length },
            { label: 'Vendors', value: partners.filter(p => p.type === 'Vendor').length },
          ].map(s => (
            <div key={s.label} className="scf-stat-card">
              <div className="scf-stat-label">{s.label}</div>
              <div className="scf-stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="scf-table-card">
          <div className="scf-table-header">
            <div>
              <div className="scf-table-title">Active Channel Partners</div>
              <div className="scf-table-subtitle">{filtered.length} partners found</div>
            </div>
            <div className="scf-search-wrap">
              <Search />
              <input className="scf-search-input" placeholder="Search by name, city..." value={search} onChange={e => setSearch(e.target.value)} data-testid="cp-partner-search" />
            </div>
          </div>
          <div className="scf-table-wrap">
            <table className="scf-table">
              <thead>
                <tr><th>#</th><th>Partner Name</th><th>CP ID</th><th>Type</th><th>City</th><th>Sanctioned Limit</th><th>Utilized</th><th>Available</th><th>Utilization</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(p)} data-testid={`cp-row-${p.id}`}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: '#1e1b4b' }}>{p.name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280' }}>{p.cp_id}</td>
                    <td><span className={`scf-badge ${p.type === 'Dealer' ? 'badge-checker' : 'badge-credit'}`}>{p.type}</span></td>
                    <td>{p.city}, {p.state}</td>
                    <td className="scf-amount">₹{(p.sanctioned_limit / 100000).toFixed(0)} L</td>
                    <td>₹{(p.utilized / 100000).toFixed(0)} L</td>
                    <td style={{ color: '#059669', fontWeight: 500 }}>₹{(p.available / 100000).toFixed(0)} L</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, minWidth: 60 }}>
                          <div style={{ width: `${pct(p.utilized, p.sanctioned_limit)}%`, height: '100%', background: '#7c3aed', borderRadius: 3 }}></div>
                        </div>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{pct(p.utilized, p.sanctioned_limit)}%</span>
                      </div>
                    </td>
                    <td><span className={`scf-badge ${p.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="scf-pagination"><span>Showing {filtered.length} of {partners.length} partners</span></div>
        </div>

        {/* Detail Modal */}
        {selected && (
          <div className="scf-modal-overlay" onClick={() => setSelected(null)}>
            <div className="scf-modal-panel" onClick={e => e.stopPropagation()} data-testid="cp-partner-detail">
              <div className="scf-modal-header">
                <div>
                  <div className="scf-modal-title">{selected.full_name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{selected.cp_id} | GST: {selected.gst}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className={`scf-badge ${selected.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{selected.status}</span>
                  <button className="scf-modal-close" onClick={() => setSelected(null)} data-testid="close-cp-detail"><X size={14} /></button>
                </div>
              </div>
              <div className="scf-modal-body">
                <div className="scf-detail-section">
                  <div className="scf-detail-section-title">Company Information</div>
                  <div className="scf-detail-grid">
                    {[['Full Name', selected.full_name], ['CP ID', selected.cp_id], ['GST Number', selected.gst], ['Type', selected.type], ['City', selected.city], ['State', selected.state], ['Product', selected.product], ['Active Since', selected.active_since]].map(([l, v]) => (
                      <div key={l} className="scf-detail-item"><label>{l}</label><span>{v}</span></div>
                    ))}
                  </div>
                </div>

                <div className="scf-detail-section">
                  <div className="scf-detail-section-title">Limit Details</div>
                  <div style={{ background: '#f0f9ff', borderRadius: 8, padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, border: '1px solid #bae6fd' }}>
                    {[['Sanctioned Limit', `₹${(selected.sanctioned_limit / 100000).toFixed(0)} L`], ['Utilized', `₹${(selected.utilized / 100000).toFixed(0)} L`], ['Available', `₹${(selected.available / 100000).toFixed(0)} L`], ['ROI', `${selected.roi}% p.a.`], ['PTE Days', `${selected.pte_days} Days`], ['Bank', selected.bank]].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 10.5, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: l === 'Available' ? '#059669' : '#1e1b4b' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="scf-detail-section">
                  <div className="scf-detail-section-title">Operational Settings</div>
                  <div className="scf-detail-grid">
                    {[['Grace Period', `${selected.grace_period} Days`], ['Stop Supply', `${selected.stop_supply} Days`], ['Stale Invoice', `${selected.stale_invoice} Days`], ['Bank', selected.bank]].map(([l, v]) => (
                      <div key={l} className="scf-detail-item"><label>{l}</label><span>{v}</span></div>
                    ))}
                  </div>
                </div>

                <div className="scf-detail-section">
                  <div className="scf-detail-section-title">Contact Details</div>
                  <div className="scf-detail-grid">
                    <div className="scf-detail-item"><label>Phone</label><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={12} />{selected.contact}</span></div>
                    <div className="scf-detail-item"><label>Email</label><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12} />{selected.email}</span></div>
                  </div>
                  <div className="scf-detail-item" style={{ marginTop: 12 }}><label>Address</label><span>{selected.address}</span></div>
                </div>
              </div>
              <div className="scf-modal-footer"><button className="scf-btn scf-btn-secondary" onClick={() => setSelected(null)}>Close</button></div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
