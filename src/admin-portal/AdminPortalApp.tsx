import React, { useState, useEffect } from 'react';
import { AdminPortalLogin } from './AdminPortalLogin';
import { AdminPortalDashboard } from './AdminPortalDashboard';
import { isAdminAuthenticated, adminLogout, verifyAdminSession } from '../services/auth';
import { ToastProvider, useToast } from '../components/Toast';

function AdminPortalMain() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminAuthenticated());
  const { showToast } = useToast();

  useEffect(() => {
    // Verify session on mount with server /api/admin/verify
    if (isAdminAuthenticated()) {
      verifyAdminSession().then((valid) => {
        setIsAuthenticated(valid);
      });
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAuthenticated(false);
    showToast('Administrator session ended securely.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#0D1110]">
      {isAuthenticated ? (
        <AdminPortalDashboard onLogout={handleLogout} />
      ) : (
        <AdminPortalLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export function AdminPortalApp() {
  return (
    <ToastProvider>
      <AdminPortalMain />
    </ToastProvider>
  );
}

export default AdminPortalApp;
