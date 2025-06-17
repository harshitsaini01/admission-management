import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import {
  XMarkIcon,
  CloudArrowUpIcon,
  CurrencyRupeeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhotoIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

type OfflinePaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

interface FormData {
  centerCode: string;
  centerName: string;
  beneficiary: string;
  paymentType: string;
  accountHolderName: string;
  amount: string;
  transactionId: string;
  transactionDate: string;
  paySlip: File | null;
}

interface Center {
  _id: string;
  code: string;
  name: string;
  university: string;
  walletBalance: number;
}

// Define the User type locally to include the token property
interface User {
  role: string;
  centerId?: string;
  token?: string;
}

const OfflinePaymentModal: React.FC<OfflinePaymentModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth() as { user: User | null };
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);

  const [formData, setFormData] = useState<FormData>({
    centerCode: "",
    centerName: "",
    beneficiary: "",
    paymentType: "",
    accountHolderName: "",
    amount: "",
    transactionId: "",
    transactionDate: "",
    paySlip: null,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Get today's date in YYYY-MM-DD format for max date validation
  const today = new Date().toISOString().split('T')[0];

  // Fetch centers for superadmin
  useEffect(() => {
    const fetchCenters = async () => {
      if (!isOpen || !user || user.role !== "superadmin") return;

      try {
        const response = await fetch(`${API_URL}/api/wallet/centers`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch centers");
        }

        const centersData = await response.json();
        setCenters(centersData);
      } catch (err) {
        console.error("Error fetching centers:", err);
        toast.error("Failed to load centers");
      }
    };

    fetchCenters();
  }, [isOpen, user]);

  // Prefill center data for admin
  useEffect(() => {
    const prefillCenterData = async () => {
      if (!isOpen || !user || user.role !== "admin") return;

      try {
        const response = await fetch(`${API_URL}/api/centers/${user.centerId}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch center data");
        }

        const centerData = await response.json();
        setFormData(prev => ({
          ...prev,
          centerCode: centerData.code,
          centerName: centerData.name
        }));
      } catch (err) {
        console.error("Error fetching center data:", err);
        toast.error("Failed to load center data");
      }
    };

    prefillCenterData();
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        centerCode: "",
        centerName: "",
        beneficiary: "",
        paymentType: "",
        accountHolderName: "",
        amount: "",
        transactionId: "",
        transactionDate: "",
        paySlip: null,
      });
      setErrorMessage(null);
      setSuccessMessage(null);
      setPreviewUrl(null);
      setCenters([]);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle center selection for superadmin
    if (name === "centerCode" && user?.role === "superadmin") {
      const selectedCenter = centers.find(center => center.code === value);
      if (selectedCenter) {
        setFormData(prev => ({ 
          ...prev, 
          centerCode: value,
          centerName: selectedCenter.name
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errorMessage) setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, paySlip: file }));
    
    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    
    // Clear error when user selects file
    if (errorMessage) setErrorMessage(null);
  };

  const validateForm = (): string | null => {
    if (!formData.centerCode) return "Please select a center";
    if (!formData.beneficiary) return "Please select a beneficiary";
    if (!formData.paymentType) return "Please select a payment type";
    if (!formData.amount || parseFloat(formData.amount) <= 0) return "Please enter a valid amount";
    if (!formData.transactionId.trim()) return "Please enter a transaction ID";
    if (!formData.transactionDate) return "Please select a transaction date";
    if (!formData.paySlip) return "Please upload a payment receipt";
    
    // Validate transaction date is not in the future
    const selectedDate = new Date(formData.transactionDate);
    const todayDate = new Date();
    todayDate.setHours(23, 59, 59, 999); // Set to end of today
    
    if (selectedDate > todayDate) {
      return "Transaction date cannot be in the future";
    }
    
    // Validate file type
    if (formData.paySlip && !formData.paySlip.type.startsWith('image/')) {
      return "Please upload an image file (JPG, PNG, etc.)";
    }
    
    // Validate file size (5MB max)
    if (formData.paySlip && formData.paySlip.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      toast.error(validationError);
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
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit recharge request");
      }

      setSuccessMessage("Recharge request submitted successfully!");
      toast.success("Recharge request submitted successfully!");
      
      setTimeout(() => {
        onClose();
        navigate("/offline-payments");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred.";
      setErrorMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 relative z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CurrencyRupeeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Offline Payment</h2>
              <p className="text-sm text-gray-500">Submit your payment details for verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Alert Messages */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-700">{errorMessage}</div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-700">{successMessage}</div>
              </div>
            )}

            {/* Payment Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                Payment Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Center Selection - Show for superadmin, prefilled for admin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Center <span className="text-red-500">*</span>
                  </label>
                  {user?.role === "superadmin" ? (
                    <select
                      name="centerCode"
                      value={formData.centerCode}
                      onChange={handleInputChange}
                      className="form-select w-full"
                      required
                    >
                      <option value="">Select Center</option>
                      {centers.map(center => (
                        <option key={center._id} value={center.code}>
                          {center.code} - {center.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={`${formData.centerCode} - ${formData.centerName}`}
                      className="form-input w-full bg-gray-50"
                      disabled
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beneficiary <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="beneficiary"
                    value={formData.beneficiary}
                    onChange={handleInputChange}
                    className="form-select w-full"
                    required
                  >
                    <option value="">Select Beneficiary</option>
                    <option value="Private">Private</option>
                    <option value="University">University</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                    className="form-select w-full"
                    required
                  >
                    <option value="">Select Payment Type</option>
                    <option value="UPI">UPI</option>
                    <option value="Online">Online Banking</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="Enter account holder name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="form-input w-full pl-8"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="Enter transaction/reference ID"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDaysIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="transactionDate"
                      value={formData.transactionDate}
                      onChange={handleInputChange}
                      max={today}
                      className="form-input w-full pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Date cannot be in the future</p>
                </div>

                <div>
                  {/* Empty div for grid alignment */}
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <PhotoIcon className="w-5 h-5 mr-2 text-blue-600" />
                Payment Receipt
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Payment Slip <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    name="paySlip"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="paySlip"
                    required
                  />
                  <label htmlFor="paySlip" className="cursor-pointer">
                    {previewUrl ? (
                      <div className="space-y-3">
                        <img
                          src={previewUrl}
                          alt="Payment slip preview"
                          className="max-w-full h-32 object-contain mx-auto rounded-lg border border-gray-200"
                        />
                        <p className="text-sm text-green-600 font-medium">File uploaded successfully</p>
                        <p className="text-xs text-gray-500">Click to change file</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Click to upload payment receipt</p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-2">Important Information:</p>
                  <ul className="text-blue-700 space-y-1 text-xs">
                    <li>• Ensure all details match your payment receipt</li>
                    <li>• Transaction date cannot be in the future</li>
                    <li>• Upload a clear image of your payment receipt</li>
                    <li>• Your request will be verified within 24-48 hours</li>
                    <li>• You'll receive a confirmation once approved</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CloudArrowUpIcon className="w-4 h-4" />
                  <span>Submit Payment</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfflinePaymentModal;