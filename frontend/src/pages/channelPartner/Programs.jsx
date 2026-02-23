import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

const API = import.meta.env.VITE_BACKEND_URL + '/api';

export default function CPPrograms() {
  const { token } = useAuth();
  const [programs, setPrograms] = useState([]);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/programs`, { headers }).then(r => setPrograms(r.data)).catch(() => {});
  }, []);

  const pct = (u, t) => Math.round((u / t) * 100);

  return (
    <Layout>
      <div data-testid="cp-programs">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Total Programs', value: programs.length },
            { label: 'Total Limit', value: `₹${(programs.reduce((a, p) => a + p.total_limit, 0) / 100000).toFixed(0)} L` },
            { label: 'Available', value: `₹${(programs.reduce((a, p) => a + p.available, 0) / 100000).toFixed(0)} L` },
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
              <div className="scf-table-title">My Active Programs</div>
              <div className="scf-table-subtitle">Financing programs with Tata Motors</div>
            </div>
          </div>
          <div className="scf-table-wrap">
            <table className="scf-table">
              <thead>
                <tr><th>#</th><th>Anchor</th><th>Product</th><th>PTE Days</th><th>Total Limit</th><th>Utilized</th><th>Available</th><th>Utilization</th><th>Status</th></tr>
              </thead>
              <tbody>
                {programs.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{p.anchor}</td>
                    <td><span className={`scf-badge ${p.product === 'Dealer Finance' ? 'badge-checker' : 'badge-credit'}`}>{p.product}</span></td>
                    <td>{p.pte_days} days</td>
                    <td className="scf-amount">₹{(p.total_limit / 100000).toFixed(0)} L</td>
                    <td>₹{(p.utilized / 100000).toFixed(0)} L</td>
                    <td style={{ color: '#059669', fontWeight: 500 }}>₹{(p.available / 100000).toFixed(0)} L</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, minWidth: 60 }}>
                          <div style={{ width: `${pct(p.utilized, p.total_limit)}%`, height: '100%', background: '#7c3aed', borderRadius: 3 }}></div>
                        </div>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{pct(p.utilized, p.total_limit)}%</span>
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
