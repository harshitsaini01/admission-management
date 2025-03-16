// src/components/Placeholder.tsx
import React from "react";

type PlaceholderProps = {
  type: "loading" | "error" | "success" | "empty";
  message?: string;
};

const Placeholder: React.FC<PlaceholderProps> = ({ type, message }) => {
  const defaultMessages = {
    loading: "Submitting...",
    error: message || "An error occurred",
    success: message || "Operation successful",
    empty: message || "No data found",
  };

  return (
    <div className={`p-4 rounded ${type === "error" ? "bg-red-100 text-red-700" : type === "success" ? "bg-green-100 text-green-700" : "text-gray-600"} border ${type === "error" ? "border-red-400" : type === "success" ? "border-green-400" : "border-gray-300"}`}>
      {defaultMessages[type]}
    </div>
  );
};

export default Placeholder;