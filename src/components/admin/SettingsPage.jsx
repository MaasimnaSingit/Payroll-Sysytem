import React, { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'TGPS Payroll System',
    companyAddress: 'Manila, Philippines',
    workingHours: 8,
    overtimeRate: 1.25,
    nightDiffRate: 0.10
  });

  function handleChange(e) {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  }

  function handleSave() {
    // Save settings logic here
    console.log('Saving settings:', settings);
  }

  return (
    <div className="content-area">
      <div className="content-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure system settings and preferences</p>
      </div>

      <div className="content-body">
        <div className="premium-card">
          <div className="card-header">
            <h3 className="card-title">Company Information</h3>
          </div>
          
          <div className="form-group">
            <label className="form-label required">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter company name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Address</label>
            <textarea
              name="companyAddress"
              value={settings.companyAddress}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Enter company address"
            />
          </div>
        </div>

        <div className="premium-card">
          <div className="card-header">
            <h3 className="card-title">Payroll Settings</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label required">Working Hours per Day</label>
              <input
                type="number"
                name="workingHours"
                value={settings.workingHours}
                onChange={handleChange}
                className="form-input"
                min="1"
                max="24"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Overtime Rate Multiplier</label>
              <input
                type="number"
                name="overtimeRate"
                value={settings.overtimeRate}
                onChange={handleChange}
                className="form-input"
                min="1"
                max="3"
                step="0.25"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Night Differential Rate</label>
              <input
                type="number"
                name="nightDiffRate"
                value={settings.nightDiffRate}
                onChange={handleChange}
                className="form-input"
                min="0"
                max="1"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            Save Settings
          </button>
          <button className="btn btn-secondary">
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}