import React, { useState } from 'react';

type FormData = {
  name: string;
  email: string;
  code: string;
  subCenterAccess: boolean;
  status: boolean;
  contactNumber: string;
  wallet: string;
  password: string;
};

const Addcenter: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    code: '',
    subCenterAccess: false,
    status: false,
    contactNumber: '',
    wallet: '',
    password: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'select-one' ? value === 'yes' : value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Send form data to the backend
      const response = await fetch('YOUR_BACKEND_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Form submitted successfully!');
        // Handle success (e.g., show a success message or redirect)
      } else {
        console.error('Form submission failed!');
        // Handle error (e.g., show an error message)
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full ">
        <h1 className="text-2xl font-bold mb-6 text-center">Register Center</h1>

        {/* Name, Email, Code in one line */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name*</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter Name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter Email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Code*</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter Code"
              required
            />
          </div>
        </div>

        {/* Contact Number, Wallet, Password in one line */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Number*</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter Contact Number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Wallet*</label>
            <input
              type="text"
              name="wallet"
              value={formData.wallet}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter Wallet"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password*</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Enter Password"
              required
            />
          </div>
        </div>

        {/* Sub-Center Access and Status in one line */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub-Center Access*</label>
            <select
              name="subCenterAccess"
              value={formData.subCenterAccess ? 'yes' : 'no'}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status*</label>
            <select
              name="status"
              value={formData.status ? 'yes' : 'no'}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}

        <div className="flex justify-center mt-18"> {/* Container for centering */}
        <button
          type="submit"
          className="w-1/8 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
        
      </form>
    </div>
  );
};

export default Addcenter;