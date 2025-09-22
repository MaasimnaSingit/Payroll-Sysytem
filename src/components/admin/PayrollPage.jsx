import React, { useState, useEffect } from 'react';
import { phEmployeeApi as employeeApi } from '../../services/api';
import { notify } from '../../utils/notifications';
import { formatCurrency } from '../../utils/formatters';

export default function PayrollPage() {
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

  return (
    <div className="content-area">
      <div className="content-header">
        <h1 className="page-title">Payroll Management</h1>
        <p className="page-subtitle">Calculate and process employee payroll</p>
      </div>

      <div className="content-body">
        {/* Period Selection */}
        <div className="premium-card mb-8">
          <div className="card-header">
            <h3 className="card-title">Payroll Period</h3>
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
            <h3 className="card-title">Employees</h3>
            <button className="btn btn-primary">
              Calculate Payroll
            </button>
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
              <div className="empty-state-description">Add employees to start processing payroll</div>
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
                        <button className="btn btn-secondary btn-sm">
                          Calculate
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