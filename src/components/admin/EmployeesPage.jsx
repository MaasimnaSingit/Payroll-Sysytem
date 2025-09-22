import React, { useState, useEffect } from 'react';
import { phEmployeeApi as employeeApi } from '../../services/api';
import EmployeeForm from './EmployeesForm';
import Notification from '../common/Notification';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const [editing, setEditing] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Load employees on mount
    useEffect(() => {
        loadEmployees();
    }, []);

    // Load employees from API
    async function loadEmployees() {
        setLoading(true);
        setError(null);
        try {
            const data = await employeeApi.getAll();
            setEmployees(data);
        } catch (err) {
            setError('Failed to load employees');
            showNotification('error', 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    }

    // Show notification helper
    function showNotification(type, message) {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    }

    // Handle form submission
    async function handleSubmit(data) {
        setLoading(true);
        setError(null);
        try {
            if (editing) {
                await employeeApi.update(editing.id, data);
                showNotification('success', 'Employee updated successfully');
                setEditing(null);
            } else {
                await employeeApi.create(data);
                showNotification('success', 'Employee added successfully');
            }
            await loadEmployees();
        } catch (err) {
            setError(err.message);
            showNotification('error', err.message);
        } finally {
            setLoading(false);
        }
    }

    // Handle employee deletion
    async function handleDelete(employee) {
        if (!confirm(`Delete ${employee.first_name} ${employee.last_name}?`)) return;

        setLoading(true);
        setError(null);
        try {
            await employeeApi.delete(employee.id);
            showNotification('success', 'Employee deleted successfully');
            await loadEmployees();
        } catch (err) {
            setError('Failed to delete employee');
            showNotification('error', 'Failed to delete employee');
        } finally {
            setLoading(false);
        }
    }

    // Filter employees based on search
    const filteredEmployees = employees.filter(emp => {
        const searchStr = searchQuery.toLowerCase();
        return (
            emp.employee_code.toLowerCase().includes(searchStr) ||
            emp.first_name.toLowerCase().includes(searchStr) ||
            emp.last_name.toLowerCase().includes(searchStr) ||
            emp.email.toLowerCase().includes(searchStr) ||
            (emp.department || '').toLowerCase().includes(searchStr)
        );
    });

    return (
        <div className="content-area">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 fade-in-up">
                <div>
                    <div className="text-sm text-tertiary font-semibold uppercase tracking-wider mb-2">
                        Management
                    </div>
                    <h1 className="text-3xl font-bold text-primary mb-2" style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Employee Management
                    </h1>
                    <div className="text-tertiary">
                        Manage your team members with comprehensive Philippines-compliant employee data
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-blue-50 text-blue-600 p-4 rounded-lg mb-4 flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Employee Form */}
            <div className="premium-card mb-6">
                <div className="card-header">
                    <h3 className="card-title">
                        {editing ? 'Edit Employee' : 'Add New Employee'}
                    </h3>
                </div>
                <div className="p-6">
                    <EmployeeForm
                        initialData={editing || {}}
                        onSubmit={handleSubmit}
                        onCancel={editing ? () => setEditing(null) : undefined}
                        loading={loading}
                        isEditing={!!editing}
                    />
                </div>
            </div>

            {/* Search Bar */}
            <div className="premium-card mb-6">
                <div className="card-header">
                    <h3 className="card-title">Search & Filter</h3>
                </div>
                <div className="p-4">
                    <input
                        type="text"
                        className="form-input w-full"
                        placeholder="Search by name, code, email, or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Employee Table */}
            <div className="premium-card">
                <div className="card-header">
                    <h3 className="card-title">Employee Directory</h3>
                    <div className="text-sm text-tertiary">
                        {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Position</th>
                                <th>Status</th>
                                <th>Government IDs</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map(emp => (
                                <tr key={emp.id}>
                                    <td>{emp.employee_code}</td>
                                    <td>{emp.first_name} {emp.last_name}</td>
                                    <td>{emp.email}</td>
                                    <td>{emp.department || '-'}</td>
                                    <td>{emp.position || '-'}</td>
                                    <td>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            emp.status === 'Active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex flex-col gap-1 text-xs">
                                            {emp.sss_no && <div>SSS: {emp.sss_no}</div>}
                                            {emp.philhealth_no && <div>PhilHealth: {emp.philhealth_no}</div>}
                                            {emp.pagibig_no && <div>Pag-IBIG: {emp.pagibig_no}</div>}
                                            {emp.tin_no && <div>TIN: {emp.tin_no}</div>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setEditing(emp)}
                                                disabled={loading}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm text-red-600"
                                                onClick={() => handleDelete(emp)}
                                                disabled={loading}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredEmployees.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-tertiary">
                                        {employees.length === 0 
                                            ? 'No employees yet. Add your first employee above.' 
                                            : 'No employees match your search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notifications */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
}