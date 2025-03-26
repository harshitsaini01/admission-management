import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

type OfflinePaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const OfflinePaymentModal: React.FC<OfflinePaymentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    centerCode: "",
    centerName: "",
    beneficiary: "",
    paymentType: "",
    accountHolderName: "",
    amount: "",
    transactionId: "",
    transactionDate: "",
    paySlip: null as File | null,
    addedOn: new Date().toISOString(),
    status: "Pending" as "Pending" | "Approved" | "Rejected",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (user?.role === "admin" && user?.centerId) {
      fetchCenterDetails(user.centerId);
    }
  }, [user]);

  const fetchCenterDetails = async (centerId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/centers/${centerId}`, {
        method: "GET",
        credentials: "include", // Sends the cookie
      });
      if (!response.ok) {
        throw new Error("Failed to fetch center details");
      }
      const centerData = await response.json();
      setFormData((prev) => ({
        ...prev,
        centerCode: centerData.code || "N/A",
        centerName: centerData.name || "Unknown Center",
      }));
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load center details.");
      setFormData((prev) => ({
        ...prev,
        centerCode: "N/A",
        centerName: "Unknown Center",
      }));
    }
  };

  const handleCenterCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setFormData((prev) => ({ ...prev, centerCode: code }));

    if (code.length === 4 && user?.role === "superadmin") {
      try {
        const response = await fetch(`${API_URL}/api/centers/code/${code}`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Invalid center code");
        }
        const centerData = await response.json();
        setFormData((prev) => ({ ...prev, centerName: centerData.name }));
        setErrorMessage(null);
      } catch (err: any) {
        setFormData((prev) => ({ ...prev, centerName: "" }));
        setErrorMessage(err.message || "Invalid center code.");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, paySlip: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paySlip) {
      setErrorMessage("Please upload a pay slip image.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "paySlip" && value) {
        formDataToSend.append(key, value as File);
      } else if (value) {
        formDataToSend.append(key, value.toString());
      }
    });

    try {
      const response = await fetch(`${API_URL}/api/wallet/recharge`, {
        method: "POST",
        body: formDataToSend,
        credentials: "include", // Sends the cookie
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit recharge request");
      }

      setSuccessMessage("Recharge request submitted successfully!");
      setTimeout(() => {
        onClose();
        navigate("/offline-payments");
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recharge Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg text-center">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Center*</label>
              <input
                type="text"
                name="centerCode"
                value={formData.centerCode}
                onChange={handleCenterCodeChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
                placeholder="Enter center code"
                readOnly={user?.role === "admin"}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Center Name*</label>
              <input
                type="text"
                name="centerName"
                value={formData.centerName}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
                placeholder="Center name will appear here"
                readOnly
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Beneficiary*</label>
              <select
                name="beneficiary"
                value={formData.beneficiary}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
                required
              >
                <option value="">Select Beneficiary</option>
                <option value="Private">Private</option>
                <option value="University">University</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type of Payment*</label>
              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
                required
              >
                <option value="">Select Payment Type</option>
                <option value="UPI">UPI</option>
                <option value="Online">Online</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
                placeholder="Account Holder Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount (₹)*</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
                placeholder="₹"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction ID*</label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
                placeholder="Transaction ID"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Txn. Date*</label>
              <input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pay Slip (Image Only)*</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-black"
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded transition-colors duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfflinePaymentModal;