const express = require('express');
const router = express.Router();
const db = require('../../db');
const { employeeValidation } = require('../../services/validation');
const { ValidationError } = require('../../services/validation');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all employees
router.get('/', asyncHandler(async (req, res) => {
    const employees = db.getAllEmployees.all();
    res.json({ employees });
}));

// Get employee by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const employee = db.getEmployeeById.get(req.params.id);
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({ employee });
}));

// Create employee
router.post('/', asyncHandler(async (req, res) => {
    try {
        // Validate employee data
        employeeValidation.validateEmployee(req.body);

        // Check for duplicate employee code
        const existing = db.getEmployeeByCode.get(req.body.employee_code);
        if (existing) {
            throw new ValidationError('Employee code already exists', 'employee_code');
        }

        // Insert employee
        const result = db.insertEmployee.run(req.body);
        
        // Get created employee
        const employee = db.getEmployeeById.get(result.lastID);
        
        res.status(201).json({ 
            message: 'Employee created successfully',
            employee 
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({ 
                error: err.message,
                field: err.field 
            });
        }
        throw err;
    }
}));

// Update employee
router.put('/:id', asyncHandler(async (req, res) => {
    try {
        // Check employee exists
        const existing = db.getEmployeeById.get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Validate employee data
        employeeValidation.validateEmployee(req.body);

        // Check for duplicate employee code
        if (req.body.employee_code !== existing.employee_code) {
            const duplicate = db.getEmployeeByCode.get(req.body.employee_code);
            if (duplicate) {
                throw new ValidationError('Employee code already exists', 'employee_code');
            }
        }

        // Update employee
        db.updateEmployee.run({
            ...req.body,
            id: req.params.id
        });

        // Get updated employee
        const employee = db.getEmployeeById.get(req.params.id);

        res.json({ 
            message: 'Employee updated successfully',
            employee 
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            return res.status(400).json({ 
                error: err.message,
                field: err.field 
            });
        }
        throw err;
    }
}));

// Delete employee (soft delete)
router.delete('/:id', asyncHandler(async (req, res) => {
    // Check employee exists
    const employee = db.getEmployeeById.get(req.params.id);
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }

    // Soft delete
    db.deleteEmployee.run(req.params.id);

    res.json({ 
        message: 'Employee deleted successfully' 
    });
}));

// Error handler
router.use((err, req, res, next) => {
    console.error('Employee API Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

module.exports = router;
