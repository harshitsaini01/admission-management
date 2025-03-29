

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaTrash } from "react-icons/fa";

type CenterData = {
  _id: string;
  name: string;
  email: string;
  code: string;
  password: string;
  subCenterAccess: boolean;
  contactNumber: string;
  walletBalance: number;
  status: boolean;
  address: string;
};

const Allcenters: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [centers, setCenters] = useState<CenterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCenters = async () => {
      if (!user) {
        await checkAuth();
        if (!user) {
          setError("You must be logged in to view centers");
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const url =
          user.role === "admin"
            ? `${API_URL}/api/centers/${user.centerId}`
            : `${API_URL}/api/centers`;

        const response = await fetch(url, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const centersData = user.role === "admin" ? [data] : data;
        setCenters(centersData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch centers.");
        console.error("Error fetching centers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, [user, checkAuth]);

  const toggleSubCenterAccess = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/centers/${id}/subCenterAccess`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subCenterAccess: !currentStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const updatedCenter = await response.json();
      setCenters(centers.map((center) => (center._id === id ? updatedCenter : center)));
    } catch (err: any) {
      setError(err.message || "Failed to update sub-center access.");
      console.error("Error updating sub-center access:", err);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/centers/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !currentStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const updatedCenter = await response.json();
      setCenters(centers.map((center) => (center._id === id ? updatedCenter : center)));
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
      console.error("Error updating status:", err);
    }
  };

  const deleteCenter = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this center?")) return;

    try {
      const response = await fetch(`${API_URL}/api/centers/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      setCenters(centers.filter((center) => center._id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete center.");
      console.error("Error deleting center:", err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Center Management</h1>
          <div className="flex justify-center">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          </div>
          <p className="mt-3 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-4 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold mb-3 text-gray-800">Center Management</h1>
          <div className="text-red-600 text-sm font-medium">{error}</div>
        </div>
      </div>
    );
  if (centers.length === 0)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-4 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold mb-3 text-gray-800">Center Management</h1>
          <p className="text-gray-600 text-sm font-medium">No centers found.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Center Management</h1>
      <div className="bg-white rounded-xl shadow-xl overflow-x-auto animate-fade-in">
        <table className="min-w-[1200px] w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Password</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Sub-Center</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Wallet (₹)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Address</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {centers.map((center, index) => (
              <tr
                key={center._id}
                className={`transition-all duration-200 ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 hover:shadow-md`}
              >
                <td className="px-4 py-3 text-xs text-gray-800 font-medium whitespace-nowrap">{center.name || "N/A"}</td>
                <td className="px-4 py-3 text-xs text-gray-800 font-medium whitespace-nowrap">{center.email || "N/A"}</td>
                <td className="px-4 py-3 text-xs text-gray-800 font-medium whitespace-nowrap">{center.code || "N/A"}</td>
                <td className="px-4 py-3 text-xs text-gray-800 font-medium whitespace-nowrap">{center.password || "N/A"}</td>
                <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                  {user?.role === "superadmin" ? (
                    <button
                      onClick={() => toggleSubCenterAccess(center._id, center.subCenterAccess ?? false)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        center.subCenterAccess ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                          center.subCenterAccess ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  ) : (
                    <span className={`font-medium text-xs ${center.subCenterAccess ? "text-green-600" : "text-red-600"}`}>
                      {center.subCenterAccess ? "Enabled" : "Disabled"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-800 font-medium whitespace-nowrap">{center.contactNumber || "N/A"}</td>
                <td className="px-4 py-3 text-xs text-gray-800 font-medium whitespace-nowrap">
                  {(center.walletBalance ?? 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-xs text-gray-800 font-medium whitespace-nowrap">{center.address || "N/A"}</td>
                <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                  {user?.role === "superadmin" ? (
                    <button
                      onClick={() => toggleStatus(center._id, center.status ?? false)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        center.status ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                          center.status ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  ) : (
                    <span className={`font-medium text-xs ${center.status ? "text-green-600" : "text-red-600"}`}>
                      {center.status ? "Active" : "Inactive"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-800 whitespace-nowrap">
                  {user?.role === "superadmin" && (
                    <button
                      onClick={() => deleteCenter(center._id)}
                      className="text-red-500 hover:text-red-700 transform hover:scale-110 transition-transform duration-200"
                      title="Delete Center"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Allcenters;