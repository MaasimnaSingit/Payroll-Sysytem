// Authentication API Service - Frontend API calls to backend
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Error handler
class ApiError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ApiError';
        this.field = field;
    }
}

// Authentication API methods - Frontend API calls
const authApi = {
    // Login user
    async login(username, password) {
        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new ApiError('Invalid credentials');
                }
                throw new ApiError('Login failed');
            }

            const data = await response.json();
            
            // Store token in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            return data;

        } catch (err) {
            console.error('Login failed:', err);
            throw err instanceof ApiError ? err : new ApiError('Login failed');
        }
    },

    // Logout user
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getCurrentUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (err) {
            console.error('Failed to get current user:', err);
            return null;
        }
    },

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        try {
            // Decode token to check if it's expired
            const decoded = jwt.decode(token);
            if (!decoded || decoded.exp < Date.now() / 1000) {
                this.logout();
                return false;
            }
            return true;
        } catch (err) {
            this.logout();
            return false;
        }
    },

    // Create employee access
    async createEmployeeAccess(employeeId, email, password) {
        try {
            const response = await fetch('http://localhost:8080/api/auth/employee-access', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ employeeId, email, password })
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new ApiError('Employee already has access');
                }
                throw new ApiError('Failed to create employee access');
            }

            return await response.json();

        } catch (err) {
            console.error('Failed to create employee access:', err);
            throw err instanceof ApiError ? err : new ApiError('Failed to create employee access');
        }
    }
};

// Export API
export { authApi };