import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CreditCardIcon,
  PlusIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  UserIcon
} from "@heroicons/react/24/outline";

const Sidebar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [centerName, setCenterName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const togglePayments = () => setIsPaymentsOpen(!isPaymentsOpen);
  const toggleStudents = () => setIsStudentsOpen(!isStudentsOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ 
    to, 
    icon: Icon, 
    children, 
    onClick,
    comingSoon = false
  }: { 
    to?: string; 
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; 
    children: React.ReactNode; 
    onClick?: () => void;
    comingSoon?: boolean;
  }) => {
    const baseClasses = "flex items-center p-3 rounded-lg transition-all duration-200 group relative";
    const activeClasses = "bg-blue-600 text-white shadow-lg";
    const inactiveClasses = "text-gray-300 hover:bg-gray-800 hover:text-white";
    const comingSoonClasses = "text-gray-500 cursor-not-allowed opacity-60";
    
    const content = (
      <>
        <Icon className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
        <span className="font-medium">{children}</span>
        {comingSoon && (
          <span className="ml-auto text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full">
            Soon
          </span>
        )}
      </>
    );

    if (to && !comingSoon) {
      return (
        <Link
          to={to}
          className={`${baseClasses} ${isActive(to) ? activeClasses : inactiveClasses}`}
        >
          {content}
        </Link>
      );
    }

    return (
      <div
        className={`${baseClasses} ${comingSoon ? comingSoonClasses : inactiveClasses}`}
        onClick={!comingSoon ? onClick : undefined}
      >
        {content}
      </div>
    );
  };

  const DropdownSection = ({ 
    title, 
    isOpen, 
    onToggle, 
    children 
  }: { 
    title: string; 
    isOpen: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
  }) => (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-2 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>
      <div className={`mt-2 space-y-1 overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}>
        {children}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-64 sidebar-gradient text-white p-6 overflow-y-auto custom-scrollbar shadow-2xl">
      {/* User Profile Section */}
      <div className="relative mb-8">
        <div 
          className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl cursor-pointer group transition-all duration-200 hover:bg-white/20" 
          onClick={toggleDropdown}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold text-white">
              {user?.role === "superadmin" ? "SA" : centerName?.charAt(0) || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white truncate">
              {user?.role === "superadmin" ? "Super Admin" : centerName || "Admin"}
            </div>
            <div className="text-xs text-gray-300 flex items-center">
              <CheckCircleIcon className="w-3 h-3 mr-1" />
              Online
            </div>
          </div>
          <ChevronDownIcon 
            className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${
              isDropdownOpen ? "rotate-180" : ""
            }`} 
          />
        </div>
        
        {isDropdownOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-xl z-50 animate-dropdown"
            ref={dropdownRef}
          >
            <div className="p-2">
              <button
                onClick={logout}
                className="flex items-center w-full p-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-6">
        {/* Main Navigation */}
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Main Menu
          </div>
          <div className="space-y-1">
            <NavItem to="/" icon={HomeIcon}>
              Dashboard
            </NavItem>
          </div>
        </div>

        {/* Centers Management */}
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Centers
          </div>
          <div className="space-y-1">
            <NavItem to="/centers" icon={BuildingOfficeIcon}>
              All Centers
            </NavItem>
            {user?.role === "superadmin" && (
              <NavItem to="/add-center" icon={PlusIcon}>
                Add Center
              </NavItem>
            )}
          </div>
        </div>

        {/* Students Management */}
        <DropdownSection 
          title="Students" 
          isOpen={isStudentsOpen} 
          onToggle={toggleStudents}
        >
          <NavItem to="/students" icon={UserGroupIcon}>
            All Students
          </NavItem>
          <NavItem to="/student-application-foam" icon={DocumentTextIcon}>
            New Application
          </NavItem>
          <NavItem to="/re-registration" icon={ArrowPathIcon}>
            Re Registration
          </NavItem>
          <NavItem to="#" icon={ClipboardDocumentListIcon} comingSoon>
            Exams
          </NavItem>
        </DropdownSection>

        {/* Payments */}
        <DropdownSection 
          title="Payments" 
          isOpen={isPaymentsOpen} 
          onToggle={togglePayments}
        >
          <NavItem to="/offline-payments" icon={CreditCardIcon}>
            Offline Payments
          </NavItem>
          <NavItem to="#" icon={GlobeAltIcon} comingSoon>
            Online Payments
          </NavItem>
        </DropdownSection>

        {/* Sub-Counsellor Section */}
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Staff Management
          </div>
          <div className="space-y-1">
            <NavItem to="#" icon={UserIcon} comingSoon>
              Sub-Counsellor
            </NavItem>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          <p>Admission Management</p>
          <p className="mt-1">v2.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;