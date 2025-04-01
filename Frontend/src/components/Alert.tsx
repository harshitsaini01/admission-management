import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

// Define the types for the alert and confirm dialogs
type AlertType = "alert" | "confirm";

interface AlertOptions {
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
}

// Create a context for managing alerts
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Alert Provider to manage the state of alerts
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<(value: boolean) => void>(() => () => {});

  const showAlert = useCallback((message: string) => {
    setAlert({ message, type: "alert" });
  }, []);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlert({ message, type: "confirm" });
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleClose = () => {
    setAlert(null);
    if (alert?.type === "confirm") {
      resolvePromise(false);
      alert?.onCancel?.();
    }
  };

  const handleConfirm = () => {
    setAlert(null);
    if (alert?.type === "confirm") {
      resolvePromise(true);
      alert?.onConfirm?.();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alert && (
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-transperent bg-opacity-75 backdrop-blur-sm transition-opacity duration-300"
              onClick={handleClose}
            ></div>

            {/* Alert Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-95 opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]">
              {/* Gradient Border Accent */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 pointer-events-none"></div>

              {/* Content */}
              <div className="relative z-10">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                  {alert.type === "confirm" ? "Confirmation" : "Alert"}
                </h2>
                <p className="text-[13px] text-gray-600 text-center mb-6">{alert.message}</p>

                {/* Buttons */}
                <div className="flex justify-center gap-3">
                  {alert.type === "confirm" ? (
                    <>
                      <button
                        onClick={handleClose}
                        className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 text-[12px] font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirm}
                        className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 text-[12px] font-medium"
                      >
                        Confirm
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleClose}
                      className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 text-[12px] font-medium"
                    >
                      OK
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </AlertContext.Provider>
  );
};

// Hook to use the alert context
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

// Export the original functions for backward compatibility
export const showAlert = (message: string) => {
  const { showAlert: triggerAlert } = useAlert();
  triggerAlert(message);
};

export const showConfirm = (message: string): Promise<boolean> => {
  const { showConfirm: triggerConfirm } = useAlert();
  return triggerConfirm(message);
};