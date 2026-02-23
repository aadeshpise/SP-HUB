import React from 'react';
import Layout from '@/components/Layout';
import { Landmark } from 'lucide-react';

const LENDERS = [
  { id: 'LENDER0004', name: 'CENTRAL BANK OF INDIA', short: 'CBI', type: 'Public Sector', programs: 2, status: 'Active', contact: 'cbi.scf@centralbank.in' },
  { id: 'LENDER0031', name: 'STATE BANK OF INDIA', short: 'SBI', type: 'Public Sector', programs: 1, status: 'Active', contact: 'scf@sbi.co.in' },
  { id: 'LENDER0022', name: 'HDFC BANK', short: 'HDFC', type: 'Private Sector', programs: 1, status: 'Active', contact: 'scf@hdfcbank.com' },
  { id: 'LENDER0015', name: 'ICICI BANK', short: 'ICICI', type: 'Private Sector', programs: 0, status: 'Inactive', contact: 'scf@icicibank.com' },
];

export default function MakerLenders() {
  return (
    <Layout>
      <div data-testid="maker-lenders">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total Lenders', value: LENDERS.length },
            { label: 'Active', value: LENDERS.filter(l => l.status === 'Active').length },
            { label: 'Total Programs', value: LENDERS.reduce((s, l) => s + l.programs, 0) },
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
              <div className="scf-table-title">Lender Network</div>
              <div className="scf-table-subtitle">Financial institutions in your SCF network</div>
            </div>
          </div>
          <div className="scf-table-wrap">
            <table className="scf-table">
              <thead>
                <tr><th>#</th><th>Lender</th><th>Platform ID</th><th>Type</th><th>Active Programs</th><th>Contact</th><th>Status</th></tr>
              </thead>
              <tbody>
                {LENDERS.map((l, i) => (
                  <tr key={l.id}>
                    <td style={{ color: '#9ca3af' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{l.short}</div>
                        <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{l.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 12.5 }}>{l.id}</td>
                    <td><span className={`scf-badge ${l.type === 'Public Sector' ? 'badge-checker' : 'badge-credit'}`}>{l.type}</span></td>
                    <td style={{ fontWeight: 600, color: '#1e1b4b' }}>{l.programs}</td>
                    <td style={{ fontSize: 12.5, color: '#6b7280' }}>{l.contact}</td>
                    <td><span className={`scf-badge ${l.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{l.status}</span></td>
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
