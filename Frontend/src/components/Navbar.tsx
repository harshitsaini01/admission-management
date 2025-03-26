import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { WalletIcon } from "@heroicons/react/24/outline"; // Wallet icon
import RechargeModal from "../wallet/RechargeModal"; 

const Navbar: React.FC = () => {
  const [selectedUniversity, setSelectedUniversity] = useState("Select University");
  const { user, logout } = useAuth();
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUniversity(e.target.value);
  };

  const handleDropdownSelect = (option: string) => {
    if (option === "Recharge") {
      setIsRechargeModalOpen(true);
    }
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-blue-500 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          {user?.role === "superadmin" ? "Super Admin" : user?.university || selectedUniversity}
        </div>
        <div className="flex items-center space-x-4">
          {/* Wallet Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-blue-600 py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              <WalletIcon className="w-5 h-5" />
              <span>Wallet</span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <button
                  onClick={() => handleDropdownSelect("Passport")}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Passport
                </button>
                <button
                  onClick={() => handleDropdownSelect("Recharge")}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Recharge
                </button>
              </div>
            )}
          </div>

          {user?.role === "superadmin" && (
            <select
              value={selectedUniversity}
              onChange={handleUniversityChange}
              className="bg-white text-gray-700 py-2 px-4 rounded"
            >
              <option value="Select University" disabled>
                Select University
              </option>
              <option value="DU">Delhi University (DU)</option>
              <option value="IIT">Indian Institute of Technology (IIT)</option>
              <option value="BHU">Banaras Hindu University (BHU)</option>
            </select>
          )}
          <button
            onClick={logout}
            className="bg-red-500 py-2 px-4 rounded hover:bg-red-600"
          >
            Logout
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