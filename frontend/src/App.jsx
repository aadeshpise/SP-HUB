import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import OTPPage from '@/pages/OTPPage';
import SettingsPage from '@/pages/SettingsPage';
import MakerDashboard from '@/pages/maker/Dashboard';
import MakerPrograms from '@/pages/maker/Programs';
import MakerInvoices from '@/pages/maker/Invoices';
import MakerLenders from '@/pages/maker/Lenders';
import CheckerDashboard from '@/pages/checker/Dashboard';
import CheckerInvoices from '@/pages/checker/Invoices';
import CPDashboard from '@/pages/channelPartner/Dashboard';
import CPChannelPartners from '@/pages/channelPartner/ChannelPartners';
import CPInvoices from '@/pages/channelPartner/Invoices';
import CPRepayment from '@/pages/channelPartner/Repayment';
import '@/App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="scf-spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'anchor_maker') return <Navigate to="/maker/dashboard" replace />;
    if (user.role === 'anchor_checker') return <Navigate to="/checker/dashboard" replace />;
    if (user.role === 'channel_partner') return <Navigate to="/cp/dashboard" replace />;
  }
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'anchor_maker') return <Navigate to="/maker/dashboard" replace />;
  if (user.role === 'anchor_checker') return <Navigate to="/checker/dashboard" replace />;
  if (user.role === 'channel_partner') return <Navigate to="/cp/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/otp" element={<OTPPage />} />
      {/* Maker */}
      <Route path="/maker/dashboard" element={<ProtectedRoute allowedRoles={['anchor_maker']}><MakerDashboard /></ProtectedRoute>} />
      <Route path="/maker/programs" element={<ProtectedRoute allowedRoles={['anchor_maker']}><MakerPrograms /></ProtectedRoute>} />
      <Route path="/maker/invoices" element={<ProtectedRoute allowedRoles={['anchor_maker']}><MakerInvoices /></ProtectedRoute>} />
      <Route path="/maker/lenders" element={<ProtectedRoute allowedRoles={['anchor_maker']}><MakerLenders /></ProtectedRoute>} />
      <Route path="/maker/settings" element={<ProtectedRoute allowedRoles={['anchor_maker']}><SettingsPage /></ProtectedRoute>} />
      {/* Checker — same sidebar as Maker */}
      <Route path="/checker/dashboard" element={<ProtectedRoute allowedRoles={['anchor_checker']}><CheckerDashboard /></ProtectedRoute>} />
      <Route path="/checker/programs" element={<ProtectedRoute allowedRoles={['anchor_checker']}><MakerPrograms /></ProtectedRoute>} />
      <Route path="/checker/invoices" element={<ProtectedRoute allowedRoles={['anchor_checker']}><CheckerInvoices /></ProtectedRoute>} />
      <Route path="/checker/lenders" element={<ProtectedRoute allowedRoles={['anchor_checker']}><MakerLenders /></ProtectedRoute>} />
      <Route path="/checker/settings" element={<ProtectedRoute allowedRoles={['anchor_checker']}><SettingsPage /></ProtectedRoute>} />
      {/* Channel Partner */}
      <Route path="/cp/dashboard" element={<ProtectedRoute allowedRoles={['channel_partner']}><CPDashboard /></ProtectedRoute>} />
      <Route path="/cp/channel-partners" element={<ProtectedRoute allowedRoles={['channel_partner']}><CPChannelPartners /></ProtectedRoute>} />
      <Route path="/cp/invoices" element={<ProtectedRoute allowedRoles={['channel_partner']}><CPInvoices /></ProtectedRoute>} />
      <Route path="/cp/repayment" element={<ProtectedRoute allowedRoles={['channel_partner']}><CPRepayment /></ProtectedRoute>} />
      <Route path="/cp/settings" element={<ProtectedRoute allowedRoles={['channel_partner']}><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
