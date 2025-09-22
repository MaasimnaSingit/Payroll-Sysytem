import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function PortalHome() {
  const { user } = useAuth();

  return (
    <div className="content-area">
      <div className="content-header">
        <h1 className="page-title">Employee Portal</h1>
        <p className="page-subtitle">Welcome, {user?.username || 'Employee'}</p>
      </div>

      <div className="content-body">
        <div className="premium-card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="premium-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏰</div>
              <h4 style={{ marginBottom: '8px', color: '#ffffff' }}>Clock In/Out</h4>
              <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Record your work hours</p>
              <button className="btn btn-primary">Start Work</button>
            </div>

            <div className="premium-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
              <h4 style={{ marginBottom: '8px', color: '#ffffff' }}>View Attendance</h4>
              <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Check your work history</p>
              <button className="btn btn-secondary">View Records</button>
            </div>

            <div className="premium-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <h4 style={{ marginBottom: '8px', color: '#ffffff' }}>Submit Request</h4>
              <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Leave or overtime requests</p>
              <button className="btn btn-secondary">New Request</button>
            </div>

            <div className="premium-card" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
              <h4 style={{ marginBottom: '8px', color: '#ffffff' }}>View Payslip</h4>
              <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Download your payslips</p>
              <button className="btn btn-secondary">View Payslips</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}