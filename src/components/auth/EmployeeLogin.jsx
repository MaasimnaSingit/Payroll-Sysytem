import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function EmployeeLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e) {
    e.preventDefault();

    // Clear any existing user data first
    localStorage.removeItem('dev_user');

    // For employee login, always set role as employee
    const role = 'employee';

    await login({ username, role });

    const to = '/portal';
    const from = location.state?.from?.pathname || to;
    
    navigate(from, { replace: true });
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      padding: '20px'
    }}>
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 8px 0'
          }}>
            Employee Portal
          </h1>
          <p style={{ color: '#9ca3af', margin: '0 0 8px 0' }}>Employee Self Service</p>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>Access your personal dashboard</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input 
              className="form-input" 
              placeholder="Enter your employee ID" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                className="form-input" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter your password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  color: '#9ca3af',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease',
                  outline: 'none',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.target.style.color = '#6366f1'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} type="submit">
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 8px 0' }}>
            Admin access?
          </p>
          <a 
            href="/login" 
            style={{ 
              color: '#6366f1', 
              textDecoration: 'none', 
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Switch to Admin Login
          </a>
        </div>
      </div>
    </div>
  );
}