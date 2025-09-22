// Philippines-compliant Leave Management API
const express = require('express');
const router = express.Router();
const { authRequired, requireRole } = require('../middleware/auth');
const phPayroll = require('../lib/ph_payroll');

// Get all leave types
router.get('/types', (req, res) => {
  try {
    const db = req.app.get('db');
    const stmt = db.prepare('SELECT * FROM leave_types ORDER BY leave_name');
    const leaveTypes = stmt.all();
    
    res.json({ success: true, leave_types: leaveTypes });
  } catch (error) {
    console.error('Error fetching leave types:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave types' });
  }
});

// Get employee leave balances
router.get('/balances/:employee_id', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { employee_id } = req.params;
    const { year = new Date().getFullYear() } = req.query;
    
    const stmt = db.prepare(`
      SELECT 
        elb.*,
        lt.leave_code, lt.leave_name, lt.leave_description, lt.is_paid, lt.max_days_per_year
      FROM employee_leave_balances elb
      JOIN leave_types lt ON elb.leave_type_id = lt.id
      WHERE elb.employee_id = ? AND elb.year = ?
      ORDER BY lt.leave_name
    `);
    
    const balances = stmt.all(employee_id, year);
    
    res.json({ success: true, balances });
  } catch (error) {
    console.error('Error fetching leave balances:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave balances' });
  }
});

// Get all leave requests
router.get('/requests', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { status, employee_id, leave_type, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        lr.*,
        e.employee_code, e.full_name,
        lt.leave_code, lt.leave_name,
        u.username as approver_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u ON lr.approver_user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }
    
    if (employee_id) {
      query += ' AND lr.employee_id = ?';
      params.push(employee_id);
    }
    
    if (leave_type) {
      query += ' AND lt.leave_code = ?';
      params.push(leave_type);
    }
    
    if (start_date) {
      query += ' AND lr.start_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND lr.end_date <= ?';
      params.push(end_date);
    }
    
    query += ' ORDER BY lr.created_at DESC';
    
    const stmt = db.prepare(query);
    const requests = stmt.all(...params);
    
    // Format dates
    const formattedRequests = requests.map(request => ({
      ...request,
      start_date_formatted: phPayroll.formatDate(request.start_date),
      end_date_formatted: phPayroll.formatDate(request.end_date),
      created_at_formatted: phPayroll.formatDate(request.created_at),
      approved_at_formatted: request.approved_at ? phPayroll.formatDate(request.approved_at) : null
    }));
    
    res.json({ success: true, requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave requests' });
  }
});

