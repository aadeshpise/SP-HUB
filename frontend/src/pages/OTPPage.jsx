import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader, ArrowLeft, ShieldCheck } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL + '/api';

export default function OTPPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);

  const sessionId = sessionStorage.getItem('scf_session_id');
  const email = sessionStorage.getItem('scf_login_email');

  if (!sessionId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>Session expired.</p>
          <button className="scf-btn scf-btn-primary" onClick={() => navigate('/login')} style={{ marginTop: 10 }}>Back to Login</button>
        </div>
      </div>
    );
  }

  const handleOtpChange = (idx, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((c, i) => { newOtp[i] = c; });
    setOtp(newOtp);
    const lastFilled = Math.min(pasted.length, 5);
    refs.current[lastFilled]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, { session_id: sessionId, otp: otpStr });
      const role = res.data.user.role;
      const dest = role === 'anchor_maker' ? '/maker/dashboard'
        : role === 'anchor_checker' ? '/checker/dashboard' : '/cp/dashboard';
      login(res.data.token, res.data.user);
      navigate(dest, { replace: true });
      // Clear session after navigation
      setTimeout(() => {
        sessionStorage.removeItem('scf_session_id');
        sessionStorage.removeItem('scf_login_email');
      }, 200);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scf-login-page">
      <div className="scf-login-left">
        <div className="scf-login-left-bg"></div>
        <div className="scf-login-logo">
          <span>AnchorPay</span>
          <small>Supply Chain Finance Platform</small>
        </div>
        <div className="scf-login-left-content">
          <h1 className="scf-login-tagline">Two-Factor<br />Authentication</h1>
          <p className="scf-login-sub">An OTP has been sent to your registered mobile number and email for secure access verification.</p>
        </div>
      </div>

      <div className="scf-login-right">
        <button
          onClick={() => navigate('/login')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 32 }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, background: '#ede9fe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={22} style={{ color: '#6d28d9' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b', margin: 0 }}>OTP Verification</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '3px 0 0' }}>Enter the 6-digit code</p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
          OTP sent to <strong style={{ color: '#1e1b4b' }}>{email}</strong>
        </p>

        <form onSubmit={handleVerify} data-testid="otp-form">
          <div className="scf-otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => refs.current[idx] = el}
                className="scf-otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                data-testid={`otp-input-${idx}`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="scf-login-btn"
            disabled={loading}
            data-testid="otp-verify-btn"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
          Didn't receive OTP?{' '}
          <span style={{ color: '#6d28d9', cursor: 'pointer', fontWeight: 500 }}>Resend OTP</span>
        </p>

        <div style={{ marginTop: 24, padding: 12, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
          <p style={{ fontSize: 12, color: '#166534', margin: 0 }}>Prototype OTP: <strong>000000</strong></p>
        </div>
      </div>
    </div>
  );
}
