import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';
import {
  EnvelopeIcon,
  KeyIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

type Step = "email" | "otp" | "password" | "success";

interface ResetData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
  userType?: "superadmin" | "center";
  resetToken?: string;
}

const ForgotPassword: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetData, setResetData] = useState<ResetData>({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetData.email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetData(prev => ({ ...prev, userType: data.userType }));
        setCurrentStep("otp");
        toast.success("OTP sent to your email address!");
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetData.otp || resetData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: resetData.email, 
          otp: resetData.otp 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetData(prev => ({ ...prev, resetToken: data.resetToken }));
        setCurrentStep("password");
        toast.success("OTP verified successfully!");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetData.newPassword || resetData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetData.email,
          otp: resetData.otp,
          newPassword: resetData.newPassword,
          resetToken: resetData.resetToken
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep("success");
        toast.success("Password reset successfully!");
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetData.email }),
      });

      if (response.ok) {
        toast.success("New OTP sent to your email!");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <EnvelopeIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-gray-600">Enter your email address and we'll send you an OTP to reset your password.</p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={resetData.email}
              onChange={(e) => setResetData(prev => ({ ...prev, email: e.target.value }))}
              className="form-input pl-10 w-full"
              placeholder="Enter your email address"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </div>
  );

  const renderOTPStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <KeyIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter OTP</h2>
        <p className="text-gray-600">We've sent a 6-digit OTP to <strong>{resetData.email}</strong></p>
      </div>

      <form onSubmit={handleOTPSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">OTP Code</label>
          <input
            type="text"
            value={resetData.otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setResetData(prev => ({ ...prev, otp: value }));
            }}
            className="form-input w-full text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={6}
            required
          />
          <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your email</p>
        </div>

        <button
          type="submit"
          disabled={loading || resetData.otp.length !== 6}
          className="btn btn-primary w-full"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={loading}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Didn't receive OTP? Resend
          </button>
        </div>
      </form>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <LockClosedIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h2>
        <p className="text-gray-600">Create a strong password for your account</p>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={resetData.newPassword}
              onChange={(e) => setResetData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="form-input pl-10 pr-10 w-full"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={resetData.confirmPassword}
              onChange={(e) => setResetData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="form-input pl-10 pr-10 w-full"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {resetData.newPassword && resetData.confirmPassword && resetData.newPassword !== resetData.confirmPassword && (
          <div className="flex items-center text-red-600 text-sm">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
            Passwords do not match
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !resetData.newPassword || !resetData.confirmPassword || resetData.newPassword !== resetData.confirmPassword}
          className="btn btn-primary w-full"
        >
          {loading ? "Resetting Password..." : "Reset Password"}
        </button>
      </form>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto" />
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
        <p className="text-gray-600 mb-4">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">
            <strong>Account Type:</strong> {resetData.userType === "superadmin" ? "Super Administrator" : "Center Admin"}
          </p>
          <p className="text-green-800 text-sm">
            <strong>Email:</strong> {resetData.email}
          </p>
        </div>
      </div>
      
      <Link to="/login" className="btn btn-primary w-full">
        Go to Login
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Back Button */}
        {currentStep !== "success" && (
          <div className="mb-6">
            {currentStep === "email" ? (
              <Link to="/login" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (currentStep === "otp") setCurrentStep("email");
                  else if (currentStep === "password") setCurrentStep("otp");
                }}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
          </div>
        )}

        {/* Progress Indicator */}
        {currentStep !== "success" && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "email" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                ["otp", "password"].includes(currentStep) ? "bg-green-600" : "bg-gray-200"
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "otp" ? "bg-blue-600 text-white" : 
                currentStep === "password" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                2
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                currentStep === "password" ? "bg-green-600" : "bg-gray-200"
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "password" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                3
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Email</span>
              <span>OTP</span>
              <span>Password</span>
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === "email" && renderEmailStep()}
        {currentStep === "otp" && renderOTPStep()}
        {currentStep === "password" && renderPasswordStep()}
        {currentStep === "success" && renderSuccessStep()}
      </div>
    </div>
  );
};

export default ForgotPassword; 