import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from 'react-hot-toast';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyRupeeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

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
  createdAt?: string;
  updatedAt?: string;
};

interface FilterState {
  status: 'all' | 'active' | 'inactive';
  subCenterAccess: 'all' | 'enabled' | 'disabled';
  search: string;
}

const Allcenters: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const [centers, setCenters] = useState<CenterData[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<CenterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    subCenterAccess: 'all',
    search: ''
  });

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
        setFilteredCenters(centersData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch centers.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Error fetching centers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, [user, checkAuth]);

  // Filter centers based on search and filters
  useEffect(() => {
    let filtered = centers;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        center.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        center.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        center.contactNumber?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(center =>
        filters.status === 'active' ? center.status : !center.status
      );
    }

    // Sub-center access filter
    if (filters.subCenterAccess !== 'all') {
      filtered = filtered.filter(center =>
        filters.subCenterAccess === 'enabled' ? center.subCenterAccess : !center.subCenterAccess
      );
    }

    setFilteredCenters(filtered);
  }, [centers, filters]);

  const toggleSubCenterAccess = async (id: string, currentStatus: boolean) => {
    const loadingToast = toast.loading('Updating sub-center access...');
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
      toast.dismiss(loadingToast);
      toast.success(`Sub-center access ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update sub-center access.";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
      console.error("Error updating sub-center access:", err);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const loadingToast = toast.loading('Updating center status...');
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
      toast.dismiss(loadingToast);
      toast.success(`Center ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update status.";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
      console.error("Error updating status:", err);
    }
  };

  const deleteCenter = async (id: string, centerName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${centerName}"? This action cannot be undone.`)) return;

    const loadingToast = toast.loading('Deleting center...');
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
      toast.dismiss(loadingToast);
      toast.success(`Center "${centerName}" deleted successfully`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete center.";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
      console.error("Error deleting center:", err);
    }
  };

  const togglePasswordVisibility = (centerId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [centerId]: !prev[centerId]
    }));
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Code', 'Contact Number', 'Wallet Balance', 'Address', 'Status', 'Sub-Center Access'];
    const csvContent = [
      headers.join(','),
      ...filteredCenters.map(center => [
        center.name,
        center.email,
        center.code,
        center.contactNumber || '',
        center.walletBalance,
        center.address || '',
        center.status ? 'Active' : 'Inactive',
        center.subCenterAccess ? 'Enabled' : 'Disabled'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `centers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Centers data exported successfully!');
  };

  const getStats = () => {
    const total = centers.length;
    const active = centers.filter(c => c.status).length;
    const inactive = total - active;
    const subCenterEnabled = centers.filter(c => c.subCenterAccess).length;
    const totalWallet = centers.reduce((sum, c) => sum + (c.walletBalance || 0), 0);

    return { total, active, inactive, subCenterEnabled, totalWallet };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Loading Centers</h1>
          <p className="text-gray-600">Please wait while we fetch the center data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <div className="card-body text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3 text-gray-900">Error Loading Centers</h1>
            <div className="alert alert-error">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (centers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <div className="card-body text-center">
            <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3 text-gray-900">No Centers Found</h1>
            <p className="text-gray-600 mb-4">There are no centers to display at the moment.</p>
            {user?.role === "superadmin" && (
              <a href="/add-center" className="btn btn-primary">
                <PlusIcon className="w-4 h-4" />
                Add New Center
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Center Management</h1>
          </div>
          <p className="text-gray-600 text-lg">Manage and monitor all admission centers</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Centers</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <BuildingOfficeIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card stats-card-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Active Centers</p>
                <p className="text-3xl font-bold text-white">{stats.active}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card stats-card-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Inactive Centers</p>
                <p className="text-3xl font-bold text-white">{stats.inactive}</p>
              </div>
              <XCircleIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card stats-card-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Sub-Center Access</p>
                <p className="text-3xl font-bold text-white">{stats.subCenterEnabled}</p>
              </div>
              <BuildingOfficeIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Wallet</p>
                <p className="text-2xl font-bold text-white">₹{stats.totalWallet.toLocaleString()}</p>
              </div>
              <CurrencyRupeeIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex flex-col gap-6">
              {/* Search Section */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search centers by name, email, code, or contact..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="form-input pl-10 w-full"
                  />
                </div>
              </div>

              {/* Filters Section */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterState['status'] }))}
                    className="form-select w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Centers</option>
                    <option value="inactive">Inactive Centers</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sub-Center Access</label>
                  <select
                    value={filters.subCenterAccess}
                    onChange={(e) => setFilters(prev => ({ ...prev, subCenterAccess: e.target.value as FilterState['subCenterAccess'] }))}
                    className="form-select w-full"
                  >
                    <option value="all">All Sub-Center Access</option>
                    <option value="enabled">Sub-Center Enabled</option>
                    <option value="disabled">Sub-Center Disabled</option>
                  </select>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                  <div className="flex gap-3">
                    <button
                      onClick={exportToCSV}
                      className="btn btn-secondary flex-1"
                      disabled={filteredCenters.length === 0}
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Export CSV
                    </button>
                    {user?.role === "superadmin" && (
                      <a href="/add-center" className="btn btn-primary flex-1">
                        <PlusIcon className="w-4 h-4" />
                        Add Center
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Centers Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Center Details</th>
                  <th>Contact Info</th>
                  <th>Credentials</th>
                  <th>Wallet Balance</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  {user?.role === "superadmin" && <th>Actions</th>}
            </tr>
          </thead>
              <tbody>
                {filteredCenters.map((center) => (
                  <tr key={center._id}>
                    {/* Center Details */}
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{center.name}</div>
                          <div className="text-sm text-gray-500">Code: {center.code}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          {center.email}
                        </div>
                        {center.contactNumber && (
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            {center.contactNumber}
                          </div>
                        )}
                        {center.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="w-4 h-4 mr-2" />
                            <span className="truncate max-w-32">{center.address}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Credentials */}
                    <td>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {showPasswords[center._id] ? center.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(center._id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords[center._id] ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Wallet Balance */}
                    <td>
                      <div className="flex items-center">
                        <CurrencyRupeeIcon className="w-4 h-4 text-green-600 mr-1" />
                        <span className="font-semibold text-green-600">
                          {(center.walletBalance || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>

                    {/* Permissions */}
                    <td>
                  {user?.role === "superadmin" ? (
                    <button
                          onClick={() => toggleSubCenterAccess(center._id, center.subCenterAccess)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        center.subCenterAccess ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                          center.subCenterAccess ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          center.subCenterAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {center.subCenterAccess ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </td>

                    {/* Status */}
                    <td>
                  {user?.role === "superadmin" ? (
                    <button
                          onClick={() => toggleStatus(center._id, center.status)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                            center.status ? "bg-green-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                          center.status ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          center.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {center.status ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </td>

                    {/* Actions */}
                  {user?.role === "superadmin" && (
                      <td>
                    <button
                          onClick={() => deleteCenter(center._id, center.name)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Center"
                    >
                          <TrashIcon className="w-4 h-4" />
                    </button>
                      </td>
                  )}
              </tr>
            ))}
          </tbody>
        </table>
          </div>

          {filteredCenters.length === 0 && (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No centers found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Allcenters;