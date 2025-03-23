import React from "react";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  value: string;
  onChange: (value: string) => void;
};

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, value, onChange }) => {
  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
        <div
        className="bg-white p-6 rounded-xl shadow-2xl w-96 transform transition-all duration-300 scale-100 hover:scale-105"
        style={{ background: "rgba(255, 255, 255, 0.95)" }} // Slightly translucent white
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800 tracking-tight">Edit Field</h2>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-gray-50 text-gray-700 placeholder-gray-400"
          placeholder="Enter new value"
        />
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 hover:text-gray-800 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;