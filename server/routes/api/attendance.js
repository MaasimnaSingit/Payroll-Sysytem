const express = require('express');
const router = express.Router();
const db = require('../../db');
const { attendanceValidation } = require('../../services/validation');
const { ValidationError } = require('../../services/validation');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Get attendance records
router.get('/', asyncHandler(async (req, res) => {
    const { start_date, end_date, employee_id } = req.query;
    
    let records;
    if (employee_id) {
        records = db.getAttendanceByEmployeeAndDate.all(
            employee_id,
            start_date || '1900-01-01',
            end_date || '9999-12-31'
        );
    } else {
        records = db.getAttendanceByDateRange.all(
            start_date || '1900-01-01',
            end_date || '9999-12-31'
        );
    }

    // Convert photos to base64
    const recordsWithPhotos = records.map(record => ({
        ...record,
        photo_in: record.photo_in ? 
            `data:image/jpeg;base64,${record.photo_in.toString('base64')}` : null,
        photo_out: record.photo_out ? 
            `data:image/jpeg;base64,${record.photo_out.toString('base64')}` : null
    }));

    res.json({ attendance: recordsWithPhotos });
}));

// Create attendance record
router.post('/', asyncHandler(async (req, res) => {
    try {
        // Validate attendance data
        attendanceValidation.validateAttendance(req.body);

        // Convert base64 photos to Buffer
        const photoIn = req.body.photo_in ? 
            Buffer.from(req.body.photo_in.replace(/^data:image\/\w+;base64,/, ''), 'base64') : 
            null;
        
        const photoOut = req.body.photo_out ? 
            Buffer.from(req.body.photo_out.replace(/^data:image\/\w+;base64,/, ''), 'base64') : 
            null;

        // Insert attendance
        const result = db.insertAttendance.run({
            ...req.body,
            photo_in: photoIn,
            photo_out: photoOut
        });

        // Get created record
        const record = db.getAttendanceById.get(result.lastID);

        // Convert photos back to base64
        const recordWithPhotos = {
            ...record,
            photo_in: record.photo_in ? 
                `data:image/jpeg;base64,${record.photo_in.toString('base64')}` : null,
            photo_out: record.photo_out ? 
                `data:image/jpeg;base64,${record.photo_out.toString('base64')}` : null
        };

        res.status(201).json({ 
            message: 'Attendance recorded successfully',
            attendance: recordWithPhotos
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

// Update attendance record
router.put('/:id', asyncHandler(async (req, res) => {
    try {
        // Check record exists
        const existing = db.getAttendanceById.get(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        // Validate attendance data
        attendanceValidation.validateAttendance(req.body);

        // Convert base64 photos to Buffer if provided
        const photoIn = req.body.photo_in ? 
            Buffer.from(req.body.photo_in.replace(/^data:image\/\w+;base64,/, ''), 'base64') : 
            existing.photo_in;
        
        const photoOut = req.body.photo_out ? 
            Buffer.from(req.body.photo_out.replace(/^data:image\/\w+;base64,/, ''), 'base64') : 
            existing.photo_out;

        // Update record
        db.updateAttendance.run({
            ...req.body,
            id: req.params.id,
            photo_in: photoIn,
            photo_out: photoOut
        });

        // Get updated record
        const record = db.getAttendanceById.get(req.params.id);

        // Convert photos back to base64
        const recordWithPhotos = {
            ...record,
            photo_in: record.photo_in ? 
                `data:image/jpeg;base64,${record.photo_in.toString('base64')}` : null,
            photo_out: record.photo_out ? 
                `data:image/jpeg;base64,${record.photo_out.toString('base64')}` : null
        };

        res.json({ 
            message: 'Attendance updated successfully',
            attendance: recordWithPhotos
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

// Delete attendance record
router.delete('/:id', asyncHandler(async (req, res) => {
    // Check record exists
    const record = db.getAttendanceById.get(req.params.id);
    if (!record) {
        return res.status(404).json({ error: 'Attendance record not found' });
    }

    // Delete record
    db.deleteAttendance.run(req.params.id);

    res.json({ 
        message: 'Attendance record deleted successfully' 
    });
}));

// Error handler
router.use((err, req, res, next) => {
    console.error('Attendance API Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

module.exports = router;
