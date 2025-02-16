import React, { useState } from 'react';

type CenterData = {
  name: string;
  email: string;
  code: string;
  password: string;
  subCenterAccess: boolean; // Toggle for Sub-Center Access
  contactNumber: string;
  wallet: string;
  status: boolean; // Toggle for Status (Active/Inactive)
  action: string;
};

const Allcenters: React.FC = () => {
  // Sample data (replace with data fetched from the backend)
  const [centers, setCenters] = useState<CenterData[]>([
    {
      name: 'RAVI',
      email: 'pjsj**********com',
      code: '3347',
      password: '*********',
      subCenterAccess: true, // Toggle state for Sub-Center Access
      contactNumber: '7845125896',
      wallet: 'Current Balance: ₹ 0 | Loans: ₹ 0',
      status: true, // Toggle state for Status (Active/Inactive)
      action: 'Edit | Delete',
    },
    {
      name: 'RS VERMA',
      email: 'verma**********t_com',
      code: '3343',
      password: '*********',
      subCenterAccess: false, // Toggle state for Sub-Center Access
      contactNumber: '7845123698',
      wallet: 'Current Balance: ₹ 0 | Loans: ₹ 0',
      status: false, // Toggle state for Status (Active/Inactive)
      action: 'Edit | Delete',
    },
  ]);

  // Function to toggle sub-center access
  const toggleSubCenterAccess = (index: number) => {
    const updatedCenters = [...centers];
    updatedCenters[index].subCenterAccess = !updatedCenters[index].subCenterAccess;
    setCenters(updatedCenters);
  };

  // Function to toggle status
  const toggleStatus = (index: number) => {
    const updatedCenters = [...centers];
    updatedCenters[index].status = !updatedCenters[index].status;
    setCenters(updatedCenters);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Center Management</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
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
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {centers.map((center, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{center.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{center.email}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{center.code}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{center.password}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <button
                    onClick={() => toggleSubCenterAccess(index)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      center.subCenterAccess ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        center.subCenterAccess ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{center.contactNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{center.wallet}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <button
                    onClick={() => toggleStatus(index)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      center.status ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        center.status ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{center.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Allcenters;