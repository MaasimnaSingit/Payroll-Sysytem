import React from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';

// Admin layout + pages
import AdminShell from './components/layout/AdminShell.jsx';
import EmployeesPage from './components/admin/EmployeesPage.jsx';
import AttendancePage from './components/admin/AttendancePage.jsx';
import PayrollPage from './components/admin/PayrollPage.jsx';
import SettingsPage from './components/admin/SettingsPage.jsx';
import AdminRequests from './components/admin/RequestsPage.jsx';
import Overview from './components/admin/Overview.jsx';
import PayslipsPage from './components/admin/PayslipsPage.jsx';
import SitesPage from './components/admin/SitesPage.jsx';
import DiagnosticsPage from './components/admin/DiagnosticsPage.jsx';

// Employee area
import EmployeePortal from './components/employee/EmployeePortal.jsx';
import PortalHome from './components/portal/PortalHome.jsx';
import ChangePassword from './components/portal/ChangePassword.jsx';
import PortalShell from './components/portal/PortalShell.jsx';
import PortalRequests from './components/portal/RequestsPage.jsx';

// Login
import Login from './components/auth/Login.jsx';
import EmployeeLogin from './components/auth/EmployeeLogin.jsx';

// Debug components removed for production

function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
        <div>Loading…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/me'} replace />;
  }
  return <>{children}</>;
}

function AdminLayout() {
  return (
    <RequireAuth roles={['admin']}>
      <AdminShell />
    </RequireAuth>
  );
}

function MeLayout() {
  return (
    <RequireAuth roles={['employee']}>
      <Outlet />
    </RequireAuth>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const roleHome = !user ? '/login' : user.role === 'admin' ? '/admin' : '/me';

  // Show loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#6366f1' }}>
            Payroll & Attendance System
          </h1>
          <p style={{ fontSize: '18px', marginBottom: '30px', color: '#9ca3af' }}>
            Loading authentication...
          </p>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #374151', 
            borderTop: '4px solid #6366f1', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  // Show login if no user
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/employee" element={<EmployeeLogin />} />
        <Route path="*" element={<Navigate to="/employee" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to={roleHome} replace />} />

      {/* Admin — children mounted directly under /admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="sites" element={<SitesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="requests" element={<AdminRequests />} />
        <Route path="payslips" element={<PayslipsPage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="diagnostics" element={<DiagnosticsPage />} />
      </Route>

      {/* Employee (/me) */}
      <Route path="/me" element={<MeLayout />}>
        <Route index element={<EmployeePortal />} />
        <Route path="attendance" element={<EmployeePortal />} />
      </Route>

      {/* Employee portal (new) */}
      <Route path="/portal" element={<PortalShell />}>
        <Route index element={<PortalHome />} />
        <Route path="requests" element={<PortalRequests />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Default + catch-all */}
      <Route path="/" element={<Navigate to={roleHome} replace />} />
      <Route path="*" element={<Navigate to={roleHome} replace />} />
    </Routes>
  );
}