import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceApi } from '../../services/api';
import { notify } from '../../utils/notifications';
import ClockInOut from '../attendance/ClockInOut';

export default function EmployeePortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  // Role guard - redirect admin users
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    loadAttendance();
  }, []);

  async function loadAttendance() {
    setLoading(true);
    try {
      const data = await attendanceApi.getAll();
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      notify.error('Failed to load attendance records');
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleAttendanceUpdate() {
    loadAttendance();
  }

  return (
    <div className="content-area">
      <div className="content-header">
        <h1 className="page-title">Employee Portal</h1>
        <p className="page-subtitle">Welcome back, {user?.username || 'Employee'}</p>
      </div>

      <div className="content-body">
        {/* Clock In/Out Section */}
        <ClockInOut user={user} onAttendanceUpdate={handleAttendanceUpdate} />

        {/* Recent Attendance */}
        <div className="premium-card">
          <div className="card-header">
            <h3 className="card-title">Recent Attendance</h3>
            <button 
              className="btn btn-ghost"
              onClick={loadAttendance}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {loading ? (
            <div className="empty-state">
              <div className="empty-state-icon">⏳</div>
              <div className="empty-state-title">Loading attendance...</div>
            </div>
          ) : attendance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <div className="empty-state-title">No attendance records</div>
              <div className="empty-state-description">Your attendance will appear here once you clock in</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.slice(0, 10).map(record => (
                    <tr key={record.id}>
                      <td>{new Date(record.work_date).toLocaleDateString()}</td>
                      <td>{record.time_in || '—'}</td>
                      <td>{record.time_out || '—'}</td>
                      <td>
                        {record.time_in && record.time_out ? 
                          `${Math.round((new Date(`2000-01-01 ${record.time_out}`) - new Date(`2000-01-01 ${record.time_in}`)) / (1000 * 60 * 60) * 100) / 100}h` : 
                          '—'
                        }
                      </td>
                      <td>
                        <span className={`badge ${
                          record.time_out ? 'badge-success' : 'badge-warning'
                        }`}>
                          {record.time_out ? 'Complete' : 'In Progress'}
                        </span>
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