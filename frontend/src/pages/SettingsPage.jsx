import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Palette, Monitor, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [newUser, setNewUser] = useState({ name: '', email: '', role: '' });
  const [theme, setTheme] = useState('default');
  const [fontSize, setFontSize] = useState('medium');

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error('Please fill all fields');
      return;
    }
    toast.success(`User "${newUser.name}" added successfully (prototype)`);
    setNewUser({ name: '', email: '', role: '' });
  };

  return (
    <Layout>
      <div data-testid="settings-page">
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Settings</h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>Manage users and UI preferences</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Add New User */}
          <div className="scf-table-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, background: '#ede9fe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={18} style={{ color: '#6d28d9' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b' }}>Add New User</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Invite team members to the platform</div>
              </div>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="scf-form-group">
                <label className="scf-label">Full Name *</label>
                <input className="scf-input" placeholder="Enter full name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} data-testid="settings-user-name" />
              </div>
              <div className="scf-form-group">
                <label className="scf-label">Email Address *</label>
                <input className="scf-input" type="email" placeholder="user@company.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} data-testid="settings-user-email" />
              </div>
              <div className="scf-form-group">
                <label className="scf-label">Role *</label>
                <select className="scf-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} data-testid="settings-user-role">
                  <option value="">Select Role...</option>
                  <option value="anchor_maker">Anchor Maker</option>
                  <option value="anchor_checker">Anchor Checker</option>
                  <option value="channel_partner">Channel Partner Admin</option>
                </select>
              </div>
              <button type="submit" className="scf-btn scf-btn-primary" style={{ width: '100%', justifyContent: 'center' }} data-testid="settings-add-user-btn">
                <UserPlus size={14} /> Add User
              </button>
            </form>
          </div>

          {/* UI Alignment / Preferences */}
          <div className="scf-table-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 38, height: 38, background: '#d1fae5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Palette size={18} style={{ color: '#059669' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b' }}>UI Preferences</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Customize your interface settings</div>
              </div>
            </div>

            <div className="scf-form-group">
              <label className="scf-label">Theme</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['default', 'compact', 'comfortable'].map(t => (
                  <button key={t} type="button" onClick={() => setTheme(t)} data-testid={`theme-${t}`}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 7, border: theme === t ? '2px solid #6d28d9' : '1.5px solid #e5e7eb', background: theme === t ? '#ede9fe' : '#fff', fontSize: 13, fontWeight: 500, color: theme === t ? '#5b21b6' : '#6b7280', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="scf-form-group">
              <label className="scf-label">Font Size</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['small', 'medium', 'large'].map(s => (
                  <button key={s} type="button" onClick={() => setFontSize(s)} data-testid={`font-${s}`}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 7, border: fontSize === s ? '2px solid #6d28d9' : '1.5px solid #e5e7eb', background: fontSize === s ? '#ede9fe' : '#fff', fontSize: 13, fontWeight: 500, color: fontSize === s ? '#5b21b6' : '#6b7280', cursor: 'pointer', textTransform: 'capitalize' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="scf-form-group">
              <label className="scf-label">Table Density</label>
              <select className="scf-select" data-testid="settings-density">
                <option>Default</option>
                <option>Compact</option>
                <option>Comfortable</option>
              </select>
            </div>

            <div className="scf-form-group" style={{ marginBottom: 0 }}>
              <label className="scf-label">Date Format</label>
              <select className="scf-select" data-testid="settings-date-format">
                <option>DD-MMM-YYYY (01-Jan-2026)</option>
                <option>DD/MM/YYYY (01/01/2026)</option>
                <option>YYYY-MM-DD (2026-01-01)</option>
              </select>
            </div>

            <button type="button" className="scf-btn scf-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }} onClick={() => toast.success('Preferences saved (prototype)')} data-testid="settings-save-btn">
              <Save size={14} /> Save Preferences
            </button>
          </div>
        </div>

        {/* Current User Info */}
        <div className="scf-table-card" style={{ padding: 24, marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, background: '#fef3c7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Monitor size={18} style={{ color: '#d97706' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1e1b4b' }}>Account Information</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Your current session details</div>
            </div>
          </div>
          <div className="scf-detail-grid">
            <div className="scf-detail-item"><label>Name</label><span>{user?.name}</span></div>
            <div className="scf-detail-item"><label>Email</label><span>{user?.email}</span></div>
            <div className="scf-detail-item"><label>Role</label><span style={{ textTransform: 'capitalize' }}>{user?.role?.replace(/_/g, ' ')}</span></div>
            <div className="scf-detail-item"><label>Company</label><span>{user?.company}</span></div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
