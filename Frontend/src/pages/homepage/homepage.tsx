import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen"> {/* Main container with flex-col */}
      
        <div className="flex-1 bg-gray-100 flex items-center justify-center"> {/* Content area */}
          <div className="max-w-3xl mx-auto p-8"> {/* Added container for content */}
            <h1 className="text-4xl font-bold mb-6">Welcome to the Admission Portal</h1>
            <Link
              to="/student-application-foam"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Go to Admission Form
            </Link>
          </div>
        </div>
      
    </div>
  );
};

export default HomePage;