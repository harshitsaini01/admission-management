import React, { useState } from "react";
import OfflinePaymentModal from "./OfflinePaymentModal";
import {
  CreditCardIcon,
  XMarkIcon,
  SparklesIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";

type RechargeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const RechargeModal: React.FC<RechargeModalProps> = ({ isOpen, onClose }) => {
  const [paymentType, setPaymentType] = useState("");
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  if (!isOpen) return null;

  const handlePaymentTypeChange = (value: string) => {
    setPaymentType(value);
  };

  const handleSubmit = () => {
    if (paymentType === "offline") {
      setIsOfflineModalOpen(true);
    } else {
      // Handle other payment types if needed
      onClose();
    }
  };

  const paymentOptions = [
    {
      id: "offline",
      title: "Offline Payment",
      description: "Bank transfer, UPI, or cash payment",
      icon: BanknotesIcon,
      color: "blue"
    }
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 relative z-10 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCardIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recharge Wallet</h2>
              <p className="text-sm text-gray-500">Add funds to your account</p>
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
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Choose Payment Method
              </label>
              <div className="space-y-3">
                {paymentOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <label
                      key={option.id}
                      className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 ${
                        paymentType === option.id
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        value={option.id}
                        checked={paymentType === option.id}
                        onChange={(e) => handlePaymentTypeChange(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-4 w-full">
                        <div className={`p-3 rounded-lg ${
                          paymentType === option.id 
                            ? "bg-blue-500 text-white" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{option.title}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          paymentType === option.id
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}>
                          {paymentType === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <SparklesIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Quick & Secure</p>
                  <p className="text-blue-700">
                    Your payment will be processed securely. You'll receive a confirmation once verified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
              paymentType
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!paymentType}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Offline Payment Modal */}
      <OfflinePaymentModal
        isOpen={isOfflineModalOpen}
        onClose={() => {
          setIsOfflineModalOpen(false);
          onClose(); // Close both modals after offline payment submission
        }}
      />
    </div>
  );
};

export default RechargeModal;