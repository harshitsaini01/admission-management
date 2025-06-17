import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  WalletIcon, 
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  CreditCardIcon,
  DocumentTextIcon,
  SparklesIcon,
  Bars3Icon,
  XMarkIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import RechargeModal from "../wallet/RechargeModal"; 

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [centerName, setCenterName] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch center name for admin users (same logic as sidebar)
  useEffect(() => {
    const fetchCenterName = async () => {
      if (user?.role === "admin" && user?.centerId) {
        try {
          const response = await fetch(`${API_URL}/api/centers/${user.centerId}`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }

          const center = await response.json();
          setCenterName(center.name);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Error fetching center name:", errorMessage);
          setCenterName(null);
        }
      }
    };
    fetchCenterName();
  }, [user, API_URL]);

  const handleWalletDropdownSelect = (option: string) => {
    if (option === "Recharge") {
      setIsRechargeModalOpen(true);
    } else if (option === "Passbook") {
      window.location.href = "/passbook";
    }
    setIsWalletDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  const getUserDisplayName = () => {
    if (user?.role === "superadmin") {
      return "Super Admin";
    } else if (user?.role === "admin") {
      return centerName || "Admin";
    }
    return "User";
  };

  const getUserRole = () => {
    if (user?.role === "superadmin") {
      return "System Administrator";
    } else if (user?.role === "admin") {
      return "Center Administrator";
    }
    return "User";
  };

  const getUserInitials = () => {
    if (user?.role === "superadmin") {
      return "SA";
    } else if (user?.role === "admin") {
      return centerName?.charAt(0) || "A";
    }
    return "U";
  };

  const getUserAvatarGradient = () => {
    if (user?.role === "superadmin") {
      return "from-purple-500 to-purple-700";
    } else if (user?.role === "admin") {
      return "from-blue-500 to-blue-700";
    }
    return "from-gray-400 to-gray-600";
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Tamanna Educations
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Admission Management System</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Wallet Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                  <WalletIcon className="w-5 h-5" />
                  <span className="font-medium">Wallet</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fadeInScale">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                        Wallet Options
                      </div>
                      <button
                        onClick={() => handleWalletDropdownSelect("Passbook")}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                      >
                        <DocumentTextIcon className="w-4 h-4 mr-3 text-gray-400" />
                        View Passbook
                      </button>
                      <button
                        onClick={() => handleWalletDropdownSelect("Recharge")}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                      >
                        <CreditCardIcon className="w-4 h-4 mr-3 text-gray-400" />
                        Recharge Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm border border-gray-200"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${getUserAvatarGradient()} rounded-full flex items-center justify-center shadow-md`}>
                    <span className="text-sm font-bold text-white">{getUserInitials()}</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 flex items-center">
                      {getUserDisplayName()}
                      {user?.role === "superadmin" && (
                        <ShieldCheckIcon className="w-4 h-4 ml-1 text-purple-600" />
                      )}
                      {user?.role === "admin" && (
                        <BuildingOfficeIcon className="w-4 h-4 ml-1 text-blue-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                      {getUserRole()}
                    </div>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fadeInScale">
                    <div className="py-2">
                      <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${getUserAvatarGradient()} rounded-full flex items-center justify-center shadow-md`}>
                            <span className="text-lg font-bold text-white">{getUserInitials()}</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 flex items-center">
                              {getUserDisplayName()}
                              {user?.role === "superadmin" && (
                                <ShieldCheckIcon className="w-4 h-4 ml-1 text-purple-600" />
                              )}
                              {user?.role === "admin" && (
                                <BuildingOfficeIcon className="w-4 h-4 ml-1 text-blue-600" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                              Online • {getUserRole()}
                            </div>
                            {user?.role === "admin" && centerName && (
                              <div className="text-xs text-blue-600 font-medium mt-1">
                                {centerName}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button & User Info */}
            <div className="md:hidden flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</div>
                <div className="text-xs text-gray-500 flex items-center justify-end">
                  <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                  Online
                </div>
              </div>
              <div className={`w-10 h-10 bg-gradient-to-br ${getUserAvatarGradient()} rounded-full flex items-center justify-center shadow-md`}>
                <span className="text-sm font-bold text-white">{getUserInitials()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              {/* User Info Section */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getUserAvatarGradient()} rounded-full flex items-center justify-center shadow-md`}>
                    <span className="text-lg font-bold text-white">{getUserInitials()}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 flex items-center">
                      {getUserDisplayName()}
                      {user?.role === "superadmin" && (
                        <ShieldCheckIcon className="w-4 h-4 ml-1 text-purple-600" />
                      )}
                      {user?.role === "admin" && (
                        <BuildingOfficeIcon className="w-4 h-4 ml-1 text-blue-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                      Online • {getUserRole()}
                    </div>
                    {user?.role === "admin" && centerName && (
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        {centerName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Wallet Section */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Wallet</div>
                <button
                  onClick={() => {
                    handleWalletDropdownSelect("Passbook");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-150 border border-gray-200"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-3 text-gray-400" />
                  View Passbook
                </button>
                <button
                  onClick={() => {
                    handleWalletDropdownSelect("Recharge");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors duration-150 border border-gray-200"
                >
                  <CreditCardIcon className="w-5 h-5 mr-3 text-gray-400" />
                  Recharge Wallet
                </button>
              </div>
              
              {/* Logout Section */}
              <div className="border-t border-gray-200 pt-3">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 border border-red-200"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for dropdowns */}
      {(isWalletDropdownOpen || isUserDropdownOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setIsWalletDropdownOpen(false);
            setIsUserDropdownOpen(false);
          }}
        ></div>
      )}

      {/* Recharge Modal */}
      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
      />
    </>
  );
};

export default Navbar;