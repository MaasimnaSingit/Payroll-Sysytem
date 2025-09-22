import React, { useState } from 'react';

export default function RequestsPage() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      type: 'Leave Request',
      status: 'Pending',
      date: '2024-01-15',
      details: 'Vacation leave for 3 days'
    },
    {
      id: 2,
      type: 'Overtime Request',
      status: 'Approved',
      date: '2024-01-14',
      details: 'Overtime for weekend work'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Leave Request',
    startDate: '',
    endDate: '',
    reason: ''
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newRequest = {
      ...formData,
      id: Date.now(),
      status: 'Pending',
      date: new Date().toISOString().slice(0, 10)
    };
    setRequests(prev => [newRequest, ...prev]);
    setShowForm(false);
    setFormData({ type: 'Leave Request', startDate: '', endDate: '', reason: '' });
  }

  return (
    <div className="content-area">
      <div className="content-header">
        <h1 className="page-title">My Requests</h1>
        <p className="page-subtitle">Submit and track your requests</p>
      </div>

      <div className="content-body">
        {/* New Request Form */}
        {showForm && (
          <div className="premium-card mb-8">
            <div className="card-header">
              <h3 className="card-title">Submit New Request</h3>
              <button 
                className="btn btn-ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label required">Request Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="Leave Request">Leave Request</option>
                  <option value="Overtime Request">Overtime Request</option>
                  <option value="Schedule Change">Schedule Change</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label required">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="4"
                  placeholder="Please provide details for your request"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className="premium-card">
          <div className="card-header">
            <h3 className="card-title">My Requests</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              New Request
            </button>
          </div>
          
          {requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No requests found</div>
              <div className="empty-state-description">Submit your first request to get started</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.id}>
                      <td style={{ fontWeight: '600' }}>{request.type}</td>
                      <td>
                        <span className={`badge ${
                          request.status === 'Approved' ? 'badge-success' :
                          request.status === 'Rejected' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{request.date}</td>
                      <td>{request.details}</td>
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