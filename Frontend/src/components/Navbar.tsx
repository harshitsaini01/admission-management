import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const [selectedUniversity, setSelectedUniversity] = useState("Select University");
  const { user, logout } = useAuth();

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUniversity(e.target.value);
  };

  return (
    <nav className="bg-blue-500 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">{user?.role === "superadmin" ? "Super Admin" : user?.university || selectedUniversity}</div>
        <div className="flex items-center space-x-4">
          {user?.role === "superadmin" && (
            <select
              value={selectedUniversity}
              onChange={handleUniversityChange}
              className="bg-white text-gray-700 py-2 px-4 rounded"
            >
              <option value="Select University" disabled>Select University</option>
              <option value="DU">Delhi University (DU)</option>
              <option value="IIT">Indian Institute of Technology (IIT)</option>
              <option value="BHU">Banaras Hindu University (BHU)</option>
            </select>
          )}
          <button onClick={logout} className="bg-red-500 py-2 px-4 rounded hover:bg-red-600">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;