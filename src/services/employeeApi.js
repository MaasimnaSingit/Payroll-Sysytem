// Employee API Service - Frontend API calls to backend
import { employeeValidation as validateEmployee } from './validation.js';

// Error handler
class ApiError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ApiError';
        this.field = field;
    }
}

// Format phone number
function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) return phone;
    return `+63 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
}

// Calculate rates
function calculateRates(baseSalary) {
    const dailyRate = Math.round((baseSalary / 22) * 100) / 100;
    const hourlyRate = Math.round((dailyRate / 8) * 100) / 100;
    return { dailyRate, hourlyRate };
}

// Employee API methods - Frontend API calls
const employeeApi = {
    // Get all employees
    async getAll() {
        try {
            const response = await fetch('http://localhost:8080/api/ph/employees', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new ApiError('Failed to fetch employees');
            }
            
            const employees = await response.json();
            return employees.map(employee => ({
                ...employee,
                base_salary: Number(employee.base_salary),
                daily_rate: Number(employee.daily_rate),
                hourly_rate: Number(employee.hourly_rate)
            }));
        } catch (err) {
            console.error('Failed to get employees:', err);
            throw new ApiError('Failed to fetch employees');
        }
    },

    // Get employee by ID
    async getById(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/ph/employees/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new ApiError('Employee not found');
                }
                throw new ApiError('Failed to fetch employee');
            }
            
            const employee = await response.json();
            return {
                ...employee,
                base_salary: Number(employee.base_salary),
                daily_rate: Number(employee.daily_rate),
                hourly_rate: Number(employee.hourly_rate)
            };
        } catch (err) {
            console.error(`Failed to get employee #${id}:`, err);
            throw err instanceof ApiError ? err : new ApiError('Failed to fetch employee');
        }
    },

    // Create employee
    async create(data) {
        try {
            // Validate data
            const errors = validateEmployee(data);
            if (Object.keys(errors).length > 0) {
                throw new ApiError('Validation failed', errors);
            }

            // Format phone
            data.phone = formatPhone(data.phone);

            // Calculate rates
            const { dailyRate, hourlyRate } = calculateRates(Number(data.base_salary));

            const response = await fetch('http://localhost:8080/api/ph/employees', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    daily_rate: dailyRate,
                    hourly_rate: hourlyRate
                })
            });

            if (!response.ok) {
                throw new ApiError('Failed to create employee');
            }

            return await response.json();

        } catch (err) {
            console.error('Failed to create employee:', err);
            throw err instanceof ApiError ? err : new ApiError('Failed to create employee');
        }
    },

    // Update employee
    async update(id, data) {
        try {
            // Validate data
            const errors = validateEmployee(data);
            if (Object.keys(errors).length > 0) {
                throw new ApiError('Validation failed', errors);
            }

            // Format phone
            data.phone = formatPhone(data.phone);

            // Calculate rates
            const { dailyRate, hourlyRate } = calculateRates(Number(data.base_salary));

            const response = await fetch(`http://localhost:8080/api/ph/employees/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    daily_rate: dailyRate,
                    hourly_rate: hourlyRate
                })
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new ApiError('Employee not found');
                }
                throw new ApiError('Failed to update employee');
            }

            return await response.json();

        } catch (err) {
            console.error(`Failed to update employee #${id}:`, err);
            throw err instanceof ApiError ? err : new ApiError('Failed to update employee');
        }
    },

    // Delete employee
    async delete(id) {
        try {
            const response = await fetch(`http://localhost:8080/api/ph/employees/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new ApiError('Employee not found');
                }
                throw new ApiError('Failed to delete employee');
            }

        } catch (err) {
            console.error(`Failed to delete employee #${id}:`, err);
            throw err instanceof ApiError ? err : new ApiError('Failed to delete employee');
        }
    }
};

// Export API
export { employeeApi };