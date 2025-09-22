// Payroll API Service - Frontend API calls to backend

// Error handler
class ApiError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ApiError';
        this.field = field;
    }
}

// Payroll API methods - Frontend API calls
const payrollApi = {
    // Get payroll records
    async getAll() {
        try {
            const response = await fetch('http://localhost:8080/api/payroll', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new ApiError('Failed to fetch payroll records');
            }
            
            return await response.json();
        } catch (err) {
            console.error('Failed to get payroll records:', err);
            throw new ApiError('Failed to fetch payroll records');
        }
    },

    // Get payroll by employee
    async getByEmployee(employeeId) {
        try {
            const response = await fetch(`http://localhost:8080/api/payroll/employee/${employeeId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new ApiError('Failed to fetch payroll records');
            }
            
            return await response.json();
        } catch (err) {
            console.error(`Failed to get payroll for employee #${employeeId}:`, err);
            throw new ApiError('Failed to fetch payroll records');
        }
    },

    // Get payroll by period
    async getByPeriod(startDate, endDate) {
        try {
            const response = await fetch(`http://localhost:8080/api/payroll/period?start=${startDate}&end=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new ApiError('Failed to fetch payroll records');
            }
            
            return await response.json();
        } catch (err) {
            console.error(`Failed to get payroll for period ${startDate} to ${endDate}:`, err);
            throw new ApiError('Failed to fetch payroll records');
        }
    },

    // Calculate payroll
    async calculate(employeeId, startDate, endDate) {
        try {
            const response = await fetch('http://localhost:8080/api/payroll/calculate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ employeeId, startDate, endDate })
            });

            if (!response.ok) {
                throw new ApiError('Failed to calculate payroll');
            }

            return await response.json();

        } catch (err) {
            console.error('Failed to calculate payroll:', err);
            throw err instanceof ApiError ? err : new ApiError('Failed to calculate payroll');
        }
    },

    // Generate payslip
    async generatePayslip(employeeId, startDate, endDate) {
        try {
            const response = await fetch('http://localhost:8080/api/payroll/payslip', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ employeeId, startDate, endDate })
            });

            if (!response.ok) {
                throw new ApiError('Failed to generate payslip');
            }

            return await response.json();

        } catch (err) {
            console.error('Failed to generate payslip:', err);
            throw err instanceof ApiError ? err : new ApiError('Failed to generate payslip');
        }
    }
};

// Export API
export { payrollApi };