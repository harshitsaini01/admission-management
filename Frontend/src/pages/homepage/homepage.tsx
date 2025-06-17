import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface DashboardStats {
  [session: string]: {
    totalApplications: number;
    totalEnrolled: number;
    totalProcessed: number;
    totalPending: number;
    totalCenters: number;
  };
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: number;
  color: 'primary' | 'success' | 'warning' | 'secondary';
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color, description }) => {
  const colorClasses = {
    primary: 'stats-card',
    success: 'stats-card stats-card-success',
    warning: 'stats-card stats-card-warning',
    secondary: 'stats-card stats-card-secondary'
  };

  return (
    <div className={`${colorClasses[color]} animate-scale-in`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center text-sm">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>
      <div className="mb-2">
        <h3 className="text-3xl font-bold">{value.toLocaleString()}</h3>
        <p className="text-white/80 text-sm font-medium">{title}</p>
      </div>
      {description && (
        <p className="text-white/60 text-xs">{description}</p>
      )}
    </div>
  );
};

const HomePage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard stats.";
        setError(errorMessage);
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, [user, checkAuth]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="alert alert-error max-w-md">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  const currentSession = "Jan-2025";
  const previousSession = "Jan-2024";
  const currentStats = stats?.[currentSession] || {
    totalApplications: 0,
    totalEnrolled: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalCenters: 0
  };
  const previousStats = stats?.[previousSession] || {
    totalApplications: 0,
    totalEnrolled: 0,
    totalProcessed: 0,
    totalPending: 0,
    totalCenters: 0
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.role === "superadmin" ? "Super Admin" : "Admin"}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your admission management system today.
              </p>
            </div>
            <div className="text-right animate-fade-in">
              <div className="flex items-center text-gray-500 text-sm mb-1">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>Last updated: {currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Applications"
            value={currentStats.totalApplications || 0}
            icon={DocumentTextIcon}
            trend={calculateTrend(currentStats.totalApplications || 0, previousStats.totalApplications || 0)}
            color="primary"
            description="Applications received this session"
          />
          <StatCard
            title="Students Enrolled"
            value={currentStats.totalEnrolled || 0}
            icon={AcademicCapIcon}
            trend={calculateTrend(currentStats.totalEnrolled || 0, previousStats.totalEnrolled || 0)}
            color="success"
            description="Successfully enrolled students"
          />
          <StatCard
            title="Pending Applications"
            value={currentStats.totalPending || 0}
            icon={ClockIcon}
            trend={calculateTrend(currentStats.totalPending || 0, previousStats.totalPending || 0)}
            color="warning"
            description="Awaiting review and processing"
          />
          <StatCard
            title="Active Centers"
            value={currentStats.totalCenters || 0}
            icon={UserGroupIcon}
            color="secondary"
            description="Registered admission centers"
          />
        </div>

        {/* Session Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Session */}
          <div className="card animate-slide-up">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Current Session: {currentSession}</h2>
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-700">Total Applications</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{currentStats.totalApplications || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <AcademicCapIcon className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-gray-700">Total Enrolled</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{currentStats.totalEnrolled || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-700">Total Processed</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{currentStats.totalProcessed || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="font-medium text-gray-700">Total Pending</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{currentStats.totalPending || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Session */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Previous Session: {previousSession}</h2>
                <div className="flex items-center text-gray-500">
                  <ClockIcon className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-700">Total Applications</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{previousStats.totalApplications || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <AcademicCapIcon className="w-5 h-5 text-green-600 mr-3" />
                    <span className="font-medium text-gray-700">Total Enrolled</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{previousStats.totalEnrolled || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="w-5 h-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-700">Total Processed</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{previousStats.totalProcessed || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="w-5 h-5 text-orange-600 mr-3" />
                    <span className="font-medium text-gray-700">Total Pending</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{previousStats.totalPending || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Centers Overview */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2 text-blue-600" />
                Centers Overview
              </h3>
            </div>
            <div className="card-body">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {currentStats.totalCenters || 0}
                </div>
                <p className="text-gray-600">Active Centers</p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Managing admissions across all registered centers
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Rate */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2 text-green-600" />
                Processing Rate
              </h3>
            </div>
            <div className="card-body">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {currentStats.totalApplications > 0 
                    ? Math.round((currentStats.totalProcessed / currentStats.totalApplications) * 100)
                    : 0}%
                </div>
                <p className="text-gray-600">Applications Processed</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${currentStats.totalApplications > 0 
                        ? (currentStats.totalProcessed / currentStats.totalApplications) * 100
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <a href="/student-application-foam" className="btn btn-primary w-full">
                  <DocumentTextIcon className="w-4 h-4" />
                  New Application
                </a>
                <a href="/students" className="btn btn-secondary w-full">
                  <AcademicCapIcon className="w-4 h-4" />
                  View Students
                </a>
                {user?.role === "superadmin" && (
                  <a href="/add-center" className="btn btn-secondary w-full">
                    <UserGroupIcon className="w-4 h-4" />
                    Add Center
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;