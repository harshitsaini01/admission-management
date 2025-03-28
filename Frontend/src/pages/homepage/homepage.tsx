import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface DashboardStats {
  [session: string]: {
    totalApplications: number;
    totalEnrolled: number;
    totalProcessed: number;
    totalPending: number;
    totalCenters: number;
  };
}

const HomePage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) {
        await checkAuth();
        if (!user) {
          setError("You must be logged in to view the dashboard");
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/centers/dashboard/stats`, {
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
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch dashboard stats.");
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [user, checkAuth]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="flex-1 p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <div className="flex-1 p-8">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 bg-gray-100 p-8">
        <h1 className="text-xl text-gray-600 mb-6">
          Hi {user?.role === "superadmin" ? "Sourav" : "Admin"}, Welcome back!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">SESSION: JAN-2024</h2>
            <ul className="space-y-2 text-gray-700">
              <li>● Total Application: {stats?.["Jan-2024"]?.totalApplications || 0}</li>
              <li>● Total Enrolled: {stats?.["Jan-2024"]?.totalEnrolled || 0}</li>
              <li>● Total Processed: {stats?.["Jan-2024"]?.totalProcessed || 0}</li>
              <li>● Total Pending: {stats?.["Jan-2024"]?.totalPending || 0}</li>
              <li>● Total Centers: {stats?.["Jan-2024"]?.totalCenters || 0}</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">SESSION: JAN-2025</h2>
            <ul className="space-y-2 text-gray-700">
              <li>● Total Application: {stats?.["Jan-2025"]?.totalApplications || 0}</li>
              <li>● Total Enrolled: {stats?.["Jan-2025"]?.totalEnrolled || 0}</li>
              <li>● Total Processed: {stats?.["Jan-2025"]?.totalProcessed || 0}</li>
              <li>● Total Pending: {stats?.["Jan-2025"]?.totalPending || 0}</li>
              <li>● Total Centers: {stats?.["Jan-2025"]?.totalCenters || 0}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <h2 className="text-lg font-semibold">CENTERS</h2>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">{stats?.["Jan-2024"]?.totalCenters || 0}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-2">
            <h3 className="text-lg font-semibold">SUB-COUNSELLOR</h3>
            <span className="text-2xl font-bold">0</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;