import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-screen w-52 bg-white text-gray-600 p-4">
      <div className="relative">
        <div className="flex items-center space-x-4 mb-6 cursor-pointer" onClick={toggleDropdown}>
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm text-white">SP</span>
          </div>
          <div className="flex items-center">
            <div className="font-bold">{user?.role === "superadmin" ? "Surya Pal" : "Admin"}</div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {isDropdownOpen && (
          <div className="absolute left-12 w-42 bg-white text-gray-800 rounded-lg shadow-lg z-10" ref={dropdownRef}>
            <ul className="divide-y divide-gray-300">
              <li>
                <a href="/myprofile" className="block px-4 py-2 hover:bg-blue-600 hover:text-white rounded-t-lg">My Profile</a>
              </li>
              <li>
                <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white rounded-b-lg">Logout</button>
              </li>
            </ul>
          </div>
        )}
      </div>
      <div className="my-4 border-t border-gray-700"></div>
      <div className="mb-6">
        <div className="text-xs font-bold mb-2">NAVIGATION</div>
        <ul className="space-y-2">
          <li><a href="#" className="block p-2 hover:bg-gray-100 rounded">Dashboard</a></li>
        </ul>
      </div>
      {user?.role === "superadmin" && (
        <>
          <div className="my-4 border-t border-gray-500"></div>
          <div className="mb-6">
            <div className="text-xs font-bold mb-2">USERS</div>
            <ul className="space-y-2">
              <li><Link to="/centers" className="block p-2 hover:bg-gray-100 rounded">Center</Link></li>
              <li><Link to="/add-center" className="block p-2 hover:bg-gray-100 rounded">Add Center</Link></li>
            </ul>
          </div>
        </>
      )}
      <div className="my-4 border-t border-gray-500"></div>
      <div className="mb-6">
        <div className="text-xs font-bold mb-2">STUDENTS</div>
        <ul className="space-y-2">
          <li><Link to="/students" className="block p-2 hover:bg-gray-100 rounded">Students</Link></li>
          <li><Link to="/student-application-foam" className="block p-2 hover:bg-gray-100 rounded">Apply Fresh</Link></li>
          <li><a href="#" className="block p-2 hover:bg-gray-100 rounded">Exams</a></li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;