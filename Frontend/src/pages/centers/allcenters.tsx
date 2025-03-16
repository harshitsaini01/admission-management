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
  wallet: string;
  status: boolean;
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
        const response = await fetch(`${API_URL}/api/centers`, {
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data: CenterData[] = await response.json();
        setCenters(data);
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
          "Authorization": `Bearer ${user?.token}`,
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
          "Authorization": `Bearer ${user?.token}`,
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
          "Authorization": `Bearer ${user?.token}`,
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

  if (loading) return <div className="min-h-screen bg-gray-100 p-6"><h1 className="text-2xl font-bold mb-6 text-center">Center Management</h1><div className="text-center">Loading...</div></div>;
  if (error) return <div className="min-h-screen bg-gray-100 p-6"><h1 className="text-2xl font-bold mb-6 text-center">Center Management</h1><div className="text-center text-red-500">{error}</div></div>;
  if (centers.length === 0) return <div className="min-h-screen bg-gray-100 p-6"><h1 className="text-2xl font-bold mb-6 text-center">Center Management</h1><div className="bg-white rounded-lg shadow-md p-6 text-center"><p className="text-gray-600">No centers found.</p></div></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Center Management</h1>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-[1200px] w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Password</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Sub-Center Access</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Contact Number</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Wallet</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {centers.map((center) => (
              <tr key={center._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{center.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{center.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{center.code}</td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{center.password}</td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                  <button
                    onClick={() => toggleSubCenterAccess(center._id, center.subCenterAccess)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      center.subCenterAccess ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        center.subCenterAccess ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{center.contactNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{center.wallet}</td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                  <button
                    onClick={() => toggleStatus(center._id, center.status)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      center.status ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        center.status ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                  <button
                    onClick={() => deleteCenter(center._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Center"
                  >
                    <FaTrash />
                  </button>
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