// src/components/FileUpload.tsx
import React from "react";

type FileUploadProps = {
  label: string;
  name: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

const FileUpload: React.FC<FileUploadProps> = ({ label, name, file, onChange, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">{label}{required && "*"}</label>
    <div className="mt-1 flex items-center">
      <input
        type="file"
        name={name}
        onChange={onChange}
        className="hidden"
        id={`${name}Input`}
        required={required}
      />
      <label
        htmlFor={`${name}Input`}
        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
      >
        Choose File
      </label>
      <span className="text-sm text-gray-500">{file ? file.name : "No file chosen"}</span>
    </div>
  </div>
);

export default FileUpload;
