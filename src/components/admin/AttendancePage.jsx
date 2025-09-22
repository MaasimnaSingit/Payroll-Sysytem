import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../services/attendanceApi';
import { phEmployeeApi as employeeApi } from '../../services/api';
import AttendanceForm from '../attendance/AttendanceForm';
import { notify } from '../../utils/notifications';
import { formatCurrency } from '../../utils/formatters';

// Constants for empty state
const EMPTY = {
    employee_id: '',
    work_date: new Date().toISOString().slice(0, 10),
    time_in: '',
    time_out: '',
    break_minutes: 0,
    photo_in: null,
    photo_out: null,
    day_type: 'Regular',
    manual_overtime_hours: 0,
    notes: ''
};

export default function AttendancePage() {
    // State
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));

    // Load data on mount
    useEffect(() => {
        loadEmployees();
        loadRecords();
    }, []);

    // Load employees
    async function loadEmployees() {
        try {
            const data = await employeeApi.getAll();
            setEmployees(data);
        } catch (err) {
            notify.error('Failed to load employees');
            console.error('Failed to load employees:', err);
        }
    }

    // Load attendance records
    async function loadRecords() {
        try {
            setLoading(true);
            const data = await attendanceApi.getAll({ date: dateFilter });
            setRecords(data);
        } catch (err) {
            notify.error('Failed to load attendance records');
            console.error('Failed to load records:', err);
        } finally {
            setLoading(false);
        }
    }

    // Handle form submission
    async function handleSubmit(data) {
        try {
            setFormLoading(true);

            if (editingId) {
                await attendanceApi.update(editingId, data);
                notify.success('Attendance record updated');
            } else {
                await attendanceApi.create(data);
                notify.success('Attendance record created');
            }

            // Reset form and reload
            setShowForm(false);
            setEditingId(null);
            loadRecords();

        } catch (err) {
            notify.error(err.message || 'Failed to save attendance record');
            console.error('Failed to save attendance:', err);
        } finally {
            setFormLoading(false);
        }
    }

    // Handle edit
    function handleEdit(record) {
        setEditingId(record.id);
        setShowForm(true);
    }

    // Handle delete
    async function handleDelete(id) {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            setLoading(true);
            await attendanceApi.delete(id);
            notify.success('Attendance record deleted');
            loadRecords();
        } catch (err) {
            notify.error('Failed to delete record');
            console.error('Failed to delete record:', err);
        } finally {
            setLoading(false);
        }
    }

    // Format time range
    function formatTimeRange(timeIn, timeOut) {
        if (!timeIn) return '-';
        if (!timeOut) return `${timeIn} - Present`;
        return `${timeIn} - ${timeOut}`;
    }

    // Get employee name
    function getEmployeeName(id) {
        const emp = employees.find(e => e.id === id);
        return emp ? `${emp.first_name} ${emp.last_name}` : '-';
    }

    // Filter records
    const filteredRecords = records.filter(record => {
        const name = getEmployeeName(record.employee_id).toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search);
    });

    return (
        <div className="content-area">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-semibold">Attendance Records</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingId(null);
                        setShowForm(true);
                    }}
                >
                    Record Attendance
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        className="form-input w-full"
                        placeholder="Search by employee name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <input
                        type="date"
                        className="form-input w-full"
                        value={dateFilter}
                        onChange={e => {
                            setDateFilter(e.target.value);
                            loadRecords();
                        }}
                    />
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-panel rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">
                                    {editingId ? 'Edit Attendance' : 'Record Attendance'}
                                </h2>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            <AttendanceForm
                                initialData={editingId ? records.find(r => r.id === editingId) : EMPTY}
                                employees={employees}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                }}
                                loading={formLoading}
                                isEditing={!!editingId}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Records Table */}
            <div className="bg-panel rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4">Employee</th>
                                <th className="text-left p-4">Date</th>
                                <th className="text-left p-4">Time</th>
                                <th className="text-left p-4">Type</th>
                                <th className="text-right p-4">Regular Hours</th>
                                <th className="text-right p-4">OT Hours</th>
                                <th className="text-right p-4">Night Diff</th>
                                <th className="text-right p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-4 text-muted">
                                        No attendance records found
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map(record => (
                                    <tr key={record.id} className="border-b border-border hover:bg-panel-2">
                                        <td className="p-4">
                                            {getEmployeeName(record.employee_id)}
                                        </td>
                                        <td className="p-4">
                                            {record.work_date}
                                        </td>
                                        <td className="p-4">
                                            {formatTimeRange(record.time_in, record.time_out)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded text-sm ${
                                                record.day_type === 'Regular' ? 'bg-blue-100 text-blue-800' :
                                                record.day_type === 'Rest day' ? 'bg-purple-100 text-purple-800' :
                                                record.day_type.includes('Holiday') ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {record.day_type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {record.regular_hours?.toFixed(2) || '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            {record.overtime_hours ? (
                                                <div className="text-right">
                                                    <div>{record.overtime_hours.toFixed(2)}</div>
                                                    <div className="text-xs text-muted">
                                                        {record.day_type === 'Regular' ? '(125%)' :
                                                         record.day_type === 'Rest day' ? '(130%)' :
                                                         record.day_type === 'Regular Holiday' ? '(200%)' :
                                                         record.day_type === 'Special Holiday' ? '(130%)' :
                                                         record.day_type === 'Double Holiday' ? '(300%)' :
                                                         ''}
                                                    </div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4 text-right">
                                            {record.night_diff_hours ? (
                                                <div className="text-right">
                                                    <div>{record.night_diff_hours.toFixed(2)}</div>
                                                    <div className="text-xs text-muted">(+10%)</div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                {/* Photo Preview */}
                                                {(record.photo_in || record.photo_out) && (
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => {
                                                            // Show photo modal
                                                            // TODO: Implement photo preview modal
                                                        }}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {/* Edit */}
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleEdit(record)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    className="btn btn-ghost btn-sm text-red-500"
                                                    onClick={() => handleDelete(record.id)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Optimization Styles */}
            <style jsx>{`
                @media (max-width: 640px) {
                    .content-area {
                        padding: 1rem;
                    }

                    table {
                        display: block;
                        overflow-x: auto;
                        white-space: nowrap;
                    }

                    td, th {
                        padding: 0.75rem;
                    }

                    .btn {
                        padding: 0.5rem 1rem;
                        font-size: 0.875rem;
                    }
                }
            `}</style>
        </div>
    );
}