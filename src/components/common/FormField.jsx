import React, { useState, useEffect } from 'react';
import { employeeValidation, formatFieldValue } from '../../services/validation';

export default function FormField({
    label,
    name,
    value,
    onChange,
    type = 'text',
    required = false,
    disabled = false,
    placeholder = '',
    error = null,
    autoFormat = true,
    className = '',
    onValidation = null
}) {
    const [localError, setLocalError] = useState(null);
    const [touched, setTouched] = useState(false);

    // Validate on value change
    useEffect(() => {
        if (touched) {
            let error = null;
            
            if (required && !value) {
                error = 'This field is required';
            } else if (value) {
                // Create a minimal data object for validation
                const data = { [name]: value };
                const errors = employeeValidation(data);
                error = errors[name] || null;
            }
            
            setLocalError(error);
            if (onValidation) onValidation(name, error);
        }
    }, [value, name, required, touched, onValidation]);

    // Handle change with auto-formatting
    function handleChange(e) {
        let newValue = e.target.value;
        
        // Auto-format if enabled
        if (autoFormat) {
            newValue = formatFieldValue(newValue, type);
        }

        // Call parent onChange
        onChange({
            target: {
                name,
                value: newValue
            }
        });
    }

    // Handle blur
    function handleBlur() {
        setTouched(true);
    }

    // Get display error (prop takes precedence)
    const displayError = error || localError;

    return (
        <div className={`form-group ${className}`}>
            <label className="form-label">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            <input
                className={`form-input ${displayError ? 'border-red-500' : ''}`}
                type={type}
                name={name}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={placeholder}
                required={required}
            />
            
            {displayError && (
                <div className="text-red-500 text-sm mt-1">
                    {displayError}
                </div>
            )}
        </div>
    );
}
