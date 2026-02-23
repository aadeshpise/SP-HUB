import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Building2, FileText, Users, LogOut, Settings, Landmark, Bell, CreditCard, RefreshCcw } from 'lucide-react';

const MAKER_NAV = [
  { path: '/maker/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/maker/programs', icon: Building2, label: 'Active Programs' },
  { path: '/maker/invoices', icon: FileText, label: 'Invoices' },
  { path: '/maker/lenders', icon: Landmark, label: 'Lenders' },
  { path: '/maker/settings', icon: Settings, label: 'Settings' },
];

const CHECKER_NAV = [
  { path: '/checker/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/checker/programs', icon: Building2, label: 'Active Programs' },
  { path: '/checker/invoices', icon: FileText, label: 'Invoices' },
  { path: '/checker/lenders', icon: Landmark, label: 'Lenders' },
  { path: '/checker/settings', icon: Settings, label: 'Settings' },
];

const CP_NAV = [
  { path: '/cp/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/cp/channel-partners', icon: Users, label: 'Active Channel Partners' },
  { path: '/cp/invoices', icon: FileText, label: 'Invoices' },
  { path: '/cp/repayment', icon: RefreshCcw, label: 'Repayment' },
  { path: '/cp/settings', icon: Settings, label: 'Settings' },
];

const ROLE_LABELS = { anchor_maker: 'Maker Access', anchor_checker: 'Checker Access', channel_partner: 'Partner Access' };

export default function Layout({ children, headerActions }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === 'anchor_maker' ? MAKER_NAV : user?.role === 'anchor_checker' ? CHECKER_NAV : CP_NAV;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="scf-layout">
      <aside className="scf-sidebar" data-testid="sidebar">
        <div className="scf-sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 30, height: 30, background: '#7c3aed', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>A</span>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>ANCHOR</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>SCF Platform</div>
            </div>
          </div>
        </div>
        <nav className="scf-sidebar-nav">
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) => `scf-nav-item${isActive ? ' active' : ''}`}>
              <item.icon size={16} />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="scf-sidebar-footer">
          <div className="scf-user-info">
            <div className="scf-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="scf-user-name">{user?.name?.split(' ')[0]}</div>
              <div style={{ color: 'rgba(196,181,253,0.7)', fontSize: 10.5 }}>{ROLE_LABELS[user?.role]}</div>
            </div>
            <button className="scf-logout-btn" onClick={handleLogout} data-testid="logout-btn" title="Logout"><LogOut size={13} /></button>
          </div>
        </div>
      </aside>

      <div className="scf-content">
        <header className="scf-header" data-testid="main-header">
          <div className="scf-header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e1b4b' }}>{user?.company?.toUpperCase()}</h2>
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>Enterprise</span>
            </div>
          </div>
          <div className="scf-header-right">
            {headerActions}
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={18} style={{ color: '#6b7280' }} />
              <span style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, background: '#7c3aed', borderRadius: '50%' }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1px solid #e5e7eb' }}>
              <div className="scf-avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{initials}</div>
              <div>
                <div style={{ fontSize: 13, color: '#1f2937', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</div>
                <div style={{ fontSize: 10.5, color: '#9ca3af' }}>{ROLE_LABELS[user?.role]}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="scf-page">{children}</main>
      </div>
    </div>
  );
}
