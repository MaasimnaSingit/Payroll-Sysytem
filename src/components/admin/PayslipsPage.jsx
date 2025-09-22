import React, { useState, useEffect } from 'react';
import { phEmployeeApi as employeeApi } from '../../services/api';
import { notify } from '../../utils/notifications';
import { formatCurrency } from '../../utils/formatters';

export default function PayslipsPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    try {
      const data = await employeeApi.getAll();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error('Failed to load employees');
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  }

  function handlePrintPayslip(employee) {
    // Print payslip logic here
    console.log('Printing payslip for:', employee);
    notify.success('Payslip generated');
  }

  function handleDownloadAll() {
    // Download all payslips logic here
    console.log('Downloading all payslips');
    notify.success('All payslips downloaded');
  }

  return (
    <div className="content-area">
      <div className="content-header">
        <h1 className="page-title">Payslips</h1>
        <p className="page-subtitle">Generate and manage employee payslips</p>
      </div>

      <div className="content-body">
        {/* Period Selection */}
        <div className="premium-card mb-8">
          <div className="card-header">
            <h3 className="card-title">Payslip Period</h3>
            <button className="btn btn-primary" onClick={handleDownloadAll}>
              Download All
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={selectedPeriod.start}
                onChange={(e) => setSelectedPeriod(prev => ({ ...prev, start: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={selectedPeriod.end}
                onChange={(e) => setSelectedPeriod(prev => ({ ...prev, end: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="premium-card">
          <div className="card-header">
            <h3 className="card-title">Employee Payslips</h3>
          </div>
          
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <div className="empty-state-title">Loading employees...</div>
            </div>
          ) : employees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-title">No employees found</div>
              <div className="empty-state-description">Add employees to generate payslips</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Position</th>
                    <th>Base Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: '600' }}>
                            {emp.first_name} {emp.last_name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {emp.employee_code}
                          </div>
                        </div>
                      </td>
                      <td>{emp.position || 'N/A'}</td>
                      <td>{formatCurrency(emp.base_salary || 0)}</td>
                      <td>
                        <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                          {emp.status || 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handlePrintPayslip(emp)}
                        >
                          Generate Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}