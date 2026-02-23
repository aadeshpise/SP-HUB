import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Search } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL + '/api';

export default function CheckerChannelPartners() {
  const { token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState('');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/channel-partners`, { headers }).then(r => setPartners(r.data)).catch(() => {});
  }, []);

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase())
  );

  const pct = (u, t) => Math.round((u / t) * 100);

  return (
    <Layout>
      <div data-testid="checker-channel-partners">
        {/* Summary */}
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
              <div className="scf-table-title">Channel Partners</div>
              <div className="scf-table-subtitle">{filtered.length} partners</div>
            </div>
            <div className="scf-search-wrap">
              <Search />
              <input
                className="scf-search-input"
                placeholder="Search by name or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                data-testid="cp-search"
              />
            </div>
          </div>

          <div className="scf-table-wrap">
            <table className="scf-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Partner Name</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Total Limit</th>
                  <th>Utilized</th>
                  <th>Available</th>
                  <th>Utilization</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{p.full_name}</td>
                    <td><span className={`scf-badge ${p.type === 'Dealer' ? 'badge-checker' : 'badge-credit'}`}>{p.type}</span></td>
                    <td>{p.city}</td>
                    <td>{p.state}</td>
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
        </div>
      </div>
    </Layout>
  );
}
