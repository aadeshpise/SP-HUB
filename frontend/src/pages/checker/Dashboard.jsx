import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Users, Clock, CheckCircle, TrendingUp, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_BACKEND_URL + '/api';

export default function CheckerDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [programs, setPrograms] = useState([]);
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API}/stats`, { headers }).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/programs`, { headers }).then(r => setPrograms(r.data)).catch(() => {});
  }, []);

  return (
    <Layout>
      <div data-testid="checker-dashboard">
        {/* Summary stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
          {[
            { label: 'Total SCF Limit', value: '₹200 Cr', icon: <IndianRupee size={16} />, bg: '#ede9fe', ic: '#6d28d9' },
            { label: 'Active Programs', value: programs.length, icon: <TrendingUp size={16} />, bg: '#d1fae5', ic: '#059669' },
            { label: 'Total Invoices', value: stats?.total_invoices ?? '—', icon: <FileText size={16} />, bg: '#fef3c7', ic: '#d97706' },
            { label: 'Pending Approval', value: stats?.pending_checker ?? '—', icon: <Clock size={16} />, bg: '#fef3c7', ic: '#d97706' },
            { label: 'Approved (L1)', value: stats?.approved_l1 ?? '—', icon: <CheckCircle size={16} />, bg: '#d1fae5', ic: '#059669' },
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

        {/* Programs Overview */}
        <div className="scf-table-card">
          <div className="scf-table-header">
            <div>
              <div className="scf-table-title">Active Programs Overview</div>
              <div className="scf-table-subtitle">SCF programs and limit utilization</div>
            </div>
            <span style={{ fontSize: 12, color: '#6d28d9', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/checker/programs')}>View All →</span>
          </div>
          <div className="scf-table-wrap">
            <table className="scf-table">
              <thead>
                <tr><th>Channel Partner</th><th>Product</th><th>PTE Days</th><th>Total Limit</th><th>Utilized</th><th>Available</th><th>ROI</th><th>Status</th></tr>
              </thead>
              <tbody>
                {programs.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.channel_partner}</td>
                    <td><span className={`scf-badge ${p.product === 'Dealer Finance' ? 'badge-checker' : 'badge-credit'}`}>{p.product}</span></td>
                    <td>{p.pte_days} days</td>
                    <td className="scf-amount">₹{(p.total_limit / 100000).toFixed(0)} L</td>
                    <td>₹{(p.utilized / 100000).toFixed(0)} L</td>
                    <td style={{ color: '#059669', fontWeight: 500 }}>₹{(p.available / 100000).toFixed(0)} L</td>
                    <td>{p.roi}%</td>
                    <td><span className={`scf-badge ${p.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Showing {programs.length} programs</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
