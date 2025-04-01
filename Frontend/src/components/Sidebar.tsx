import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [centerName, setCenterName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

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
        } catch (error: any) {
          console.error("Error fetching center name:", error.message);
          setCenterName(null);
        }
      }
    };
    fetchCenterName();
  }, [user]);

  return (
    <div className="h-screen w-52 bg-gradient-to-b from-black to-gray-900 text-white p-4 overflow-y-scroll text-sm shadow-lg animate-slide-in custom-scrollbar">
      <div className="relative">
        <div className="flex items-center space-x-4 mb-6 cursor-pointer group" onClick={toggleDropdown}>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
            <span className="text-sm text-gray-900 font-bold">
              {user?.role === "superadmin" ? "SA" : centerName?.charAt(0) || "A"}
            </span>
          </div>
          <div className="flex items-center">
            <div className="font-bold transition-colors group-hover:text-gray-300">
              {user?.role === "superadmin" ? "Super Admin" : centerName || "Admin"}
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ml-4 text-gray-300 transform transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {isDropdownOpen && (
          <div
            className="absolute left-12 w-42 bg-gray-800 text-white rounded-lg shadow-xl z-10 animate-dropdown"
            ref={dropdownRef}
          >
            <ul className="divide-y divide-gray-700">
              {/* <li>
                <a
                  href="/myprofile"
                  className="block px-4 py-2 hover:bg-gray-700 hover:text-gray-200 rounded-t-lg transition-colors duration-200"
                >
                  My Profile
                </a>
              </li> */}
              <li>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-700 hover:text-gray-200 rounded-b-lg transition-colors duration-200"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
      <div className="my-4 border-t border-gray-700"></div>
      <div className="mb-6">
        <div className="text-xs font-bold mb-2 text-gray-400">NAVIGATION</div>
        <ul className="space-y-2">
          <li>
            <a
              href="/"
              className="flex items-center p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </a>
          </li>
        </ul>
      </div>
      <div className="my-4 border-t border-gray-700"></div>
      <div className="mb-6">
        <div className="text-xs font-bold mb-2 text-gray-400">USERS</div>
        <ul className="space-y-2">
          <li>
            <Link
              to="/centers"
              className="flex items-center p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4"
                />
              </svg>
              Center
            </Link>
          </li>
          {user?.role === "superadmin" && (
            <li>
              <Link
                to="/add-center"
                className="flex items-center p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Center
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className="my-4 border-t border-gray-700"></div>
      <div className="mb-6">
        <div
          className="flex items-center justify-between cursor-pointer group"
          onClick={toggleStudents}
        >
          <div className="text-xs font-bold mb-2 text-gray-400 group-hover:text-gray-200 transition-colors duration-200">
            STUDENTS
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 group-hover:text-gray-200 ${isStudentsOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {isStudentsOpen && (
          <ul className="space-y-2 mt-2 animate-dropdown">
            <li>
              <Link
                to="/student-application-foam"
                className="flex items-center p-2 pl-6 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Apply Fresh
              </Link>
            </li>
            <li>
              <Link
                to="/students"
                className="flex items-center p-2 pl-6 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Show Students
              </Link>
            </li>
          </ul>
        )}
        <ul className="space-y-2 mt-2">
          <li>
            <a
              href="#"
              className="flex items-center p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01"
                />
              </svg>
              Exams
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-md"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m-12 1h12m-4 4H8m4 4l4-4m-4 4l-4-4"
                />
              </svg>
              Re Reg
            </a>
          </li>
        </ul>
      </div>
      <div className="my-4 border-t border-gray-700"></div>
      <div className="mb-6">
        <div
          className="flex items-center justify-between cursor-pointer group"
          onClick={togglePayments}
        >
          <div className="text-xs font-bold mb-2 text-gray-400 group-hover:text-gray-200 transition-colors duration-200">
            PAYMENTS
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 group-hover:text-gray-200 ${isPaymentsOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {isPaymentsOpen && (
          <ul className="space-y-2 mt-2 mb-20 animate-dropdown">
            <li>
              <Link
                to="#"
                className="flex items-center p-2 pl-6 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Online
              </Link>
            </li>
            <li>
              <Link
                to="/offline-payments"
                className="flex items-center p-2 pl-6 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Offline
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;