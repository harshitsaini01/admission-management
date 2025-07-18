import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import {
  CreditCardIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  SparklesIcon,
  FunnelIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";

// Define the User type locally to include the token property
interface User {
  role: string;
  centerId?: string;
  token?: string;
}

type PaymentData = {
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
};

interface FilterState {
  status: 'all' | 'pending' | 'approved' | 'rejected';
  paymentType: 'all' | 'UPI' | 'Online' | 'Bank Transfer' | 'Cash';
  beneficiary: 'all' | 'Private' | 'University';
  search: string;
  dateRange: string;
}

const OfflinePayments: React.FC = () => {
  const { user, checkAuth } = useAuth() as { user: User | null; checkAuth: () => Promise<void> };
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    paymentType: 'all',
    beneficiary: 'all',
    search: '',
    dateRange: 'all'
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) {
        await checkAuth();
        if (!user) {
          setError("You must be logged in to view payments");
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);
      try {
        const url = user.role === "admin"
          ? `${API_URL}/api/wallet/recharge?centerId=${user.centerId}`
          : `${API_URL}/api/wallet/recharge`;
        
        const response = await fetch(url, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch payments");
        }

        const data: PaymentData[] = await response.json();
        setPayments(data);
        setFilteredPayments(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Error fetching payments";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, checkAuth]);

  // Filter payments based on search and filters
  useEffect(() => {
    let filtered = payments;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(payment =>
        payment.transactionId.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.centerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.centerCode.toLowerCase().includes(filters.search.toLowerCase()) ||
        payment.accountHolderName?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => payment.status.toLowerCase() === filters.status);
    }

    // Payment type filter
    if (filters.paymentType !== 'all') {
      filtered = filtered.filter(payment => payment.paymentType === filters.paymentType);
    }

    // Beneficiary filter
    if (filters.beneficiary !== 'all') {
      filtered = filtered.filter(payment => payment.beneficiary === filters.beneficiary);
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
      
      filtered = filtered.filter(payment => 
        new Date(payment.createdAt) >= filterDate
      );
    }

    setFilteredPayments(filtered);
  }, [payments, filters]);

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    const loadingToast = toast.loading('Updating payment status...');
    try {
      // Capitalize the status to match backend expectations
      const capitalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();
      
      const response = await fetch(`${API_URL}/api/wallet/recharge/${paymentId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ status: capitalizedStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update payment status");
      }

      const updatedPayment = await response.json();
      setPayments(payments.map(payment => 
        payment._id === paymentId ? { ...payment, status: updatedPayment.data.status } : payment
      ));
      
      toast.dismiss(loadingToast);
      toast.success(`Payment ${newStatus.toLowerCase()} successfully`);
      setIsModalOpen(false);
      setEditPaymentId(null);
      setEditStatus("");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error updating payment status";
      toast.dismiss(loadingToast);
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  const openEditModal = (paymentId: string, currentStatus: string) => {
    setEditPaymentId(paymentId);
    setEditStatus(currentStatus);
    setIsModalOpen(true);
  };

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

  const getStats = () => {
    const total = payments.length;
    const pending = payments.filter(p => p.status.toLowerCase() === 'pending').length;
    const approved = payments.filter(p => p.status.toLowerCase() === 'approved').length;
    const rejected = payments.filter(p => p.status.toLowerCase() === 'rejected').length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    return { total, pending, approved, rejected, totalAmount };
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Amount', 'Payment Type', 'Account Holder', 'Beneficiary', 'Center', 'Status', 'Transaction Date'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(payment => [
        payment.transactionId,
        payment.amount,
        payment.paymentType || '',
        payment.accountHolderName || '',
        payment.beneficiary,
        payment.centerName,
        payment.status,
        new Date(payment.transactionDate).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `offline_payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payment data exported successfully!');
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Loading Payments</h1>
          <p className="text-gray-600">Please wait while we fetch the payment data...</p>
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
            <h1 className="text-2xl font-bold mb-3 text-gray-900">Error Loading Payments</h1>
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
            <SparklesIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Offline Payments</h1>
          </div>
          <p className="text-gray-600 text-lg">Manage and monitor all offline payment transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Payments</p>
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
                  disabled={filteredPayments.length === 0}
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export CSV
                </button>
              </div>

              {/* Filters Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                  <select
                    value={filters.paymentType}
                    onChange={(e) => setFilters(prev => ({ ...prev, paymentType: e.target.value as FilterState['paymentType'] }))}
                    className="form-select w-full"
                  >
                    <option value="all">All Types</option>
                    <option value="UPI">UPI</option>
                    <option value="Online">Online</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
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
                  </select>
                </div>

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
                      search: '',
                      dateRange: 'all'
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

        {/* Payments Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Transaction Details</th>
                  <th>Payment Info</th>
                  <th>Center Details</th>
                  <th>Amount & Fee</th>
                  <th>Status</th>
                  <th>Dates</th>
                  {user?.role === "superadmin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    {/* Receipt */}
                    <td>
                      {payment.paySlip && payment.paySlip !== "system-registration" ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={`${API_URL}/uploads/${payment.paySlip}`}
                            alt="Pay Slip"
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-400 transition-all duration-200"
                            onClick={() => openImageModal(`${API_URL}/uploads/${payment.paySlip}`)}
                          />
                          <button
                            onClick={() => openImageModal(`${API_URL}/uploads/${payment.paySlip}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : payment.paymentType === "Initial Balance" ? (
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
                        <div className="font-semibold text-gray-900">{payment.transactionId}</div>
                        <div className="text-sm text-gray-500">
                          {payment.accountHolderName || "N/A"}
                        </div>
                      </div>
                    </td>

                    {/* Payment Info */}
                    <td>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.paymentType || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.beneficiary}
                        </div>
                      </div>
                    </td>

                    {/* Center Details */}
                    <td>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{payment.centerName}</div>
                        <div className="text-sm text-gray-500">Code: {payment.centerCode}</div>
                      </div>
                    </td>

                    {/* Amount & Fee */}
                    <td>
                      <div className="space-y-1">
                        <div className="font-semibold text-green-600">₹{payment.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Fee: ₹{payment.fee}</div>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>

                    {/* Dates */}
                    <td>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          Txn: {new Date(payment.transactionDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Added: {payment.createdAt && !isNaN(new Date(payment.createdAt).getTime()) 
                            ? new Date(payment.createdAt).toLocaleDateString() 
                            : "N/A"}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    {user?.role === "superadmin" && (
                      <td>
                        <button
                          onClick={() => openEditModal(payment._id, payment.status)}
                          className="btn btn-sm btn-secondary"
                        >
                          Edit Status
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Status Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}></div>
          <div className="card max-w-md w-full z-50">
            <div className="card-header">
              <h3 className="text-lg font-bold text-gray-900">Update Payment Status</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editPaymentId && updatePaymentStatus(editPaymentId, editStatus)}
                  className="btn btn-primary"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default OfflinePayments;