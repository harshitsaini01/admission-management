import React from 'react';

type StudentData = {
  actions: string;
  applicationStatus: string;
  processedOn: string;
  photo: string; // URL or base64 image
  referenceId: string;
  applicationNumber: string;
  enrollmentNumber: string;
  docStatus: string;
  admType: string;
  session: string;
  studentStatus: string;
  name: string;
};

const Allstudents: React.FC = () => {
  // Sample data (replace with data fetched from the backend)
  const students: StudentData[] = [
    {
      actions: 'Edit | Delete',
      applicationStatus: 'Enrolled',
      processedOn: '29-01-2025',
      photo: 'https://via.placeholder.com/50', // Placeholder image URL
      referenceId: '1285856',
      applicationNumber: 'M01247217',
      enrollmentNumber: '12406669',
      docStatus: 'Verified',
      admType: 'Fresh',
      session: 'Jan-2024',
      studentStatus: 'Active',
      name: 'RAVI KUMAR SAN',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Students Management</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Actions</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Application Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Processed On</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Photo</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Reference ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Application Number</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Enrollment Number</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Doc Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Adm Type</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Session</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Student Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 ">Name</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-700">{student.actions}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.applicationStatus}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.processedOn}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <img
                    src={student.photo}
                    alt="Student Photo"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.referenceId}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.applicationNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.enrollmentNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.docStatus}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.admType}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.session}</td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      student.studentStatus === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {student.studentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{student.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Allstudents;