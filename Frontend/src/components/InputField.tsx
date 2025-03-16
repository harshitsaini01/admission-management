// src/components/InputField.tsx
import React from "react";

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: "text" | "select" | "date" | "email" | "tel";
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  options,
  placeholder,
  required = false,
  readOnly = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}{required && "*"}</label>
    {type === "select" ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        required={required}
      >
        <option value="">{placeholder || "Choose"}</option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
      />
    )}
  </div>
);

export default InputField;