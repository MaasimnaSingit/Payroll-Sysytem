import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PortalShell() {
  const { logout } = useAuth();

  return (
    <div className="app-wrap">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">Employee Portal</div>
          <div className="sidebar-subtitle">Self Service</div>
        </div>

        <div className="nav-section">
          <div className="nav-section-label">Main</div>
          <nav>
            <NavLink className="nav-item" to="/portal">
              <span>🏠</span>
              <span>Home</span>
            </NavLink>
            <NavLink className="nav-item" to="/portal/requests">
              <span>📋</span>
              <span>Requests</span>
            </NavLink>
            <NavLink className="nav-item" to="/portal/change-password">
              <span>🔒</span>
              <span>Change Password</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      
      <div className="main-content">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}