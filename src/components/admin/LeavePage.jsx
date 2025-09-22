import React, { useState, useEffect } from 'react';
import { leaveApi, LEAVE_TYPES } from '../../services/leaveApi';
import LeaveRequestForm from '../leave/LeaveRequestForm';
import { notify } from '../../utils/notifications';

export default function LeavePage() {
    // State
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filter, setFilter] = useState({
        status: '',
        type: '',
        date: new Date().toISOString().slice(0, 7) // YYYY-MM
    });

    // Load data on mount
    useEffect(() => {
        loadRequests();
    }, [filter]);

    // Load leave requests
    async function loadRequests() {
        try {
            setLoading(true);
            const data = await leaveApi.getHistory(filter);
            setRequests(data);
        } catch (err) {
            notify.error('Failed to load leave requests');
            console.error('Failed to load requests:', err);
        } finally {
            setLoading(false);
        }
    }

    // Handle form submission
    async function handleSubmit(data) {
        try {
            setLoading(true);

            if (editingId) {
                await leaveApi.update(editingId, data);
                notify.success('Leave request updated');
            } else {
                await leaveApi.submit(data);
                notify.success('Leave request submitted');
            }

            setShowForm(false);
            setEditingId(null);
            loadRequests();

        } catch (err) {
            notify.error(err.message || 'Failed to save leave request');
            console.error('Failed to save request:', err);
        } finally {
            setLoading(false);
        }
    }

    // Handle request approval
    async function handleApprove(id) {
        const remarks = prompt('Enter approval remarks (optional):');
        if (remarks === null) return; // User cancelled

        try {
            setLoading(true);
            await leaveApi.approve(id, remarks);
            notify.success('Leave request approved');
            loadRequests();
        } catch (err) {
            notify.error('Failed to approve request');
            console.error('Failed to approve:', err);
        } finally {
            setLoading(false);
        }
    }

    // Handle request rejection
    async function handleReject(id) {
        const remarks = prompt('Enter rejection reason:');
        if (!remarks) {
            notify.error('Rejection reason is required');
            return;
        }

        try {
            setLoading(true);
            await leaveApi.reject(id, remarks);
            notify.success('Leave request rejected');
            loadRequests();
        } catch (err) {
            notify.error('Failed to reject request');
            console.error('Failed to reject:', err);
        } finally {
            setLoading(false);
        }
    }

    // Handle request cancellation
    async function handleCancel(id) {
        if (!confirm('Are you sure you want to cancel this request?')) return;

        try {
            setLoading(true);
            await leaveApi.cancel(id);
            notify.success('Leave request cancelled');
            loadRequests();
        } catch (err) {
            notify.error('Failed to cancel request');
            console.error('Failed to cancel:', err);
        } finally {
            setLoading(false);
        }
    }

    // Export leave report
    async function exportReport() {
        try {
            setLoading(true);
            const data = await leaveApi.exportReport(filter);
            
            // Create download link
            const blob = new Blob([data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leave_report_${filter.date}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            notify.success('Leave report exported');
        } catch (err) {
            notify.error('Failed to export report');
            console.error('Failed to export:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="content-area">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-semibold">Leave Management</h1>
                <div className="flex gap-2">
                    <button
                        className="btn btn-ghost"
                        onClick={exportReport}
                        disabled={loading}
                    >
                        Export Report
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            setEditingId(null);
                            setShowForm(true);
                        }}
                        disabled={loading}
                    >
                        New Request
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                    <select
                        className="form-select w-full"
                        value={filter.status}
                        onChange={e => setFilter(prev => ({ ...prev, status: e.target.value }))}
                        disabled={loading}
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <select
                        className="form-select w-full"
                        value={filter.type}
                        onChange={e => setFilter(prev => ({ ...prev, type: e.target.value }))}
                        disabled={loading}
                    >
                        <option value="">All Types</option>
                        {Object.values(LEAVE_TYPES).map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <input
                        type="month"
                        className="form-input w-full"
                        value={filter.date}
                        onChange={e => setFilter(prev => ({ ...prev, date: e.target.value }))}
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Request Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-panel rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">
                                    {editingId ? 'Edit Leave Request' : 'New Leave Request'}
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
                            <LeaveRequestForm
                                initialData={editingId ? requests.find(r => r.id === editingId) : {}}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                }}
                                loading={loading}
                                isEditing={!!editingId}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Requests Table */}
            <div className="bg-panel rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-4">Employee</th>
                                <th className="text-left p-4">Type</th>
                                <th className="text-left p-4">Dates</th>
                                <th className="text-left p-4">Days</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Remarks</th>
                                <th className="text-right p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-4 text-muted">
                                        No leave requests found
                                    </td>
                                </tr>
                            ) : (
                                requests.map(request => (
                                    <tr key={request.id} className="border-b border-border hover:bg-panel-2">
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium">
                                                    {request.employee_name}
                                                </div>
                                                <div className="text-sm text-muted">
                                                    {request.employee_code}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded text-sm ${
                                                request.leave_type === 'SIL' ? 'bg-blue-100 text-blue-800' :
                                                request.leave_type === 'VL' ? 'bg-green-100 text-green-800' :
                                                request.leave_type === 'SL' ? 'bg-red-100 text-red-800' :
                                                request.leave_type === 'ML' ? 'bg-purple-100 text-purple-800' :
                                                request.leave_type === 'PL' ? 'bg-indigo-100 text-indigo-800' :
                                                request.leave_type === 'SPL' ? 'bg-pink-100 text-pink-800' :
                                                request.leave_type === 'BL' ? 'bg-gray-100 text-gray-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {LEAVE_TYPES[request.leave_type]?.name || request.leave_type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div>{request.start_date}</div>
                                            <div className="text-sm text-muted">to</div>
                                            <div>{request.end_date}</div>
                                        </td>
                                        <td className="p-4">
                                            {request.days}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-1 rounded text-sm ${
                                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-muted">
                                                {request.remarks || '-'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn btn-ghost btn-sm text-green-500"
                                                            onClick={() => handleApprove(request.id)}
                                                            disabled={loading}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="btn btn-ghost btn-sm text-red-500"
                                                            onClick={() => handleReject(request.id)}
                                                            disabled={loading}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
                                                {request.status === 'pending' && (
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleCancel(request.id)}
                                                        disabled={loading}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Optimization */}
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
