import React, { useState, useEffect } from 'react';
import { notify } from '../../utils/notifications';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    try {
      // Mock data for now
      setRequests([
        {
          id: 1,
          employee: 'John Doe',
          type: 'Leave Request',
          status: 'Pending',
          date: '2024-01-15',
          details: 'Vacation leave for 3 days'
        },
        {
          id: 2,
          employee: 'Jane Smith',
          type: 'Overtime Request',
          status: 'Approved',
          date: '2024-01-14',
          details: 'Overtime for weekend work'
        }
      ]);
    } catch (err) {
      notify.error('Failed to load requests');
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleApprove(id) {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'Approved' } : req
      )
    );
    notify.success('Request approved');
  }

  function handleReject(id) {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'Rejected' } : req
      )
    );
    notify.success('Request rejected');
  }

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status.toLowerCase() === filter);

  return (
    <div className="content-area">
      <div className="content-header">
        <h1 className="page-title">Requests</h1>
        <p className="page-subtitle">Manage employee requests and approvals</p>
      </div>

      <div className="content-body">
        {/* Filter Tabs */}
        <div className="premium-card mb-8">
          <div className="card-header">
            <h3 className="card-title">Filter Requests</h3>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <button
                key={status}
                className={`btn ${filter === status ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(status)}
                style={{ textTransform: 'capitalize' }}
              >
                {status} ({requests.filter(req => 
                  status === 'all' ? true : req.status.toLowerCase() === status
                ).length})
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="premium-card">
          <div className="card-header">
            <h3 className="card-title">Employee Requests</h3>
          </div>
          
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <div className="empty-state-title">Loading requests...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <div className="empty-state-title">No requests found</div>
              <div className="empty-state-description">
                {filter === 'all' 
                  ? 'No requests have been submitted yet'
                  : `No ${filter} requests found`
                }
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td style={{ fontWeight: '600' }}>{req.employee}</td>
                      <td>{req.type}</td>
                      <td>
                        <span className={`badge ${
                          req.status === 'Approved' ? 'badge-success' :
                          req.status === 'Rejected' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td>{req.date}</td>
                      <td>{req.details}</td>
                      <td>
                        {req.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleApprove(req.id)}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleReject(req.id)}
                            >
                              Reject
                            </button>
                          </div>
                        )}
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