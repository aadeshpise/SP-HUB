import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL + '/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      sessionStorage.setItem('scf_session_id', res.data.session_id);
      sessionStorage.setItem('scf_login_email', email);
      navigate('/otp');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scf-login-page">
      {/* Left panel */}
      <div className="scf-login-left">
        <div className="scf-login-left-bg"></div>
        <div className="scf-login-logo">
          <span>AnchorPay</span>
          <small>Supply Chain Finance Platform</small>
        </div>
        <div className="scf-login-left-content">
          <h1 className="scf-login-tagline">Secure Financing<br />for Global Supply<br />Chains.</h1>
          <p className="scf-login-sub">
            End-to-end SCF platform connecting anchors and channel partners
            for seamless invoice financing and payment term extensions.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 24 }}>
            {[{ label: 'Total Disbursed', value: '₹420 Cr' }, { label: 'Partners Onboarded', value: '142' }, { label: 'Avg PTE Days', value: '38' }].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#c4b5fd' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="scf-login-right">
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, background: '#6d28d9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>A</span>
          </div>
          <h2 className="scf-login-form-title">Welcome back</h2>
          <p className="scf-login-form-sub">Sign in to your SCF account</p>
        </div>

        <form onSubmit={handleLogin} data-testid="login-form">
          <div className="scf-form-group">
            <label className="scf-label">Email Address</label>
            <input
              className="scf-input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              data-testid="login-email-input"
              autoComplete="email"
            />
          </div>

          <div className="scf-form-group">
            <label className="scf-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="scf-input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                data-testid="login-password-input"
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <span style={{ fontSize: 12.5, color: '#6d28d9', cursor: 'pointer', fontWeight: 500 }}>Forgot password?</span>
          </div>

          <button
            type="submit"
            className="scf-login-btn"
            disabled={loading}
            data-testid="login-submit-btn"
          >
            {loading ? <Loader size={16} style={{ display: 'inline', animation: 'spin 0.8s linear infinite' }} /> : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 32, padding: 16, background: '#f8f5ff', borderRadius: 8, border: '1px solid #ede9fe' }}>
          <p style={{ fontSize: 12, color: '#5b21b6', fontWeight: 600, margin: '0 0 6px' }}>Demo Credentials</p>
          {[
            { role: 'Anchor Maker', email: 'ramesh@tatamotors.com' },
            { role: 'Anchor Checker', email: 'suresh@tatamotors.com' },
            { role: 'Channel Partner', email: 'ganga@jagdambamotors.com' },
          ].map(u => (
            <div key={u.email} style={{ marginBottom: 4, cursor: 'pointer' }} onClick={() => { setEmail(u.email); setPassword('password'); }}>
              <span style={{ fontSize: 11.5, color: '#374151' }}><strong>{u.role}:</strong> {u.email}</span>
            </div>
          ))}
          <p style={{ fontSize: 11, color: '#9ca3af', margin: '6px 0 0' }}>Password: password | OTP: 000000</p>
        </div>

        <p style={{ marginTop: 32, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          © 2024 AnchorPay SCF Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
