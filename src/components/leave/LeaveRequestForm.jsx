import React, { useState, useEffect } from 'react';
import { LEAVE_TYPES } from '../../services/leaveApi';

export default function LeaveRequestForm({
    initialData = {},
    onSubmit,
    onCancel,
    loading = false,
    isEditing = false
}) {
    // State
    const [form, setForm] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [selectedType, setSelectedType] = useState(null);

    // Update selected type when leave type changes
    useEffect(() => {
        if (form.leave_type) {
            setSelectedType(LEAVE_TYPES[form.leave_type]);
        }
    }, [form.leave_type]);

    // Handle form change
    function handleChange(e) {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'file' ? e.target.files[0] : value
        }));

        // Clear error when field changes
        if (errors[name]) {
            setErrors(prev => {
                const { [name]: _, ...rest } = prev;
                return rest;
            });
        }
    }

    // Handle form submission
    function handleSubmit(e) {
        e.preventDefault();
        onSubmit(form);
    }

    // Calculate days
    function calculateDays() {
        if (!form.start_date || !form.end_date) return 0;
        const start = new Date(form.start_date);
        const end = new Date(form.end_date);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div className="form-group">
                <label className="form-label">
                    Leave Type
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                    className={`form-select ${errors.leave_type ? 'border-red-500' : ''}`}
                    name="leave_type"
                    value={form.leave_type || ''}
                    onChange={handleChange}
                    required
                    disabled={loading}
                >
                    <option value="">Select Leave Type</option>
                    {Object.values(LEAVE_TYPES).map(type => (
                        <option key={type.id} value={type.id}>
                            {type.name} {type.days ? `(${type.days} days)` : ''}
                        </option>
                    ))}
                </select>
                {errors.leave_type && (
                    <div className="text-red-500 text-sm mt-1">
                        {errors.leave_type}
                    </div>
                )}
                {selectedType && (
                    <div className="text-sm text-muted mt-1">
                        {selectedType.description}
                    </div>
                )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label">
                        Start Date
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="date"
                        className={`form-input ${errors.start_date ? 'border-red-500' : ''}`}
                        name="start_date"
                        value={form.start_date || ''}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.start_date && (
                        <div className="text-red-500 text-sm mt-1">
                            {errors.start_date}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">
                        End Date
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="date"
                        className={`form-input ${errors.end_date ? 'border-red-500' : ''}`}
                        name="end_date"
                        value={form.end_date || ''}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        min={form.start_date || new Date().toISOString().split('T')[0]}
                    />
                    {errors.end_date && (
                        <div className="text-red-500 text-sm mt-1">
                            {errors.end_date}
                        </div>
                    )}
                </div>
            </div>

            {/* Days */}
            {form.start_date && form.end_date && (
                <div className="bg-panel-2 rounded-lg p-4">
                    <div className="text-sm">
                        Number of days: <strong>{calculateDays()}</strong>
                    </div>
                    {selectedType?.days && calculateDays() > selectedType.days && (
                        <div className="text-red-500 text-sm mt-1">
                            Exceeds maximum allowed days ({selectedType.days})
                        </div>
                    )}
                </div>
            )}

            {/* Reason */}
            <div className="form-group">
                <label className="form-label">
                    Reason
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                    className={`form-textarea ${errors.reason ? 'border-red-500' : ''}`}
                    name="reason"
                    value={form.reason || ''}
                    onChange={handleChange}
                    rows="3"
                    required
                    disabled={loading}
                />
                {errors.reason && (
                    <div className="text-red-500 text-sm mt-1">
                        {errors.reason}
                    </div>
                )}
            </div>

            {/* Documentation */}
            {selectedType?.documentation_required && (
                <div className="form-group">
                    <label className="form-label">
                        Documentation
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="file"
                        className={`form-input ${errors.documentation ? 'border-red-500' : ''}`}
                        name="documentation"
                        onChange={handleChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        required={selectedType.documentation_required}
                        disabled={loading}
                    />
                    {errors.documentation && (
                        <div className="text-red-500 text-sm mt-1">
                            {errors.documentation}
                        </div>
                    )}
                    <div className="text-sm text-muted mt-1">
                        {selectedType.documentation_note}
                    </div>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Submitting...
                        </span>
                    ) : (
                        isEditing ? 'Update Request' : 'Submit Request'
                    )}
                </button>
            </div>
        </form>
    );
}
