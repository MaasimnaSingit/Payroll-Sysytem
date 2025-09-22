import React, { useState, useEffect } from 'react';
import { phEmployeeApi as employeeApi } from '../../services/api';
import { attendanceApi } from '../../services/attendanceApi';
import { notify } from '../../utils/notifications';

export default function AttendanceForm({ 
  record = null, 
  onSave, 
  onCancel, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    employee_id: '',
    work_date: new Date().toISOString().slice(0, 10),
    time_in: '',
    time_out: '',
    break_minutes: 0,
    photo_in: null,
    photo_out: null,
    day_type: 'Regular',
    manual_overtime_hours: 0,
    notes: ''
  });
  
  const [employees, setEmployees] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // Load employees on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  // Update form data when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        employee_id: record.employee_id || '',
        work_date: record.work_date || new Date().toISOString().slice(0, 10),
        time_in: record.time_in || '',
        time_out: record.time_out || '',
        break_minutes: record.break_minutes || 0,
        photo_in: record.photo_in || null,
        photo_out: record.photo_out || null,
        day_type: record.day_type || 'Regular',
        manual_overtime_hours: record.manual_overtime_hours || 0,
        notes: record.notes || ''
      });
    }
  }, [record]);

  async function loadEmployees() {
    try {
      const data = await employeeApi.getAll();
      setEmployees(data);
    } catch (err) {
      notify.error('Failed to load employees');
      console.error('Failed to load employees:', err);
    }
  }

  function handleChange(e) {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  }

  function handlePhotoChange(e, type) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [type]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (record) {
        await attendanceApi.update(record.id, formData);
        notify.success('Attendance record updated successfully');
      } else {
        await attendanceApi.create(formData);
        notify.success('Attendance record created successfully');
      }
      
      if (onSave) onSave();
    } catch (err) {
      notify.error(err.message || 'Failed to save attendance record');
      console.error('Failed to save attendance:', err);
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="premium-card">
      <div className="card-header">
        <h3 className="card-title">
          {record ? 'Edit Attendance' : 'Add Attendance Record'}
        </h3>
        {onCancel && (
          <button 
            type="button" 
            className="btn btn-ghost" 
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label required">Employee</label>
          <select
            name="employee_id"
            value={formData.employee_id}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_code} - {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label required">Work Date</label>
          <input
            type="date"
            name="work_date"
            value={formData.work_date}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label required">Time In</label>
            <input
              type="time"
              name="time_in"
              value={formData.time_in}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Time Out</label>
            <input
              type="time"
              name="time_out"
              value={formData.time_out}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Break Minutes</label>
            <input
              type="number"
              name="break_minutes"
              value={formData.break_minutes}
              onChange={handleChange}
              className="form-input"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Manual OT Hours</label>
            <input
              type="number"
              name="manual_overtime_hours"
              value={formData.manual_overtime_hours}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Day Type</label>
          <select
            name="day_type"
            value={formData.day_type}
            onChange={handleChange}
            className="form-select"
          >
            <option value="Regular">Regular</option>
            <option value="Holiday">Holiday</option>
            <option value="Rest Day">Rest Day</option>
            <option value="Double Pay">Double Pay</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Clock In Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e, 'photo_in')}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Clock Out Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handlePhotoChange(e, 'photo_out')}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-textarea"
            rows="3"
            placeholder="Additional notes..."
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formLoading || loading}
          >
            {formLoading ? 'Saving...' : (record ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
}