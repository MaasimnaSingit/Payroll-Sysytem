// Attendance API Service - Frontend API calls to backend
import { validateAttendance, calculateNightDiff, calculateRegularHours } from './validation.js';

// Error handler
class ApiError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ApiError';
        this.field = field;
    }
}

// Attendance API methods - Frontend API calls
const attendanceApi = {
    // Get all attendance records
    async getAll() {
        try {
            const response = await fetch('http://localhost:8080/api/ph/attendance', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new ApiError('Failed to fetch attendance records');
            }
            
            const data = await response.json();
            return data.attendance || data;
        } catch (err) {
            console.error('Failed to get attendance records:', err);
            throw new ApiError('Failed to fetch attendance records');
        }
    },

    // Get attendance by employee ID
    async getByEmployee(employeeId) {
        try {
            const response = await fetch(`http://localhost:8080/api/ph/attendance?employee_id=${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new ApiError('Failed to fetch attendance records');
            }
            
            return await response.json();
        } catch (err) {
            console.error(`Failed to get attendance for employee #${employeeId}:`, err);
            throw new ApiError('Failed to fetch attendance records');
        }
    },

    // Get attendance by date
    async getByDate(date) {
        try {
            const response = await fetch(`http://localhost:8080/api/attendance/date/${date}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new ApiError('Failed to fetch attendance records');
            }
            
            return await response.json();
        } catch (err) {
            console.error(`Failed to get attendance for date ${date}:`, err);
            throw new ApiError('Failed to fetch attendance records');
        }
    },

    // Create attendance record
    async create(data) {
        try {
            // Validate data
            const errors = validateAttendance(data);
            if (Object.keys(errors).length > 0) {
                throw new ApiError('Validation failed', errors);
            }

            const response = await fetch('http://localhost:8080/api/ph/attendance', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new ApiError('Failed to create attendance record');
            }

            return await response.json();

        } catch (err) {
            console.error('Failed to create attendance record:', err);
            throw err instanceof ApiError ? err : new ApiError('Failed to create attendance record');
        }
    },

    // Update attendance record
    async update(id, data) {
        try {
            // Validate data
            const errors = validateAttendance(data, true);
            if (Object.keys(errors).length > 0) {
                throw new ApiError('Validation failed', errors);
            }

            const response = await fetch(`http://localhost:8080/api/ph/attendance/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new ApiError('Attendance record not found');
                }
                throw new ApiError('Failed to update attendance record');
            }

            return await response.json();

        } catch (err) {
            console.error(`Failed to update attendance record #${id}:`, err);
            throw err instanceof ApiError ? err : new ApiError('Failed to update attendance record');
        }
    },

    // Delete attendance record
    async delete(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/attendance/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new ApiError('Attendance record not found');
                }
                throw new ApiError('Failed to delete attendance record');
            }

        } catch (err) {
            console.error(`Failed to delete attendance record #${id}:`, err);
            throw err instanceof ApiError ? err : new ApiError('Failed to delete attendance record');
        }
    }
};

// Export API
export { attendanceApi };