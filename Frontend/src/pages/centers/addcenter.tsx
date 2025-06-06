import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

// Define the User type locally to include the token property
interface User {
  role: string;
  centerId?: string;
  token?: string;
}

const AddCenter: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    address: "",
    walletBalance: 0,
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
          "Authorization": `Bearer ${user.token}`,
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
        address: "",
        walletBalance: 0,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-blue-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg w-full transform transition-all duration-500 hover:shadow-xl">
        <h1 className="text-xl font-semibold text-gray-800 mb-6 text-center">Add New Center</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-600 rounded-lg text-sm">
            {success}
            {generatedCode && (
              <p className="mt-1 text-xs">
                Generated Center Code: <strong>{generatedCode}</strong>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs bg-gray-50 transition-all duration-200"
                placeholder="Enter center name"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs bg-gray-50 transition-all duration-200"
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs bg-gray-50 transition-all duration-200"
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs bg-gray-50 transition-all duration-200"
                placeholder="Enter contact number"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs bg-gray-50 transition-all duration-200"
                placeholder="Enter center address"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-1">Wallet Balance (₹)</label>
              <input
                type="number"
                name="walletBalance"
                value={formData.walletBalance}
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-xs bg-gray-50 transition-all duration-200"
                placeholder="Enter initial wallet balance"
                min="0"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-6">
            <label className="flex items-center text-[11px] font-medium text-gray-600">
              <input
                type="checkbox"
                name="subCenterAccess"
                checked={formData.subCenterAccess}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400 transition-all duration-200"
              />
              <span className="ml-2">Sub-Center Access</span>
            </label>
            <label className="flex items-center text-[11px] font-medium text-gray-600">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400 transition-all duration-200"
              />
              <span className="ml-2">Active Status</span>
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-sm font-semibold"
          >
            Add Center
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCenter;