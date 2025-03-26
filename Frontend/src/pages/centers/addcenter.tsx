import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const AddCenter: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    walletBalance: 0, // Changed to walletBalance (number)
    subCenterAccess: false,
    status: true,
  });
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to add a center");
      console.log("No user found in AuthContext");
      return;
    }

    console.log("Sending POST request with user:", user);
    try {
      const response = await fetch(`${API_URL}/api/centers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`, // Added Authorization header
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedCode(data.center.code);
      setSuccess(data.message || "Center added successfully");
      setError(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        contactNumber: "",
        walletBalance: 0, // Reset to 0
        subCenterAccess: false,
        status: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to add center");
      setSuccess(null);
      setGeneratedCode(null);
      console.error("Error adding center:", err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "walletBalance" ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add New Center</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
            {success}
            {generatedCode && (
              <p className="mt-2">Generated Center Code: <strong>{generatedCode}</strong></p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter center name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter contact number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Balance (₹)</label>
              <input
                type="number"
                name="walletBalance"
                value={formData.walletBalance}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter initial wallet balance"
                min="0"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-6">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="subCenterAccess"
                checked={formData.subCenterAccess}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2">Sub-Center Access</span>
            </label>
            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2">Active Status</span>
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Add Center
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCenter;