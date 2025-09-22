import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notify } from '../../utils/notifications';

export default function ChangePassword() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      notify.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      notify.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    // Simulate password change
    setTimeout(() => {
      setLoading(false);
      notify.success('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }, 1000);
  }

  return (
    <div className="content-area">
      <div className="content-header">
        <h1 className="page-title">Change Password</h1>
        <p className="page-subtitle">Update your account password</p>
      </div>

      <div className="content-body">
        <div className="premium-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="card-header">
            <h3 className="card-title">Update Password</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter new password"
                required
                minLength="6"
              />
              <div className="form-help">
                Password must be at least 6 characters long
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm new password"
                required
                minLength="6"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}