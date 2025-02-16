import { useState } from "react";

const Navbar: React.FC = () => {
  const [selectedUniversity, setSelectedUniversity] = useState("Select University");

  const handleUniversityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUniversity(e.target.value);
  };

  return (
    <nav className="bg-blue-500 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Side: Selected University Name */}
        <div className="text-xl font-bold">
          {selectedUniversity}
        </div>

        {/* Right Side: Dropdown Menu */}
        <div className="relative">
          <select
            value={selectedUniversity}
            onChange={handleUniversityChange}
            className="block appearance-none w-full bg-white text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value="Select University" disabled>
              Select University
            </option>
            <option value="Delhi University (DU)">Delhi University (DU)</option>
            <option value="Indian Institute of Technology (IIT)">Indian Institute of Technology (IIT)</option>
            <option value="Banaras Hindu University (BHU)">Banaras Hindu University (BHU)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;