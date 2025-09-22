// Leave Management API Service - Frontend API calls to backend
import { validateLeaveRequest } from './validation.js';

// Error handler
class ApiError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ApiError';
        this.field = field;
    }
}

// Leave types constant
export const LEAVE_TYPES = {
    VL: 'Vacation Leave',
    SL: 'Sick Leave',
    SIL: 'Service Incentive Leave',
    ML: 'Maternity Leave',
    PL: 'Paternity Leave',
    SPL: 'Solo Parent Leave',
    BL: 'Bereavement Leave',
    EL: 'Emergency Leave'
};

// Leave API methods - Frontend API calls
const leaveApi = {
    // Get leave types
    getLeaveTypes() {
        return LEAVE_TYPES;
    },

    // Get leave balances for employee
    async getBalances(employeeId) {
        try {
            const response = await fetch(`http://localhost:8080/api/leave/balances/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new ApiError('Failed to fetch leave balances');
            }
            
            return await response.json();
        } catch (err) {
            console.error(`Failed to get leave balances for employee #${employeeId}:`, err);
            throw new ApiError('Failed to fetch leave balances');
        }
    },

    // Get leave requests
    async getRequests(employeeId = null) {
        try {
            const url = employeeId 
                ? `http://localhost:8080/api/leave/requests/employee/${employeeId}`
                : 'http://localhost:8080/api/leave/requests';
                
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new ApiError('Failed to fetch leave requests');
            }
            
            return await response.json();
        } catch (err) {
            console.error('Failed to get leave requests:', err);
            throw new ApiError('Failed to fetch leave requests');
        }
    },

    // Submit leave request
    async submitRequest(data) {
        try {
            // Validate data
            const errors = validateLeaveRequest(data);
            if (Object.keys(errors).length > 0) {
                throw new ApiError('Validation failed', errors);
            }

            const response = await fetch('http://localhost:8080/api/leave/requests', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new ApiError('Failed to submit leave request');
            }

            return await response.json();

        } catch (err) {
            console.error('Failed to submit leave request:', err);
            throw err instanceof ApiError ? err : new ApiError('Failed to submit leave request');
        }
    },

    // Update leave request
    async updateRequest(id, data) {
        try {
            const response = await fetch(`http://localhost:8080/api/leave/requests/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new ApiError('Leave request not found');
                }
                throw new ApiError('Failed to update leave request');
            }

            return await response.json();

        } catch (err) {
            console.error(`Failed to update leave request #${id}:`, err);
            throw err instanceof ApiError ? err : new ApiError('Failed to update leave request');
        }
    },

    // Delete leave request
    async deleteRequest(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/leave/requests/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new ApiError('Leave request not found');
                }
                throw new ApiError('Failed to delete leave request');
            }

        } catch (err) {
            console.error(`Failed to delete leave request #${id}:`, err);
            throw err instanceof ApiError ? err : new ApiError('Failed to delete leave request');
        }
    }
};

// Initialize leave balances - No-op for frontend (handled by backend)
export async function initializeLeaveBalances(employeeId, hireDate) {
    console.log('Leave balances initialization handled by backend');
    return true;
}

// Export API and utilities
export { leaveApi, initializeLeaveBalances };