import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { WalletIcon } from "@heroicons/react/24/outline";
import RechargeModal from "../wallet/RechargeModal"; 

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownSelect = (option: string) => {
    if (option === "Recharge") {
      setIsRechargeModalOpen(true);
    }
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-black to-gray-900 p-4 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-extrabold tracking-tight transition-transform duration-300 hover:scale-105">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white">
            Tamanna Educations
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {/* Wallet Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 py-2 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <WalletIcon className="w-5 h-5 transform transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-medium">Wallet</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl z-10 animate-dropdown">
                <button
                  onClick={() => handleDropdownSelect("Passbook")}
                  className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-t-lg"
                >
                  Passbook
                </button>
                <button
                  onClick={() => handleDropdownSelect("Recharge")}
                  className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white transition-colors duration-200 rounded-b-lg"
                >
                  Recharge
                </button>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="bg-gradient-to-r from-red-500 to-red-600 py-2 px-4 rounded-lg shadow-md hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;