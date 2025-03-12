import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface FormData {
  name: string;
  email: string;
  code: string;
  subCenterAccess: boolean;
  status: boolean;
  contactNumber: string;
  wallet: string;
  password: string;
  university: string;
}

const AddCenter: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    code: "",
    subCenterAccess: false,
    status: false,
    contactNumber: "",
    wallet: "",
    password: "",
    university: "DU",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/centers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("✅ Center added successfully!");
        setFormData({ name: "", email: "", code: "", subCenterAccess: false, status: false, contactNumber: "", wallet: "", password: "", university: "DU" });
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "❌ Failed to submit the form.");
      }
    } catch (error) {
      setMessage("❌ An error occurred while submitting the form.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Register Center</h1>

        {/* Center Information */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Center Name*</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email*</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Center Code*</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
        </div>

        {/* Contact and Security */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number*</label>
            <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Wallet*</label>
            <input type="text" name="wallet" value={formData.wallet} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password*</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" required />
          </div>
        </div>

        {/* Boolean Select Fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub-Center Access*</label>
            <select name="subCenterAccess" value={formData.subCenterAccess.toString()} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status*</label>
            <select name="status" value={formData.status.toString()} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">University*</label>
            <select
              name="university"
              value={formData.university}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="DU">Delhi University (DU)</option>
              <option value="IIT">Indian Institute of Technology (IIT)</option>
              <option value="BHU">Banaras Hindu University (BHU)</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-4">
          <button type="submit" className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 disabled:opacity-50" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

        {/* Message Output */}
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </form>
    </div>
  );
};

export default AddCenter;
