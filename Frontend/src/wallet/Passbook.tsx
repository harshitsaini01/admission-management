import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
  FunnelIcon,
  PhotoIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";

// Define the User type locally to include the token property
interface User {
  role: string;
  centerId?: string;
  token?: string;
}

type TransactionData = {
  _id: string;
  transactionId: string;
  amount: number;
  transactionDate: string;
  paymentType?: string;
  accountHolderName?: string;
  beneficiary: string;
  centerName: string;
  centerCode: string;
  status: string;
  fee: number;
  paySlip?: string;
  createdAt: string;
  type: 'offline' | 'online'; // To distinguish transaction types
};

interface FilterState {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  paymentType: 'all' | 'UPI' | 'Online' | 'Bank Transfer' | 'Cash' | 'Initial Balance';
  beneficiary: 'all' | 'Private' | 'University' | 'Registration';
  transactionType: 'all' | 'offline' | 'online' | 'registration';
  search: string;
  dateRange: string;
  centerCode: string;
}

interface Center {
  _id: string;
  code: string;
  name: string;
  university: string;
  walletBalance: number;
}

const Passbook: React.FC = () => {
  const { user, checkAuth } = useAuth() as { user: User | null; checkAuth: () => Promise<void> };
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [centers, setCenters] = useState<Center[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    paymentType: 'all',
    beneficiary: 'all',
    transactionType: 'all',
    search: '',
    dateRange: 'all',
    centerCode: 'all'
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        await checkAuth();
        if (!user) {
          setError("You must be logged in to view passbook");
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      
      try {
        // Fetch offline payments
        const offlineUrl = user.role === "admin"
          ? `${API_URL}/api/wallet/recharge?centerId=${user.centerId}`
          : `${API_URL}/api/wallet/recharge`;
        
        const offlineResponse = await fetch(offlineUrl, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
        });

        let offlineData: TransactionData[] = [];
        if (offlineResponse.ok) {
          const rawOfflineData: TransactionData[] = await offlineResponse.json();
          offlineData = rawOfflineData.map((item: TransactionData) => ({
            ...item,
            type: 'offline' as const
          }));
        }

        // For superadmin, also fetch centers list
        if (user.role === "superadmin") {
          const centersResponse = await fetch(`${API_URL}/api/wallet/centers`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${user?.token}`,
            },
          });

          if (centersResponse.ok) {
            const centersData = await centersResponse.json();
            setCenters(centersData);
          }
        }

        // TODO: Add online transactions when available
        // const onlineData = await fetchOnlineTransactions();

        const allTransactions = [...offlineData];
        setTransactions(allTransactions);
        setFilteredTransactions(allTransactions);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error fetching passbook data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, checkAuth]);

  // Filter transactions based on search and filters
  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(transaction =>
        transaction.transactionId.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.centerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.centerCode.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.accountHolderName?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(transaction => transaction.status.toLowerCase() === filters.status);
    }

    // Payment type filter
    if (filters.paymentType !== 'all') {
      filtered = filtered.filter(transaction => transaction.paymentType === filters.paymentType);
    }

    // Beneficiary filter
    if (filters.beneficiary !== 'all') {
      filtered = filtered.filter(transaction => transaction.beneficiary === filters.beneficiary);
    }

    // Transaction type filter
    if (filters.transactionType !== 'all') {
      if (filters.transactionType === 'registration') {
        filtered = filtered.filter(transaction => transaction.paymentType === 'Initial Balance');
      } else {
        filtered = filtered.filter(transaction => transaction.type === filters.transactionType && transaction.paymentType !== 'Initial Balance');
      }
    }

    // Center filter (for superadmin)
    if (filters.centerCode !== 'all') {
      filtered = filtered.filter(transaction => transaction.centerCode === filters.centerCode);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(transaction => 
        new Date(transaction.createdAt) >= filterDate
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string, paymentType?: string) => {
    if (paymentType === "Initial Balance") {
      return 'bg-purple-100 text-purple-800';
    }
    switch (type) {
      case 'offline':
        return 'bg-blue-100 text-blue-800';
      case 'online':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeLabel = (paymentType?: string) => {
    if (paymentType === "Initial Balance") {
      return "Registration";
    }
    return "Offline";
  };

  const getStats = () => {
    const total = transactions.length;
    const pending = transactions.filter(t => t.status.toLowerCase() === 'pending').length;
    const approved = transactions.filter(t => t.status.toLowerCase() === 'approved').length;
    const rejected = transactions.filter(t => t.status.toLowerCase() === 'rejected').length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const offline = transactions.filter(t => t.type === 'offline' && t.paymentType !== 'Initial Balance').length;
    const online = transactions.filter(t => t.type === 'online').length;
    const registration = transactions.filter(t => t.paymentType === 'Initial Balance').length;

    return { total, pending, approved, rejected, totalAmount, offline, online, registration };
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Transaction ID', 'Type', 'Amount', 'Payment Type', 'Account Holder', 'Beneficiary', 'Center', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(transaction => [
        new Date(transaction.transactionDate).toLocaleDateString(),
        transaction.transactionId,
        transaction.type,
        transaction.amount,
        transaction.paymentType || '',
        transaction.accountHolderName || '',
        transaction.beneficiary,
        `${transaction.centerCode} - ${transaction.centerName}`,
        transaction.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `passbook_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Passbook data exported successfully!');
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Loading Passbook</h1>
          <p className="text-gray-600">Please wait while we fetch your transaction history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <div className="card-body text-center">
            <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3 text-gray-900">Error Loading Passbook</h1>
            <div className="alert alert-error">{error}</div>
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
            <BookOpenIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              {user?.role === "superadmin" ? "Complete Passbook" : "My Passbook"}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {user?.role === "superadmin" 
              ? "Complete transaction history across all centers" 
              : "Your complete transaction history and wallet activity"
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6 mb-8">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <CreditCardIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card stats-card-warning">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Pending</p>
                <p className="text-3xl font-bold text-white">{stats.pending}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card stats-card-success">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Approved</p>
                <p className="text-3xl font-bold text-white">{stats.approved}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card stats-card-error">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-white">{stats.rejected}</p>
              </div>
              <XCircleIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card stats-card-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-white">₹{stats.totalAmount.toLocaleString()}</p>
              </div>
              <CurrencyRupeeIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Offline</p>
                <p className="text-3xl font-bold text-white">{stats.offline}</p>
              </div>
              <BuildingOfficeIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Online</p>
                <p className="text-3xl font-bold text-white">{stats.online}</p>
              </div>
              <SparklesIcon className="w-8 h-8 text-white/60" />
            </div>
          </div>
          <div className="stats-card" style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Registration</p>
                <p className="text-3xl font-bold text-white">{stats.registration}</p>
              </div>
              <SparklesIcon className="w-8 h-8 text-white/60" />
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
                    placeholder="Search by transaction ID, center, or account holder..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="form-input pl-10 w-full"
                  />
                </div>
                <button
                  onClick={exportToCSV}
                  className="btn btn-secondary"
                  disabled={filteredTransactions.length === 0}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              {/* Filters Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as FilterState['status'] }))}
                    className="form-select w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.transactionType}
                    onChange={(e) => setFilters(prev => ({ ...prev, transactionType: e.target.value as FilterState['transactionType'] }))}
                    className="form-select w-full"
                  >
                    <option value="all">All Types</option>
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="registration">Registration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={filters.paymentType}
                    onChange={(e) => setFilters(prev => ({ ...prev, paymentType: e.target.value as FilterState['paymentType'] }))}
                    className="form-select w-full"
                  >
                    <option value="all">All Methods</option>
                    <option value="UPI">UPI</option>
                    <option value="Online">Online</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Initial Balance">Initial Balance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiary</label>
                  <select
                    value={filters.beneficiary}
                    onChange={(e) => setFilters(prev => ({ ...prev, beneficiary: e.target.value as FilterState['beneficiary'] }))}
                    className="form-select w-full"
                  >
                    <option value="all">All Beneficiaries</option>
                    <option value="Private">Private</option>
                    <option value="University">University</option>
                    <option value="Registration">Registration</option>
                  </select>
                </div>

                {user?.role === "superadmin" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Center</label>
                    <select
                      value={filters.centerCode}
                      onChange={(e) => setFilters(prev => ({ ...prev, centerCode: e.target.value }))}
                      className="form-select w-full"
                    >
                      <option value="all">All Centers</option>
                      {centers.map(center => (
                        <option key={center._id} value={center.code}>
                          {center.code} - {center.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="form-select w-full"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({
                      status: 'all',
                      paymentType: 'all',
                      beneficiary: 'all',
                      transactionType: 'all',
                      search: '',
                      dateRange: 'all',
                      centerCode: 'all'
                    })}
                    className="btn btn-secondary w-full"
                  >
                    <FunnelIcon className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Transaction Details</th>
                  <th>Type & Method</th>
                  <th>Center Details</th>
                  <th>Amount & Fee</th>
                  <th>Status</th>
                  <th>Dates</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    {/* Receipt */}
                    <td>
                      {transaction.paySlip && transaction.paySlip !== "system-registration" ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={`${API_URL}/uploads/${transaction.paySlip}`}
                            alt="Pay Slip"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-all duration-200"
                            onClick={() => openImageModal(`${API_URL}/uploads/${transaction.paySlip}`)}
                          />
                          <button
                            onClick={() => openImageModal(`${API_URL}/uploads/${transaction.paySlip}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : transaction.paymentType === "Initial Balance" ? (
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                          <SparklesIcon className="w-6 h-6 text-purple-600" />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                          <PhotoIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>

                    {/* Transaction Details */}
                    <td>
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{transaction.transactionId}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.accountHolderName || "N/A"}
                        </div>
                      </div>
                    </td>

                    {/* Type & Method */}
                    <td>
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(transaction.type, transaction.paymentType)}`}>
                          {getTransactionTypeLabel(transaction.paymentType)}
                        </span>
                        <div className="text-sm text-gray-600">
                          {transaction.paymentType || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.beneficiary}
                        </div>
                      </div>
                    </td>

                    {/* Center Details */}
                    <td>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{transaction.centerName}</div>
                        <div className="text-sm text-gray-500">Code: {transaction.centerCode}</div>
                      </div>
                    </td>

                    {/* Amount & Fee */}
                    <td>
                      <div className="space-y-1">
                        <div className="font-semibold text-green-600">₹{transaction.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Fee: ₹{transaction.fee}</div>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>

                    {/* Dates */}
                    <td>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 flex items-center">
                          <CalendarDaysIcon className="w-4 h-4 mr-1 text-gray-400" />
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Added: {transaction.createdAt && !isNaN(new Date(transaction.createdAt).getTime()) 
                            ? new Date(transaction.createdAt).toLocaleDateString() 
                            : "N/A"}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setIsImageModalOpen(false)}></div>
          <div className="relative z-50 max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-2 right-2 text-white text-2xl bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700 transition-colors z-10"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Payment Receipt"
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Passbook; 