import React, { useState } from "react";

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
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (optionValue: string) => {
    const syntheticEvent = {
      target: { name, value: optionValue },
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && "*"}
      </label>
      {type === "select" ? (
        <div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-left bg-white flex justify-between items-center"
          >
            <span>{value || placeholder || "Choose"}</span>
            <svg
              className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-46 overflow-y-auto">
              {options?.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleOptionClick(opt.value)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            readOnly ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};

export default InputField;