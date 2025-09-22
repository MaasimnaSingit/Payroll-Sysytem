import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { IOverview, IUsers, ISites, IClock, IInbox, IFile, IMoney, ISettings } from '../../ui/icons.jsx';
import CommandPalette from '../common/CommandPalette.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Toaster from '../common/Toaster.jsx';
import ModernCursor from '../ui/ModernCursor.jsx';

export default function AdminShell() {
  React.useEffect(()=>{
    try{
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    }catch{}
  },[]);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  // Role guard - redirect non-admin users
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/me', { replace: true });
    }
  }, [user, navigate]);
  
  const title = (() => {
    const p = loc.pathname || '';
    if (p.includes('/employees')) return 'Employees';
    if (p.includes('/attendance')) return 'Attendance';
    if (p.includes('/payroll')) return 'Payroll';
    if (p.includes('/settings')) return 'Settings';
    return 'Dashboard';
  })();
  return (
    <div className="app-wrap">
      
      <aside className="sidebar">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-title">Payroll Admin</div>
          <div className="sidebar-subtitle">Management Dashboard</div>
        </div>

        {/* Main Navigation */}
        <div className="nav-section">
          <div className="nav-section-label">Main</div>
          <nav>
            <NavLink className="nav-item" to="/admin/overview">
              <IOverview className="nav-item-icon"/>
              <span>Overview</span>
            </NavLink>
            <NavLink className="nav-item" to="/admin/employees">
              <IUsers className="nav-item-icon"/>
              <span>Employees</span>
            </NavLink>
            <NavLink className="nav-item" to="/admin/attendance">
              <IClock className="nav-item-icon"/>
              <span>Attendance</span>
            </NavLink>
            <NavLink className="nav-item" to="/admin/payroll">
              <IMoney className="nav-item-icon"/>
              <span>Payroll</span>
            </NavLink>
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div className="nav-section">
          <div className="nav-section-label">Tools</div>
          <nav>
            <NavLink className="nav-item" to="/admin/sites">
              <ISites className="nav-item-icon"/>
              <span>Sites</span>
            </NavLink>
            <NavLink className="nav-item" to="/admin/requests">
              <IInbox className="nav-item-icon"/>
              <span>Requests</span>
            </NavLink>
            <NavLink className="nav-item" to="/admin/payslips">
              <IFile className="nav-item-icon"/>
              <span>Payslips</span>
            </NavLink>
            <NavLink className="nav-item" to="/admin/settings">
              <ISettings className="nav-item-icon"/>
              <span>Settings</span>
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-brand">
            <div className="brand-dot"></div>
            <div>
              <div className="brand-title">Payroll & Attendance Admin</div>
              <div className="brand-subtitle">Asia/Manila · Secure session</div>
            </div>
          </div>
        </header>
        <main>
          <Outlet />
          <CommandPalette />
        </main>
        <Toaster />
      </div>
    </div>
  );
}

function RequestsLink(){
  const [n,setN] = useState(0);
  useEffect(()=>{ let id; const tick=async()=>{ try{ const r=await fetch('/api/requests/stats/pending'); const j=await r.json(); setN(j.pending||0);}catch{} id=setTimeout(tick, 15000); }; tick(); return ()=>clearTimeout(id); },[]);
  return (
    <NavLink to="/admin/requests" style={{ position:'relative' }} className={({isActive}) => isActive ? 'active' : ''}>
      Requests
      {n>0 && <span style={{
        position:'absolute', right:-8, top:-6, background:'#ef4444', color:'white',
        borderRadius:999, fontSize:11, padding:'2px 6px', border:'1px solid rgba(255,255,255,.15)'}}>{n}</span>}
    </NavLink>
  );
}

