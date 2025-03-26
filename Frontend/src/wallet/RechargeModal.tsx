import React, { useState } from "react";
import OfflinePaymentModal from "./OfflinePaymentModal";

type RechargeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const RechargeModal: React.FC<RechargeModalProps> = ({ isOpen, onClose }) => {
  const [paymentType, setPaymentType] = useState("");
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  if (!isOpen) return null;

  const handlePaymentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"></div>

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recharge Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type of Payment*
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="offline"
                  checked={paymentType === "offline"}
                  onChange={handlePaymentTypeChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-600">Offline Payment</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            disabled={!paymentType}
          >
            Submit
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