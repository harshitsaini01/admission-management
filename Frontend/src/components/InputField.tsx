import React, { useState, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  options?: Option[];
  min?: string;
  max?: string;
  pattern?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  readOnly = false,
  options,
  min,
  max,
  pattern,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const [validationError, setValidationError] = useState<string>("");
  const [isTouched, setIsTouched] = useState(false);

  // Handle special cases for numeric fields that should clear on focus
  const isMarksField = name.includes('Marks') || name.includes('Percentage');
  const isPincodeField = name === 'pincode';
  const isMobileField = name.includes('mobile') || name.includes('Mobile') || name === 'contactNumber';
  const isEmailField = type === 'email';

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const validateField = (fieldValue: string | number) => {
    const stringValue = String(fieldValue);
    
    if (isEmailField && stringValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue)) {
        return "Please enter a valid email address";
      }
    }
    
    if (isMobileField && stringValue) {
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(stringValue.replace(/\D/g, ''))) {
        return "Please enter a valid 10-digit mobile number";
      }
    }
    
    if (isPincodeField && stringValue) {
      const pincodeRegex = /^\d{6}$/;
      if (!pincodeRegex.test(stringValue)) {
        return "Please enter a valid 6-digit pincode";
      }
    }
    
    if (isMarksField && stringValue && stringValue !== "0") {
      const marks = parseFloat(stringValue);
      if (isNaN(marks) || marks < 0 || marks > 100) {
        return "Please enter valid marks between 0-100";
      }
    }
    
    return "";
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsTouched(true);
    
    // Clear default values on focus for specific fields
    if ((isMarksField && (value === "0" || value === 0)) || 
        (isPincodeField && value === "")) {
      setDisplayValue("");
    }
    
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    const currentValue = e.target.value;
    const error = validateField(currentValue);
    setValidationError(error);
    
    // Restore default values if field is empty
    if (!currentValue) {
      if (isMarksField) {
        setDisplayValue("0");
        // Create a synthetic event to update parent
        const syntheticEvent = {
          target: { name, value: "0" }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    }
    
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    setIsTouched(true);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
    
    // Format mobile number input
    if (isMobileField && newValue) {
      const digitsOnly = newValue.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        const formattedEvent = {
          ...e,
          target: { ...e.target, value: digitsOnly }
        };
        onChange(formattedEvent);
        return;
      } else {
        return; // Don't allow more than 10 digits
      }
    }
    
    // Format pincode input
    if (isPincodeField && newValue) {
      const digitsOnly = newValue.replace(/\D/g, '');
      if (digitsOnly.length <= 6) {
        const formattedEvent = {
          ...e,
          target: { ...e.target, value: digitsOnly }
        };
        onChange(formattedEvent);
        return;
      } else {
        return; // Don't allow more than 6 digits
      }
    }
    
    onChange(e);
  };

  const getInputPattern = () => {
    if (pattern) return pattern;
    if (isMobileField) return "[0-9]{10}";
    if (isPincodeField) return "[0-9]{6}";
    if (isEmailField) return "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$";
    return undefined;
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    if (isMobileField) return "Enter 10-digit mobile number";
    if (isPincodeField) return "Enter 6-digit pincode";
    if (isEmailField) return "Enter valid email address";
    if (isMarksField) return "Enter marks";
    return "";
  };

  // Only show validation error styling if field has been touched
  const showValidationError = isTouched && validationError;

  if (type === "select" && options) {
    return (
      <div className="form-group">
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={() => setIsTouched(true)}
          className={`form-select ${showValidationError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {showValidationError && (
          <p className="text-red-500 text-xs mt-1">{validationError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={isFocused && isMarksField && displayValue === "0" ? "" : displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`form-input ${showValidationError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''} ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        placeholder={getPlaceholder()}
        required={required}
        readOnly={readOnly}
        min={min}
        max={max}
        pattern={getInputPattern()}
        title={
          isMobileField ? "Please enter a valid 10-digit mobile number" :
          isPincodeField ? "Please enter a valid 6-digit pincode" :
          isEmailField ? "Please enter a valid email address" :
          isMarksField ? "Please enter marks between 0-100" :
          undefined
        }
      />
      {showValidationError && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <span className="mr-1">⚠️</span>
          {validationError}
        </p>
      )}
    </div>
  );
};

export default InputField;