import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

// Define the User type locally to include the token property
interface User {
  role: string;
  centerId?: string;
  token?: string;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  required?: boolean;
  min?: string;
}

const formFields: FormField[] = [
  {
    name: "name",
    label: "Center Name",
    type: "text",
    placeholder: "Enter center name",
    icon: BuildingOfficeIcon,
    required: true
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter email address",
    icon: EnvelopeIcon,
    required: true
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter secure password",
    icon: LockClosedIcon,
    required: true
  },
  {
    name: "contactNumber",
    label: "Contact Number",
    type: "tel",
    placeholder: "Enter contact number",
    icon: PhoneIcon,
    required: true
  },
  {
    name: "address",
    label: "Address",
    type: "text",
    placeholder: "Enter center address",
    icon: MapPinIcon,
    required: false
  },
  {
    name: "walletBalance",
    label: "Initial Wallet Balance (₹)",
    type: "number",
    placeholder: "Enter initial wallet balance",
    icon: CurrencyRupeeIcon,
    required: false,
    min: "0"
  }
];

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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = "Center name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }
    
    if (!formData.contactNumber.trim()) {
      errors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      errors.contactNumber = "Please enter a valid 10-digit contact number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to add a center");
      setError("You must be logged in to add a center");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const loadingToast = toast.loading('Creating center...');

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedCode(data.center.code);
      const successMessage = data.message || "Center added successfully";
      setSuccess(successMessage);
      setError(null);
      
      toast.dismiss(loadingToast);
      toast.success(`${successMessage}! Center Code: ${data.center.code}`);
      
      // Reset form
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
      setValidationErrors({});
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add center";
      setError(errorMessage);
      setSuccess(null);
      setGeneratedCode(null);
      
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      console.error("Error adding center:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "walletBalance" ? parseFloat(value) || 0 : value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const getFieldError = (fieldName: string) => validationErrors[fieldName];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Add New Center</h1>
          </div>
          <p className="text-gray-600 text-lg">Create a new admission center with admin access</p>
        </div>

        {/* Success Message with Generated Code */}
        {success && generatedCode && (
          <div className="mb-8 card animate-scale-in">
            <div className="card-body text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Center Created Successfully!</h3>
              <p className="text-gray-600 mb-4">{success}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">Generated Center Code:</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mt-2 tracking-wider">
                  {generatedCode}
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Please save this code securely. It will be used for center identification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="card animate-fade-in">
          <div className="card-header">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BuildingOfficeIcon className="w-6 h-6 mr-3 text-blue-600" />
              Center Information
            </h2>
            <p className="text-gray-600 mt-1">Fill in the details to create a new admission center</p>
          </div>

          <div className="card-body">
            {error && (
              <div className="alert alert-error mb-6">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formFields.map((field) => {
                const IconComponent = field.icon;
                const hasError = getFieldError(field.name);
                
                return (
                  <div key={field.name} className="form-group">
                    <label className="form-label flex items-center">
                      <IconComponent className="w-4 h-4 mr-2 text-gray-500" />
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={field.name === 'password' ? (showPassword ? 'text' : 'password') : field.type}
                        name={field.name}
                        value={formData[field.name as keyof typeof formData] as string}
                        onChange={handleChange}
                        className={`form-input ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                        placeholder={field.placeholder}
                        required={field.required}
                        min={field.min}
                      />
                      {field.name === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    {hasError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        {hasError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Permissions Section */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                Permissions & Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    name="subCenterAccess"
                    checked={formData.subCenterAccess}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Sub-Center Access</span>
                    <p className="text-xs text-gray-500">Allow this center to manage sub-centers</p>
                  </div>
                </label>
                <label className="flex items-center p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Active Status</span>
                    <p className="text-xs text-gray-500">Center will be active immediately after creation</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center p-6 bg-gray-50 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg min-w-48"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5" />
                  Creating Center...
                </>
              ) : (
                <>
                  <BuildingOfficeIcon className="w-5 h-5" />
                  Create Center
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="card-body text-center">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Automatic Code Generation</h3>
              <p className="text-sm text-gray-600">Each center gets a unique 4-digit code for identification</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <UserIcon className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Admin Access</h3>
              <p className="text-sm text-gray-600">Center admin can manage students and applications</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center">
              <CheckCircleIcon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Instant Activation</h3>
              <p className="text-sm text-gray-600">Centers are ready to use immediately after creation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCenter;