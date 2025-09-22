import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../services/attendanceApi';
import { notify } from '../../utils/notifications';

export default function ClockInOut({ user, onAttendanceUpdate }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [photo, setPhoto] = useState(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check today's attendance record
  useEffect(() => {
    if (user?.id) {
      checkTodayAttendance();
    }
  }, [user?.id]);

  async function checkTodayAttendance() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const records = await attendanceApi.getByEmployee(user.id);
      const todayRecord = records.find(record => record.work_date === today);
      
      if (todayRecord) {
        setTodayRecord(todayRecord);
        setClockedIn(!!todayRecord.time_in && !todayRecord.time_out);
      }
    } catch (err) {
      console.error('Failed to check today attendance:', err);
    }
  }

  function handlePhotoCapture() {
    // For now, we'll use a simple file input
    // In a real app, you'd use camera API
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhoto(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  async function handleClockIn() {
    if (!photo) {
      notify.error('Please take a photo before clocking in');
      return;
    }

    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date().toTimeString().slice(0, 8);
      
      const attendanceData = {
        employee_id: user.id,
        work_date: today,
        time_in: now,
        photo_in: photo,
        day_type: 'Regular',
        notes: 'Clock in via employee portal'
      };

      if (todayRecord) {
        // Update existing record
        await attendanceApi.update(todayRecord.id, attendanceData);
      } else {
        // Create new record
        await attendanceApi.create(attendanceData);
      }

      setClockedIn(true);
      setPhoto(null);
      notify.success('Clocked in successfully!');
      
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
      
      // Refresh today's record
      await checkTodayAttendance();
    } catch (err) {
      notify.error(err.message || 'Failed to clock in');
      console.error('Clock in error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleClockOut() {
    if (!todayRecord) {
      notify.error('No clock in record found for today');
      return;
    }

    if (!photo) {
      notify.error('Please take a photo before clocking out');
      return;
    }

    setLoading(true);
    try {
      const now = new Date().toTimeString().slice(0, 8);
      
      const updateData = {
        ...todayRecord,
        time_out: now,
        photo_out: photo
      };

      await attendanceApi.update(todayRecord.id, updateData);
      
      setClockedIn(false);
      setPhoto(null);
      notify.success('Clocked out successfully!');
      
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
      
      // Refresh today's record
      await checkTodayAttendance();
    } catch (err) {
      notify.error(err.message || 'Failed to clock out');
      console.error('Clock out error:', err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusMessage() {
    if (clockedIn) {
      return {
        icon: '🕐',
        title: 'Currently Clocked In',
        subtitle: 'Click below to clock out',
        buttonText: 'Clock Out',
        buttonClass: 'btn-secondary'
      };
    } else {
      return {
        icon: '⏰',
        title: 'Ready to Clock In',
        subtitle: 'Click below to start your work day',
        buttonText: 'Clock In',
        buttonClass: 'btn-primary'
      };
    }
  }

  const status = getStatusMessage();

  return (
    <div className="premium-card mb-8">
      <div className="card-header">
        <h3 className="card-title">Time Clock</h3>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
          {currentTime.toLocaleTimeString()}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {status.icon}
          </div>
          <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
            {status.title}
          </div>
          <div style={{ color: '#9ca3af' }}>
            {status.subtitle}
          </div>
        </div>

        {/* Photo Preview */}
        {photo && (
          <div style={{ marginBottom: '16px' }}>
            <img 
              src={photo} 
              alt="Captured photo" 
              style={{ 
                width: '100px', 
                height: '100px', 
                objectFit: 'cover', 
                borderRadius: '8px',
                border: '2px solid #10b981'
              }} 
            />
          </div>
        )}

        {/* Photo Capture Button */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handlePhotoCapture}
            disabled={loading}
            style={{ marginRight: '8px' }}
          >
            📷 {photo ? 'Retake Photo' : 'Take Photo'}
          </button>
        </div>
        
        {/* Clock In/Out Button */}
        <button
          className={`btn ${status.buttonClass}`}
          onClick={clockedIn ? handleClockOut : handleClockIn}
          disabled={loading || !photo}
          style={{ minWidth: '200px' }}
        >
          {loading ? 'Processing...' : status.buttonText}
        </button>

        {/* Today's Status */}
        {todayRecord && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>Today's Record</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {todayRecord.time_in && `In: ${todayRecord.time_in}`}
              {todayRecord.time_out && ` | Out: ${todayRecord.time_out}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
