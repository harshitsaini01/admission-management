import React from "react";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  value: string;
  onChange: (value: string) => void;
  isDropdown?: boolean;
  dropdownOptions?: string[];
};

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  value,
  onChange,
  isDropdown = false,
  dropdownOptions = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Edit Field</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        <div className="mb-4">
          {isDropdown ? (
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {dropdownOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;