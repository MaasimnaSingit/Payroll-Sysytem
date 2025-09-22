import React, { useState, useEffect } from 'react';
import FormField from '../common/FormField';
import { employeeValidation } from '../../services/validation';

export default function EmployeesForm({ 
    initialData = {}, 
    onSubmit, 
    onCancel, 
    loading = false,
    isEditing = false 
}) {
    const [form, setForm] = useState(initialData);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Reset form when initialData changes
    useEffect(() => {
        setForm(initialData);
        setErrors({});
        setTouched({});
    }, [initialData]);

    // Handle field change
    function handleChange(e) {
        const { name, value } = e.target;
        
        setForm(prev => {
            const newForm = { ...prev, [name]: value };

            // Auto-calculate rates
            if (name === 'hourly_rate') {
                const hourly = Number(value) || 0;
                newForm.daily_rate = (hourly * 8).toFixed(2);
                newForm.base_salary = (hourly * 8 * 22).toFixed(2);
            } else if (name === 'daily_rate') {
                const daily = Number(value) || 0;
                newForm.hourly_rate = (daily / 8).toFixed(2);
                newForm.base_salary = (daily * 22).toFixed(2);
            } else if (name === 'base_salary') {
                const monthly = Number(value) || 0;
                newForm.daily_rate = (monthly / 22).toFixed(2);
                newForm.hourly_rate = (monthly / 22 / 8).toFixed(2);
            }

            return newForm;
        });

        // Mark field as touched
        setTouched(prev => ({ ...prev, [name]: true }));
    }

    // Handle field validation
    function handleValidation(name, error) {
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }

    // Handle form submission
    function handleSubmit(e) {
        e.preventDefault();

        // Validate all fields
        const validationErrors = employeeValidation.validateEmployee(form);
        setErrors(validationErrors);

        // Mark all fields as touched
        const allTouched = Object.keys(form).reduce((acc, key) => ({
            ...acc,
            [key]: true
        }), {});
        setTouched(allTouched);

        // Submit if no errors
        if (Object.keys(validationErrors).length === 0) {
            onSubmit(form);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="form-section">
                <h4 className="form-section-title">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                        label="Employee Code"
                        name="employee_code"
                        value={form.employee_code || ''}
                        onChange={handleChange}
                        required
                        disabled={isEditing}
                        placeholder="e.g. EMP001"
                        error={errors.employee_code}
                        onValidation={handleValidation}
                    />
                    
                    <FormField
                        label="First Name"
                        name="first_name"
                        value={form.first_name || ''}
                        onChange={handleChange}
                        required
                        error={errors.first_name}
                        onValidation={handleValidation}
                    />
                    
                    <FormField
                        label="Last Name"
                        name="last_name"
                        value={form.last_name || ''}
                        onChange={handleChange}
                        required
                        error={errors.last_name}
                        onValidation={handleValidation}
                    />
                    
                    <FormField
                        label="Middle Name"
                        name="middle_name"
                        value={form.middle_name || ''}
                        onChange={handleChange}
                    />
                    
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email || ''}
                        onChange={handleChange}
                        required
                        error={errors.email}
                        onValidation={handleValidation}
                    />
                    
                    <FormField
                        label="Phone"
                        name="phone"
                        value={form.phone || ''}
                        onChange={handleChange}
                        placeholder="+63 912 345 6789"
                        error={errors.phone}
                        onValidation={handleValidation}
                    />
                </div>
            </div>

            {/* Government IDs */}
            <div className="form-section">
                <h4 className="form-section-title">Government IDs</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                        label="SSS Number"
                        name="sss_no"
                        value={form.sss_no || ''}
                        onChange={handleChange}
                        placeholder="12-3456789-0"
                        error={errors.sss_no}
                        onValidation={handleValidation}
                    />
                    
                    <FormField
                        label="PhilHealth Number"
                        name="philhealth_no"
                        value={form.philhealth_no || ''}
                        onChange={handleChange}
                        placeholder="12-345678901-2"
                        error={errors.philhealth_no}
                        onValidation={handleValidation}
                    />
                    
                    <FormField
                        label="Pag-IBIG Number"
                        name="pagibig_no"
                        value={form.pagibig_no || ''}
                        onChange={handleChange}
                        placeholder="1234-5678-9012"
                        error={errors.pagibig_no}
                        onValidation={handleValidation}
                    />
                    
                    <FormField
                        label="TIN Number"
                        name="tin_no"
                        value={form.tin_no || ''}
                        onChange={handleChange}
                        placeholder="123-456-789-000"
                        error={errors.tin_no}
                        onValidation={handleValidation}
                    />
                </div>
            </div>

            {/* Employment Information */}
            <div className="form-section">
                <h4 className="form-section-title">Employment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="form-group">
                        <label className="form-label">
                            Employment Type
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            className={`form-select ${errors.employment_type ? 'border-red-500' : ''}`}
                            name="employment_type"
                            value={form.employment_type || 'Regular'}
                            onChange={handleChange}
                            required
                        >
                            <option value="Regular">Regular</option>
                            <option value="Probationary">Probationary</option>
                            <option value="Contractual">Contractual</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Daily">Daily</option>
                        </select>
                        {errors.employment_type && (
                            <div className="text-red-500 text-sm mt-1">
                                {errors.employment_type}
                            </div>
                        )}
                    </div>
                    
                    <FormField
                        label="Department"
                        name="department"
                        value={form.department || ''}
                        onChange={handleChange}
                    />
                    
                    <FormField
                        label="Position"
                        name="position"
                        value={form.position || ''}
                        onChange={handleChange}
                    />
                    
                    <FormField
                        label="Date Hired"
                        name="date_hired"
                        type="date"
                        value={form.date_hired || ''}
                        onChange={handleChange}
                        required
                        error={errors.date_hired}
                        onValidation={handleValidation}
                    />
                    
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                            className="form-select"
                            name="status"
                            value={form.status || 'Active'}
                            onChange={handleChange}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Compensation */}
            <div className="form-section">
                <h4 className="form-section-title">Compensation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                        label="Base Salary (₱)"
                        name="base_salary"
                        type="number"
                        step="0.01"
                        value={form.base_salary || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                        error={errors.base_salary}
                        onValidation={handleValidation}
                    />
                    
                    <FormField
                        label="Hourly Rate (₱/hr)"
                        name="hourly_rate"
                        type="number"
                        step="0.01"
                        value={form.hourly_rate || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                        error={errors.hourly_rate}
                        onValidation={handleValidation}
                    />
                    
                    <FormField
                        label="Daily Rate (₱/day)"
                        name="daily_rate"
                        type="number"
                        step="0.01"
                        value={form.daily_rate || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                        error={errors.daily_rate}
                        onValidation={handleValidation}
                    />
                </div>
            </div>

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
                            Saving...
                        </span>
                    ) : (
                        isEditing ? 'Update Employee' : 'Add Employee'
                    )}
                </button>
            </div>
        </form>
    );
}