// Create leave request
router.post('/requests', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const {
      employee_id, leave_type_id, start_date, end_date, reason, medical_certificate, emergency_contact
    } = req.body;
    
    // Validate required fields
    if (!employee_id || !leave_type_id || !start_date || !end_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: employee_id, leave_type_id, start_date, end_date' 
      });
    }
    
    // Calculate total days
    const start = new Date(start_date);
    const end = new Date(end_date);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    if (totalDays <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'End date must be after start date' 
      });
    }
    
    // Check leave balance
    const year = start.getFullYear();
    const balanceStmt = db.prepare(`
      SELECT remaining_days FROM employee_leave_balances 
      WHERE employee_id = ? AND leave_type_id = ? AND year = ?
    `);
    const balance = balanceStmt.get(employee_id, leave_type_id, year);
    
    if (!balance || balance.remaining_days < totalDays) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient leave balance' 
      });
    }
    
    // Check for overlapping requests
    const overlapStmt = db.prepare(`
      SELECT id FROM leave_requests 
      WHERE employee_id = ? AND status IN ('Pending', 'Approved') 
      AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))
    `);
    const overlap = overlapStmt.get(employee_id, start_date, start_date, end_date, end_date);
    
    if (overlap) {
      return res.status(400).json({ 
        success: false, 
        error: 'Overlapping leave request exists' 
      });
    }
    
    // Create leave request
    const stmt = db.prepare(`
      INSERT INTO leave_requests (
        employee_id, leave_type_id, start_date, end_date, total_days, 
        reason, medical_certificate, emergency_contact
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      employee_id, leave_type_id, start_date, end_date, totalDays,
      reason, medical_certificate, emergency_contact
    );
    
    // Log the request
    const logStmt = db.prepare(`
      INSERT INTO leave_request_logs (leave_request_id, actor_user_id, action, notes)
      VALUES (?, ?, 'Submitted', ?)
    `);
    logStmt.run(result.lastInsertRowid, req.user.id, reason);
    
    res.json({ 
      success: true, 
      message: 'Leave request submitted successfully',
      request_id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ success: false, error: 'Failed to create leave request' });
  }
});

// Approve leave request
router.put('/requests/:id/approve', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const requestId = req.params.id;
    const { approval_notes } = req.body;
    
    // Get request details
    const requestStmt = db.prepare(`
      SELECT * FROM leave_requests WHERE id = ?
    `);
    const request = requestStmt.get(requestId);
    
    if (!request) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }
    
    if (request.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Request is not pending approval' 
      });
    }
    
    // Update request status
    const updateStmt = db.prepare(`
      UPDATE leave_requests 
      SET status = 'Approved', approver_user_id = ?, approval_notes = ?, approved_at = datetime('now')
      WHERE id = ?
    `);
    updateStmt.run(req.user.id, approval_notes, requestId);
    
    // Update leave balance
    const year = new Date(request.start_date).getFullYear();
    const balanceStmt = db.prepare(`
      UPDATE employee_leave_balances 
      SET used_days = used_days + ?, updated_at = datetime('now')
      WHERE employee_id = ? AND leave_type_id = ? AND year = ?
    `);
    balanceStmt.run(request.total_days, request.employee_id, request.leave_type_id, year);
    
    // Log the approval
    const logStmt = db.prepare(`
      INSERT INTO leave_request_logs (leave_request_id, actor_user_id, action, notes)
      VALUES (?, ?, 'Approved', ?)
    `);
    logStmt.run(requestId, req.user.id, approval_notes);
    
    res.json({ success: true, message: 'Leave request approved successfully' });
  } catch (error) {
    console.error('Error approving leave request:', error);
    res.status(500).json({ success: false, error: 'Failed to approve leave request' });
  }
});

// Reject leave request
router.put('/requests/:id/reject', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const requestId = req.params.id;
    const { approval_notes } = req.body;
    
    // Get request details
    const requestStmt = db.prepare(`
      SELECT * FROM leave_requests WHERE id = ?
    `);
    const request = requestStmt.get(requestId);
    
    if (!request) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }
    
    if (request.status !== 'Pending') {
      return res.status(400).json({ 
        success: false, 
        error: 'Request is not pending approval' 
      });
    }
    
    // Update request status
    const updateStmt = db.prepare(`
      UPDATE leave_requests 
      SET status = 'Rejected', approver_user_id = ?, approval_notes = ?, approved_at = datetime('now')
      WHERE id = ?
    `);
    updateStmt.run(req.user.id, approval_notes, requestId);
    
    // Log the rejection
    const logStmt = db.prepare(`
      INSERT INTO leave_request_logs (leave_request_id, actor_user_id, action, notes)
      VALUES (?, ?, 'Rejected', ?)
    `);
    logStmt.run(requestId, req.user.id, approval_notes);
    
    res.json({ success: true, message: 'Leave request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    res.status(500).json({ success: false, error: 'Failed to reject leave request' });
  }
});

// Get leave request details with logs
router.get('/requests/:id', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const requestId = req.params.id;
    
    // Get request details
    const requestStmt = db.prepare(`
      SELECT 
        lr.*,
        e.employee_code, e.full_name, e.department, e.position,
        lt.leave_code, lt.leave_name, lt.leave_description,
        u.username as approver_name
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u ON lr.approver_user_id = u.id
      WHERE lr.id = ?
    `);
    
    const request = requestStmt.get(requestId);
    
    if (!request) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }
    
    // Get request logs
    const logsStmt = db.prepare(`
      SELECT 
        lrl.*,
        u.username as actor_name
      FROM leave_request_logs lrl
      JOIN users u ON lrl.actor_user_id = u.id
      WHERE lrl.leave_request_id = ?
      ORDER BY lrl.created_at
    `);
    
    const logs = logsStmt.all(requestId);
    
    // Format dates
    const formattedRequest = {
      ...request,
      start_date_formatted: phPayroll.formatDate(request.start_date),
      end_date_formatted: phPayroll.formatDate(request.end_date),
      created_at_formatted: phPayroll.formatDate(request.created_at),
      approved_at_formatted: request.approved_at ? phPayroll.formatDate(request.approved_at) : null,
      logs: logs.map(log => ({
        ...log,
        created_at_formatted: phPayroll.formatDate(log.created_at)
      }))
    };
    
    res.json({ success: true, request: formattedRequest });
  } catch (error) {
    console.error('Error fetching leave request details:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave request details' });
  }
});

// Get leave calendar for employee
router.get('/calendar/:employee_id', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { employee_id } = req.params;
    const { year = new Date().getFullYear(), month } = req.query;
    
    let query = `
      SELECT 
        lr.start_date, lr.end_date, lr.total_days, lr.status,
        lt.leave_code, lt.leave_name, lt.is_paid
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      WHERE lr.employee_id = ? AND strftime('%Y', lr.start_date) = ?
    `;
    
    const params = [employee_id, year];
    
    if (month) {
      query += ' AND strftime("%m", lr.start_date) = ?';
      params.push(month.padStart(2, '0'));
    }
    
    query += ' ORDER BY lr.start_date';
    
    const stmt = db.prepare(query);
    const leaves = stmt.all(...params);
    
    res.json({ success: true, leaves });
  } catch (error) {
    console.error('Error fetching leave calendar:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leave calendar' });
  }
});

// Export leave requests to CSV
router.get('/export', authRequired, requireRole('admin'), (req, res) => {
  try {
    const db = req.app.get('db');
    const { start_date, end_date, status } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters: start_date, end_date' 
      });
    }
    
    let query = `
      SELECT 
        lr.id, lr.start_date, lr.end_date, lr.total_days, lr.status, lr.reason,
        e.employee_code, e.full_name, e.department,
        lt.leave_code, lt.leave_name, lt.is_paid,
        u.username as approver_name, lr.approved_at
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      LEFT JOIN users u ON lr.approver_user_id = u.id
      WHERE lr.start_date BETWEEN ? AND ?
    `;
    
    const params = [start_date, end_date];
    
    if (status) {
      query += ' AND lr.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY lr.start_date, e.employee_code';
    
    const stmt = db.prepare(query);
    const requests = stmt.all(...params);
    
    // Convert to CSV
    const csvData = requests.map(request => ({
      'Request ID': request.id,
      'Employee Code': request.employee_code,
      'Employee Name': request.full_name,
      'Department': request.department,
      'Leave Type': request.leave_name,
      'Start Date': phPayroll.formatDate(request.start_date),
      'End Date': phPayroll.formatDate(request.end_date),
      'Total Days': request.total_days,
      'Status': request.status,
      'Reason': request.reason,
      'Is Paid': request.is_paid ? 'Yes' : 'No',
      'Approver': request.approver_name || 'N/A',
      'Approved At': request.approved_at ? phPayroll.formatDate(request.approved_at) : 'N/A'
    }));
    
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leave_requests_${start_date}_to_${end_date}.csv"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting leave requests:', error);
    res.status(500).json({ success: false, error: 'Failed to export leave requests' });
  }
});

module.exports = router;
