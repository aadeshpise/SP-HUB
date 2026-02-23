import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, CheckCircle, Clock, IndianRupee, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_BACKEND_URL + '/api';

export default function CPDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [programs, setPrograms] = useState([]);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/stats`, { headers }).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/programs`, { headers }).then(r => setPrograms(r.data)).catch(() => {});
  }, []);

  const statCards = [
    { label: 'My SCF Limit', value: '₹50 Cr', sub: 'Sanctioned by Tata Motors', icon: <IndianRupee size={18} />, color: '#ede9fe', iconColor: '#6d28d9' },
    { label: 'Active Programs', value: programs.length, sub: 'With Tata Motors', icon: <Building2 size={18} />, color: '#d1fae5', iconColor: '#059669' },
    { label: 'Total Invoices', value: stats?.total_invoices ?? '—', sub: 'All submissions', icon: <FileText size={18} />, color: '#fef3c7', iconColor: '#d97706' },
    { label: 'Fully Approved', value: stats?.fully_approved ?? '—', sub: `₹${((stats?.approved_amount || 0) / 10000000).toFixed(1)} Cr funded`, icon: <CheckCircle size={18} />, color: '#d1fae5', iconColor: '#059669' },
  ];

  return (
    <Layout>
      <div data-testid="cp-dashboard">
        {/* Welcome banner */}
        <div style={{ background: 'linear-gradient(135deg, #1a1563 0%, #2d2196 100%)', borderRadius: 12, padding: '20px 24px', marginBottom: 20, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Welcome, {user?.name}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{user?.company} - Channel Partner Portal</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Anchor</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Tata Motors Ltd</div>
            </div>
          </div>
        </div>

        <div className="scf-stats-grid">
          {statCards.map(c => (
            <div className="scf-stat-card" key={c.label}>
              <div className="scf-stat-icon" style={{ background: c.color }}><span style={{ color: c.iconColor }}>{c.icon}</span></div>
              <div className="scf-stat-label">{c.label}</div>
              <div className="scf-stat-value">{c.value}</div>
              <div className="scf-stat-sub">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Pending My Approval', value: stats?.approved_l1 ?? 0, sub: 'L1 approved, awaiting your review', color: '#fef3c7', text: '#92400e', icon: <Clock size={20} /> },
            { label: 'Fully Approved', value: stats?.fully_approved ?? 0, sub: 'Successfully processed', color: '#d1fae5', text: '#065f46', icon: <CheckCircle size={20} /> },
          ].map(item => (
            <div key={item.label} className="scf-stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.text }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#1e1b4b' }}>{item.value}</div>
                <div style={{ fontSize: 13, color: '#1e1b4b', fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Programs */}
        <div className="scf-table-card">
          <div className="scf-table-header">
            <div>
              <div className="scf-table-title">My Active Programs</div>
              <div className="scf-table-subtitle">SCF programs assigned to you</div>
            </div>
          </div>
          <div className="scf-table-wrap">
            <table className="scf-table">
              <thead>
                <tr><th>Anchor</th><th>Product</th><th>PTE Days</th><th>Limit</th><th>Utilized</th><th>Available</th><th>Status</th></tr>
              </thead>
              <tbody>
                {programs.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.anchor}</td>
                    <td><span className="scf-badge badge-checker">{p.product}</span></td>
                    <td>{p.pte_days} days</td>
                    <td className="scf-amount">₹{(p.total_limit / 100000).toFixed(0)} L</td>
                    <td>₹{(p.utilized / 100000).toFixed(0)} L</td>
                    <td style={{ color: '#059669', fontWeight: 500 }}>₹{(p.available / 100000).toFixed(0)} L</td>
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
