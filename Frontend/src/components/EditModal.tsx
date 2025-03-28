import React from "react";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  value: string;
  onChange: (value: string) => void;
  field?: string; // Add field prop to determine input type
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, value, onChange, field }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Field</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Conditionally render input based on field */}
        {field === "applicationStatus" ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Status
            </label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Payment Received">Payment Received</option>
              <option value="Enrolled">Enrolled</option>
            </select>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edit Value
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;