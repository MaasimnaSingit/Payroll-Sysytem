// API base URL
const BASE_URL = 'http://localhost:8080/api';

// Error handler
class ApiError extends Error {
    constructor(message, status, field = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.field = field;
    }
}

// Helper function for API calls
async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || 'API request failed',
                response.status,
                data.field
            );
        }

        return data;
    } catch (err) {
        if (err instanceof ApiError) throw err;
        
        // Try localStorage fallback
        console.warn('API failed, using localStorage:', err);
        return handleLocalStorageFallback(endpoint, options);
    }
}

// Format helpers
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount);
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-PH');
}

export function formatDateTime(date) {
    return new Date(date).toLocaleString('en-PH');
}

// Employee API
export const employeeApi = {
    async getAll() {
        return await request('/ph/employees');
    },

    async getById(id) {
        return await request(`/ph/employees/${id}`);
    },

    async create(data) {
        return await request('/ph/employees', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async update(id, data) {
        return await request(`/ph/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(id) {
        return await request(`/ph/employees/${id}`, {
            method: 'DELETE'
        });
    }
};

// PH Employee API (Philippines-compliant)
export const phEmployeeApi = {
    async getAll() {
        const response = await request('/ph/employees');
        return response.employees || [];
    },

    async getById(id) {
        const response = await request(`/ph/employees/${id}`);
        return response.employee || response;
    },

    async create(data) {
        const response = await request('/ph/employees', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.employee || response;
    },

    async update(id, data) {
        const response = await request(`/ph/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return response.employee || response;
    },

    async delete(id) {
        const response = await request(`/ph/employees/${id}`, {
            method: 'DELETE'
        });
        return response;
    }
};

// Attendance API
export const attendanceApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await request(`/attendance${query ? '?' + query : ''}`);
    },

    async create(data) {
        return await request('/attendance', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async update(id, data) {
        return await request(`/attendance/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(id) {
        return await request(`/attendance/${id}`, {
            method: 'DELETE'
        });
    }
};

// Payroll API
export const payrollApi = {
    async calculate(params) {
        return await request('/payroll/calculate', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    },

    async export(params) {
        return await request('/payroll/export', {
            method: 'POST',
            body: JSON.stringify(params)
        });
    },

    async getHistory(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await request(`/payroll/history${query ? '?' + query : ''}`);
    }
};

// Leave API
export const leaveApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await request(`/leave${query ? '?' + query : ''}`);
    },

    async create(data) {
        return await request('/leave', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async update(id, data) {
        return await request(`/leave/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async approve(id) {
        return await request(`/leave/${id}/approve`, {
            method: 'POST'
        });
    },

    async reject(id, reason) {
        return await request(`/leave/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    },

    async delete(id) {
        return await request(`/leave/${id}`, {
            method: 'DELETE'
        });
    }
};

// Notification service
export const notify = {
    success(message) {
        // Implement your notification system
        console.log('✅', message);
    },

    error(message) {
        // Implement your notification system
        console.error('❌', message);
    },

    warning(message) {
        // Implement your notification system
        console.warn('⚠️', message);
    }
};

// localStorage fallback handlers
function handleLocalStorageFallback(endpoint, options) {
    const method = options.method || 'GET';
    const key = endpoint.split('/')[1]; // 'employees', 'attendance', etc.
    
    switch (method) {
        case 'GET':
            return {
                [key]: JSON.parse(localStorage.getItem(key) || '[]')
            };
            
        case 'POST':
            const data = JSON.parse(options.body);
            const items = JSON.parse(localStorage.getItem(key) || '[]');
            const id = Date.now();
            items.push({ ...data, id });
            localStorage.setItem(key, JSON.stringify(items));
            return { id };
            
        case 'PUT':
            const updateData = JSON.parse(options.body);
            const id2 = endpoint.split('/')[2];
            const items2 = JSON.parse(localStorage.getItem(key) || '[]');
            const index = items2.findIndex(i => i.id === Number(id2));
            if (index >= 0) {
                items2[index] = { ...items2[index], ...updateData };
                localStorage.setItem(key, JSON.stringify(items2));
            }
            return { success: true };
            
        case 'DELETE':
            const id3 = endpoint.split('/')[2];
            const items3 = JSON.parse(localStorage.getItem(key) || '[]');
            const filtered = items3.filter(i => i.id !== Number(id3));
            localStorage.setItem(key, JSON.stringify(filtered));
            return { success: true };
            
        default:
            throw new Error(`Unsupported method: ${method}`);
    }
}