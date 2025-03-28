import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Placeholder from "../components/Placeholder";
import EditModal from "../components/EditModal";

// Define the User type locally to include the token property
interface User {
  role: string;
  centerId?: string;
  token?: string; // Add the token property
}

type PaymentData = {
  _id: string;
  centerCode: string;
  centerName: string;
  paymentType: string;
  transactionId: string;
  amount: string;
  transactionDate: string;
  accountHolderName: string;
  beneficiary: string;
  paySlip: string;
  addedOn: string;
  status: "Pending" | "Approved" | "Rejected";
};

const OfflinePayments: React.FC = () => {
  // Type the useAuth hook to return a user with the User type
  const { user, checkAuth } = useAuth() as { user: User | null; checkAuth: () => Promise<void> };
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");

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

      try {
        const url =
          user.role === "admin"
            ? `${API_URL}/api/wallet/recharge?centerId=${user.centerId}`
            : `${API_URL}/api/wallet/recharge`;
        const response = await fetch(url, {
          credentials: "include", // Sends the cookie
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user?.token}`, // Now TypeScript recognizes the token property
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch payments");
        }

        const data: PaymentData[] = await response.json();
        setPayments(data);
      } catch (err: any) {
        setError(err.message || "Error fetching payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, checkAuth]);

  const updatePaymentStatus = async () => {
    if (!editPaymentId || !editStatus) return;

    try {
      const response = await fetch(`${API_URL}/api/wallet/recharge/${editPaymentId}/status`, {
        method: "PATCH",
        credentials: "include", // Sends the cookie
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`, // Now TypeScript recognizes the token property
        },
        body: JSON.stringify({ status: editStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update payment status");
      }

      const updatedPayment = await response.json();
      setPayments(
        payments.map((payment) =>
          payment._id === editPaymentId ? { ...payment, status: updatedPayment.data.status } : payment
        )
      );
      setIsModalOpen(false);
      setEditPaymentId(null);
      setEditStatus("");
      window.alert("Payment status updated successfully");
    } catch (err: any) {
      setError(err.message || "Error updating payment status");
    }
  };

  const openEditModal = (paymentId: string, currentStatus: string) => {
    if (user?.role !== "superadmin") {
      window.alert("Only superadmins can edit payment status");
      return;
    }
    setEditPaymentId(paymentId);
    setEditStatus(currentStatus);
    setIsModalOpen(true);
  };

  if (loading) return <Placeholder type="loading" />;
  if (error) return <Placeholder type="error" message={error} />;
  if (payments.length === 0) return <Placeholder type="empty" message="No payments found." />;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Offline Payments</h1>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">File</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Payment Type</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Transaction ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Txn Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Acc Holder</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Beneficiary</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Center</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Center Code</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Added On</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">
                  {payment.paySlip ? (
                    <a href={`${API_URL}/Backend/uploads/${payment.paySlip}`} target="_blank" rel="noopener noreferrer">
                      <img
                        src={`${API_URL}/Backend/uploads/${payment.paySlip}`}
                        alt="Pay Slip"
                        className="w-10 h-10 object-cover"
                      />
                    </a>
                  ) : (
                    "--"
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{payment.paymentType || "--"}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{payment.transactionId}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{payment.amount}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {new Date(payment.transactionDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{payment.accountHolderName || "--"}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{payment.beneficiary}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{payment.centerName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{payment.centerCode}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {new Date(payment.addedOn).toLocaleDateString()}
                </td>
                <td
                  className="px-6 py-4 text-sm text-gray-700 cursor-pointer"
                  onClick={() => openEditModal(payment._id, payment.status)}
                >
                  <span
                    className={`px-2 py-1 rounded ${
                      payment.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : payment.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">--</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={updatePaymentStatus}
        value={editStatus}
        onChange={setEditStatus}
         isDropdown={true} // Commented out previously
         dropdownOptions={["Pending", "Approved", "Rejected"]} // Commented out to resolve the error
      />
    </div>
  );
};

export default OfflinePayments;